#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const DOC_PATH = resolve(ROOT, 'docs/feature-workflow.md');
const SKILL_PATHS = [
  resolve(ROOT, '.codex/skills/feature-explore/SKILL.md'),
  resolve(ROOT, '.codex/skills/feature-formalize/SKILL.md'),
];
const CHECKLIST_PATH = resolve(
  ROOT,
  '.codex/skills/feature-formalize/references/architecture-review-checklist.md'
);

const REQUIRED_PROMPT_KEYS = [
  'STEP:',
  'DECISION:',
  'RECOMMENDED:',
  'IF RECOMMENDED:',
  'ALTERNATIVE:',
  'STATUS:',
];

const REQUIRED_OUTCOMES = ['success', 'needs-input', 'blocked', 'aborted'];
const REQUIRED_ANCHOR = 'docs/feature-workflow.md#prompt-contract';

const errors = [];

const read = (p) => readFileSync(p, 'utf8');

const docs = read(DOC_PATH);
if (!docs.includes('id="prompt-contract"') && !docs.includes('## Prompt Contract')) {
  errors.push('docs/feature-workflow.md must include prompt contract anchor/heading.');
}

for (const key of REQUIRED_PROMPT_KEYS) {
  if (!docs.includes('`' + key + '`')) {
    errors.push(`docs/feature-workflow.md missing prompt key: ${key}`);
  }
}

for (const outcome of REQUIRED_OUTCOMES) {
  if (!docs.includes('`' + outcome + '`')) {
    errors.push(`docs/feature-workflow.md missing outcome: ${outcome}`);
  }
}

for (const skillPath of SKILL_PATHS) {
  const text = read(skillPath);
  if (!text.includes(REQUIRED_ANCHOR)) {
    errors.push(`${skillPath} must reference ${REQUIRED_ANCHOR}`);
  }

  const keyRedefinitions = REQUIRED_PROMPT_KEYS.filter((key) => text.includes(key));
  if (keyRedefinitions.length > 0) {
    errors.push(`${skillPath} redefines prompt keys (${keyRedefinitions.join(', ')}); keep contract only in docs.`);
  }

  const lowerStatuses = ['green', 'yellow', 'red'];
  for (const status of lowerStatuses) {
    if (text.match(new RegExp(`\\b${status}\\b`))) {
      errors.push(`${skillPath} contains lowercase architecture status '${status}'. Use uppercase.`);
    }
  }

  const lines = text.split('\n');
  lines.forEach((line, idx) => {
    if (line.length > 140) {
      errors.push(`${skillPath}:${idx + 1} exceeds 140 chars.`);
    }
  });
}

const checklist = read(CHECKLIST_PATH);
for (const status of ['GREEN', 'YELLOW', 'RED']) {
  if (!checklist.includes('`' + status + '`')) {
    errors.push(`Checklist missing uppercase status: ${status}`);
  }
}

if (checklist.match(/\bgreen\b|\byellow\b|\bred\b/)) {
  errors.push('Checklist contains lowercase architecture statuses; use uppercase only.');
}

if (errors.length > 0) {
  console.error('Prompt validation failed:');
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log('Prompt validation passed.');
