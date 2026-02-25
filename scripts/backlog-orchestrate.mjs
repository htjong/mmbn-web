#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const BACKLOG_DIR = path.join(ROOT, 'kanban', 'backlog');
const REPORT_DIR = path.join(ROOT, 'kanban', 'reports');
const EVIDENCE_DIR = path.join(BACKLOG_DIR, 'evidence');

const REQUIRED_SECTIONS = [
  '## Mode',
  '## Description',
  '## Acceptance Criteria',
  '## Notes',
  '## Architecture Review'
];

const STAGE = {
  INTAKE: 'intake',
  ASSUMPTION_SNAPSHOT: 'assumption_snapshot',
  TDD_RED: 'tdd_red',
  TDD_GREEN: 'tdd_green',
  TDD_REFACTOR: 'tdd_refactor',
  VALIDATING: 'validating',
  REVIEWING: 'reviewing',
  ASSUMPTION_DIFF: 'assumption_diff',
  PACKAGING: 'packaging'
};

const STATE = {
  QUEUED: 'queued',
  INTAKE_FAILED: 'intake_failed',
  ANALYZING: 'analyzing',
  IMPLEMENTING: 'implementing',
  VALIDATING: 'validating',
  REVIEWING: 'reviewing',
  PACKAGING: 'packaging',
  READY: 'ready-for-pr',
  BLOCKED: 'blocked',
  FAILED: 'failed'
};

const STATUS = {
  SUCCESS: 'success',
  NEEDS_INPUT: 'needs-input',
  BLOCKED: 'blocked',
  ABORTED: 'aborted'
};

function parseArgs(argv) {
  const args = {
    mode: 'dry',
    card: null,
    maxRetries: 3,
    timeoutMs: 15 * 60 * 1000,
    allowNonKeyfileChanges: false
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--mode') args.mode = argv[++i] ?? 'dry';
    if (token === '--execute') args.mode = 'execute';
    if (token === '--card') args.card = argv[++i] ?? null;
    if (token === '--max-retries') args.maxRetries = Number(argv[++i] ?? 3);
    if (token === '--timeout-ms') args.timeoutMs = Number(argv[++i] ?? 15 * 60 * 1000);
    if (token === '--allow-non-keyfile-changes') args.allowNonKeyfileChanges = true;
  }

  if (!['dry', 'execute'].includes(args.mode)) {
    throw new Error(`Invalid --mode value: ${args.mode}. Use 'dry' or 'execute'.`);
  }

  return args;
}

function nowIso() {
  return new Date().toISOString();
}

function safeGit(cmd, fallback = 'unknown') {
  try {
    return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return fallback;
  }
}

function normalizeFilePath(filePath) {
  return filePath.trim().replace(/^`+|`+$/g, '');
}

function toRepoPath(filePath) {
  const clean = normalizeFilePath(filePath);
  return clean.startsWith('/') ? path.relative(ROOT, clean) : clean;
}

async function pathExists(repoPath) {
  try {
    await stat(path.join(ROOT, repoPath));
    return true;
  } catch {
    return false;
  }
}

async function discoverCards(singleCard) {
  if (singleCard) return [singleCard];

  const entries = await readdir(BACKLOG_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith('.md') && name !== '.gitkeep')
    .sort()
    .map((name) => path.join('kanban', 'backlog', name));
}

function extractSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = markdown.match(pattern);
  return match ? match[1].trim() : '';
}

function slugFromCardPath(cardPath) {
  return path.basename(cardPath, '.md').replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();
}

function runCommand(cmd, timeoutMs) {
  const start = Date.now();
  const result = spawnSync(cmd, {
    cwd: ROOT,
    shell: true,
    timeout: timeoutMs,
    stdio: 'pipe',
    encoding: 'utf8'
  });

  return {
    cmd,
    exit_code: result.status ?? 1,
    duration_ms: Date.now() - start,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? ''
  };
}

function parseCard(markdown) {
  const missingSections = REQUIRED_SECTIONS.filter((section) => !markdown.includes(section));

  const acBody = extractSection(markdown, '## Acceptance Criteria');
  const architectureBody = extractSection(markdown, '## Architecture Review');
  const notesBody = extractSection(markdown, '## Notes');

  const acItems = acBody
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^- \[( |x|X)\]/.test(line))
    .map((line, index) => ({
      ac_id: `AC${index + 1}`,
      ac_text: line.replace(/^- \[( |x|X)\]\s*/, '').trim()
    }));

  const unresolvedRed = architectureBody
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /Status:\s*RED/i.test(line));

  const keyFilesLine = notesBody
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith('- key files:'));

  const keyFiles = keyFilesLine
    ? keyFilesLine
        .replace(/^-\s*Key files:\s*/i, '')
        .split(',')
        .map((item) => toRepoPath(item))
        .filter(Boolean)
    : [];

  return {
    missingSections,
    acItems,
    unresolvedRed,
    keyFiles
  };
}

function newReport({ cardPath, cardId, runId, baseSha, mode, keyFiles, acItems }) {
  return {
    run_id: runId,
    card_id: cardId,
    card_path: cardPath,
    mode,
    state: STATE.QUEUED,
    status: STATUS.NEEDS_INPUT,
    branch: `feature/${cardId}-auto`,
    base_sha: baseSha,
    head_sha: baseSha,
    stage_history: [],
    assumptions: {
      key_files_initial: keyFiles,
      key_files_reviewed: []
    },
    assumptions_diff: {
      same: [],
      different: []
    },
    ac_trace: acItems.map((item) => ({
      ac_id: item.ac_id,
      ac_text: item.ac_text,
      unit: null,
      integration: null,
      storybook: null,
      e2e: null,
      tdd_proof: {
        red: null,
        green: null,
        refactor: null
      },
      status: 'pending'
    })),
    commands: [],
    review_findings: [],
    review_proof: {
      findings_total: 0,
      critical_open: 0,
      major_open: 0,
      minor_open: 0
    },
    architecture_gate: {
      statuses: [],
      unresolved_red: []
    },
    implementation_proof: {
      git_diff_present: false,
      files_changed_count: 0,
      changed_files: [],
      key_file_overlap: []
    },
    retry_count: 0,
    blocked_reason: null,
    exit_code: 1,
    timestamps: {
      started_at: nowIso(),
      updated_at: nowIso()
    }
  };
}

function recordStage(report, stage, status, note = '') {
  report.stage_history.push({ stage, status, note, timestamp: nowIso() });
}

async function ensureReportDir() {
  await mkdir(REPORT_DIR, { recursive: true });
}

async function writeReport(report) {
  const reportPath = path.join(REPORT_DIR, `${report.card_id}.run-report.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return reportPath;
}

async function loadEvidenceManifest(cardId) {
  const manifestPath = path.join(EVIDENCE_DIR, `${cardId}.json`);
  try {
    const raw = await readFile(manifestPath, 'utf8');
    const parsed = JSON.parse(raw);
    return { manifestPath: path.relative(ROOT, manifestPath), parsed };
  } catch {
    return { manifestPath: path.relative(ROOT, manifestPath), parsed: null };
  }
}

async function reviewKeyFiles(keyFiles) {
  const reviewed = [];
  const missing = [];

  for (const file of keyFiles) {
    const exists = await pathExists(file);
    if (!exists) {
      missing.push(file);
      continue;
    }
    const contents = await readFile(path.join(ROOT, file), 'utf8');
    reviewed.push({ file, bytes: contents.length });
  }

  return { reviewed, missing };
}

function validateEvidenceStructure(report, manifest, cardPath) {
  if (!manifest || typeof manifest !== 'object') {
    return 'Missing evidence manifest. Create kanban/backlog/evidence/<card-id>.json with AC trace artifacts.';
  }

  if (!Array.isArray(manifest.ac_trace)) {
    return 'Evidence manifest must include ac_trace array.';
  }

  const byId = new Map(manifest.ac_trace.map((entry) => [entry.ac_id, entry]));
  for (const item of report.ac_trace) {
    const found = byId.get(item.ac_id);
    if (!found) {
      return `Evidence manifest missing entry for ${item.ac_id} in ${cardPath}.`;
    }
    const requiredLayers = ['unit', 'integration', 'storybook', 'e2e'];
    for (const layer of requiredLayers) {
      if (!found[layer] || typeof found[layer].path !== 'string' || typeof found[layer].name !== 'string') {
        return `${item.ac_id} missing ${layer} artifact {name,path}.`;
      }
    }
    if (!found.tdd_proof || !found.tdd_proof.red || !found.tdd_proof.green || !found.tdd_proof.refactor) {
      return `${item.ac_id} missing tdd_proof.red/green/refactor evidence.`;
    }
  }

  if (!manifest.assumption_diff_reasons || typeof manifest.assumption_diff_reasons !== 'object') {
    return 'Evidence manifest must include assumption_diff_reasons object.';
  }

  return null;
}

async function hydrateAcTrace(report, manifest) {
  for (const item of report.ac_trace) {
    const source = manifest.ac_trace.find((entry) => entry.ac_id === item.ac_id);
    item.unit = source.unit;
    item.integration = source.integration;
    item.storybook = source.storybook;
    item.e2e = source.e2e;
    item.tdd_proof = source.tdd_proof;

    const layers = [source.unit, source.integration, source.storybook, source.e2e];
    let existsCount = 0;
    for (const layer of layers) {
      if (await pathExists(toRepoPath(layer.path))) existsCount += 1;
    }
    item.status = existsCount === 4 ? 'pass' : 'blocked';
  }
}

function validateAcTraceAgainstDiff(acTrace, changedFiles) {
  for (const item of acTrace) {
    const layerPaths = [item.unit?.path, item.integration?.path, item.storybook?.path, item.e2e?.path]
      .filter(Boolean)
      .map((filePath) => toRepoPath(filePath));
    const touched = layerPaths.some((filePath) => changedFiles.includes(filePath));
    if (!touched) {
      return `${item.ac_id} has no touched layer artifact in current diff.`;
    }
  }
  return null;
}

function statusFromReport(report) {
  if (report.state === STATE.READY) return STATUS.SUCCESS;
  if ([STATE.BLOCKED, STATE.FAILED, STATE.INTAKE_FAILED].includes(report.state)) return STATUS.BLOCKED;
  return STATUS.NEEDS_INPUT;
}

function collectChangedFiles() {
  const commands = [
    'git diff --name-only',
    'git diff --name-only --cached',
    'git ls-files --others --exclude-standard'
  ];
  const files = new Set();

  for (const cmd of commands) {
    const output = safeGit(cmd, '');
    if (!output) continue;
    for (const line of output.split('\n')) {
      const file = line.trim().replace(/^"|"$/g, '');
      if (file) files.add(file);
    }
  }

  return Array.from(files);
}

function collectChangedFilesSinceBase(baseSha) {
  if (!baseSha || baseSha === 'unknown') return [];
  const output = safeGit(`git diff --name-only ${baseSha}...HEAD`, '');
  if (!output) return [];
  return output
    .split('\n')
    .map((line) => line.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);
}

function collectChangedFilesFromHeadCommit() {
  let output = safeGit('git diff --name-only HEAD^1..HEAD', '');
  if (!output) {
    output = safeGit('git show --name-only --pretty="" HEAD', '');
  }
  if (!output) {
    return [];
  }
  return output
    .split('\n')
    .map((line) => line.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);
}

function deriveCardScopePaths(keyFiles, acTrace) {
  const scope = new Set(keyFiles.map((file) => toRepoPath(file)));
  for (const item of acTrace) {
    for (const layer of [item.unit, item.integration, item.storybook, item.e2e]) {
      if (layer?.path) scope.add(toRepoPath(layer.path));
    }
  }
  return scope;
}

function filterChangedFilesToScope(changedFiles, scopePaths) {
  return changedFiles.filter((file) => scopePaths.has(toRepoPath(file)));
}

function chooseValidationCommands(changedFiles, cardId) {
  const commands = ['npm run lint', 'npm run type-check'];
  const touchesClient = changedFiles.some((file) => file.startsWith('packages/client/'));
  const touchesShared = changedFiles.some((file) => file.startsWith('packages/shared/'));
  const touchesServer = changedFiles.some((file) => file.startsWith('packages/server/'));

  if (touchesShared) {
    commands.push('npm run test');
  } else {
    if (touchesClient) commands.push('npm run test:client');
    if (touchesServer) commands.push('npm run test:server');
    if (!touchesClient && !touchesServer) commands.push('npm run test:shared');
  }

  commands.push(`npm run test:e2e:card -- --grep ${cardId}`);
  return commands;
}

function runReviewChecks(changedFiles) {
  const findings = [];

  for (const file of changedFiles) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;

    let content = '';
    try {
      content = execSync(`sed -n '1,220p' ${JSON.stringify(file)}`, {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'ignore']
      }).toString();
    } catch {
      continue;
    }

    if (/\bTODO\b|\bFIXME\b/.test(content)) {
      findings.push({
        severity: 'major',
        location: file,
        resolution: 'Remove TODO/FIXME or convert to tracked backlog item before readiness.'
      });
    }

    if (/\bany\b/.test(content)) {
      findings.push({
        severity: 'minor',
        location: file,
        resolution: 'Review broad any usage; narrow type where feasible.'
      });
    }
  }

  return findings;
}

function computeAssumptionDiff(keyFiles, changedFiles, reasons) {
  const keySet = new Set(keyFiles);
  const changedSet = new Set(changedFiles);

  const same = [];
  const different = [];

  for (const key of keySet) {
    if (changedSet.has(key)) {
      same.push(key);
    } else {
      different.push({ file: key, reason: reasons[key] ?? null, type: 'expected-not-touched' });
    }
  }

  for (const file of changedSet) {
    if (!keySet.has(file)) {
      different.push({ file, reason: reasons[file] ?? null, type: 'touched-not-expected' });
    }
  }

  return { same, different };
}

function unresolvedMajorOrCritical(findings) {
  return findings.filter((f) => f.severity === 'critical' || f.severity === 'major');
}

function renderPrPayload(report) {
  const rows = report.ac_trace
    .map((ac) => {
      const evidence = [ac.unit?.name, ac.integration?.name, ac.storybook?.name, ac.e2e?.name].filter(Boolean).join('; ');
      return `| ${ac.ac_id}: ${ac.ac_text} | ${ac.status} | ${evidence} |`;
    })
    .join('\n');

  return [
    '## Summary',
    `Automated orchestration output for ${report.card_id}.`,
    '',
    '## Acceptance Criteria Trace',
    '| AC | Status | Evidence |',
    '| --- | --- | --- |',
    rows,
    '',
    '## Test Evidence',
    report.commands.map((cmd) => `- ${cmd.cmd}: exit ${cmd.exit_code}`).join('\n') || '- none',
    '',
    '## Review Findings',
    report.review_findings.length > 0
      ? report.review_findings.map((f) => `- ${f.severity} ${f.location}: ${f.resolution}`).join('\n')
      : '- none',
    '',
    '## Risks',
    '- See assumptions diff and review findings.',
    '',
    '## Rollback Notes',
    '- Revert card branch commits and rerun orchestrator.'
  ].join('\n');
}

async function processCard(cardPath, options, runId, baseSha) {
  const fullPath = path.join(ROOT, cardPath);
  const markdown = await readFile(fullPath, 'utf8');
  const parsed = parseCard(markdown);
  const cardId = slugFromCardPath(cardPath);

  const report = newReport({
    cardPath,
    cardId,
    runId,
    baseSha,
    mode: options.mode,
    keyFiles: parsed.keyFiles,
    acItems: parsed.acItems
  });

  recordStage(report, STAGE.INTAKE, 'started', 'Validating backlog card schema.');

  if (parsed.missingSections.length > 0 || parsed.acItems.length === 0) {
    report.state = STATE.INTAKE_FAILED;
    report.blocked_reason = `Card schema invalid. Missing sections: ${parsed.missingSections.join(', ') || 'none'}; AC count: ${parsed.acItems.length}`;
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.INTAKE, 'failed', report.blocked_reason);
    return report;
  }

  if (parsed.keyFiles.length === 0) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = 'Card Notes must list Key files for assumption review gate.';
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.INTAKE, 'failed', report.blocked_reason);
    return report;
  }

  report.architecture_gate.unresolved_red = parsed.unresolvedRed;
  if (parsed.unresolvedRed.length > 0) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = 'Unresolved architecture RED status found in backlog card.';
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.INTAKE, 'failed', report.blocked_reason);
    return report;
  }

  report.state = STATE.ANALYZING;
  recordStage(report, STAGE.INTAKE, 'passed', 'Card schema and architecture gate passed.');

  recordStage(report, STAGE.ASSUMPTION_SNAPSHOT, 'started', 'Reviewing card key files.');
  const keyFileReview = await reviewKeyFiles(parsed.keyFiles);
  report.assumptions.key_files_reviewed = keyFileReview.reviewed.map((item) => item.file);

  if (keyFileReview.missing.length > 0) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = `Key files missing from repository: ${keyFileReview.missing.join(', ')}`;
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.ASSUMPTION_SNAPSHOT, 'failed', report.blocked_reason);
    return report;
  }

  if (options.mode === 'dry') {
    report.state = STATE.BLOCKED;
    report.blocked_reason = `Dry mode does not implement changes. Provide evidence manifest at kanban/backlog/evidence/${cardId}.json then run --mode execute.`;
    report.status = STATUS.NEEDS_INPUT;
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.ASSUMPTION_SNAPSHOT, 'passed', 'Key files reviewed.');
    return report;
  }

  recordStage(report, STAGE.ASSUMPTION_SNAPSHOT, 'passed', 'Key files reviewed.');

  const evidence = await loadEvidenceManifest(cardId);
  const evidenceError = validateEvidenceStructure(report, evidence.parsed, cardPath);
  if (evidenceError) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = `${evidenceError} Manifest path: ${evidence.manifestPath}`;
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    return report;
  }

  recordStage(report, STAGE.TDD_RED, 'started', 'Validating TDD red evidence.');
  await hydrateAcTrace(report, evidence.parsed);
  const blockedAc = report.ac_trace.find((item) => item.status !== 'pass');
  if (blockedAc) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = `${blockedAc.ac_id} references missing test/story artifacts on disk.`;
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.TDD_RED, 'failed', report.blocked_reason);
    return report;
  }
  recordStage(report, STAGE.TDD_RED, 'passed', 'All AC artifacts exist for red phase evidence.');
  recordStage(report, STAGE.TDD_GREEN, 'passed', 'Green evidence provided in manifest.');
  recordStage(report, STAGE.TDD_REFACTOR, 'passed', 'Refactor evidence provided in manifest.');

  report.state = STATE.IMPLEMENTING;
  const allChangedFiles = new Set([
    ...collectChangedFilesSinceBase(baseSha),
    ...collectChangedFilesFromHeadCommit(),
    ...collectChangedFiles()
  ]);
  const cardScopePaths = deriveCardScopePaths(parsed.keyFiles, report.ac_trace);
  const changedFiles = filterChangedFilesToScope(Array.from(allChangedFiles), cardScopePaths);

  report.implementation_proof.changed_files = changedFiles;
  report.implementation_proof.files_changed_count = changedFiles.length;
  report.implementation_proof.git_diff_present = changedFiles.length > 0;
  report.implementation_proof.key_file_overlap = changedFiles.filter((file) => parsed.keyFiles.includes(file));

  if (changedFiles.length === 0) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = 'Execute mode requires card-scoped code changes, but no scoped diff was found.';
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    return report;
  }

  if (!options.allowNonKeyfileChanges && report.implementation_proof.key_file_overlap.length === 0) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = 'Changed files do not overlap card key files. Use --allow-non-keyfile-changes only with justification.';
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    return report;
  }

  const acDiffError = validateAcTraceAgainstDiff(report.ac_trace, changedFiles);
  if (acDiffError) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = acDiffError;
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    return report;
  }

  report.state = STATE.VALIDATING;
  recordStage(report, STAGE.VALIDATING, 'started', 'Running validation/test suite.');
  const commands = chooseValidationCommands(changedFiles, cardId);
  for (const cmd of commands) {
    const result = runCommand(cmd, options.timeoutMs);
    report.commands.push(result);
    if (result.exit_code !== 0) {
      report.state = STATE.FAILED;
      report.blocked_reason = `Validation command failed: ${cmd}`;
      report.status = statusFromReport(report);
      report.timestamps.updated_at = nowIso();
      recordStage(report, STAGE.VALIDATING, 'failed', report.blocked_reason);
      return report;
    }
  }
  recordStage(report, STAGE.VALIDATING, 'passed', 'Validation commands passed.');

  report.state = STATE.REVIEWING;
  recordStage(report, STAGE.REVIEWING, 'started', 'Running static review checks on changed files.');
  report.review_findings = runReviewChecks(changedFiles);
  report.review_proof.findings_total = report.review_findings.length;
  report.review_proof.critical_open = report.review_findings.filter((f) => f.severity === 'critical').length;
  report.review_proof.major_open = report.review_findings.filter((f) => f.severity === 'major').length;
  report.review_proof.minor_open = report.review_findings.filter((f) => f.severity === 'minor').length;

  const unresolved = unresolvedMajorOrCritical(report.review_findings);
  if (unresolved.length > 0) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = `Unresolved review findings: ${unresolved.length} critical/major.`;
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.REVIEWING, 'failed', report.blocked_reason);
    return report;
  }
  recordStage(report, STAGE.REVIEWING, 'passed', 'No critical/major review findings remain.');

  report.state = STATE.PACKAGING;
  recordStage(report, STAGE.ASSUMPTION_DIFF, 'started', 'Comparing initial key-file assumptions against touched files.');
  const assumptionDiff = computeAssumptionDiff(parsed.keyFiles, changedFiles, evidence.parsed.assumption_diff_reasons);
  report.assumptions_diff = assumptionDiff;

  const unexplained = assumptionDiff.different.filter((item) => !item.reason);
  if (unexplained.length > 0) {
    report.state = STATE.BLOCKED;
    report.blocked_reason = `Assumption diff contains unexplained differences: ${unexplained.map((i) => i.file).join(', ')}`;
    report.status = statusFromReport(report);
    report.timestamps.updated_at = nowIso();
    recordStage(report, STAGE.ASSUMPTION_DIFF, 'failed', report.blocked_reason);
    return report;
  }
  recordStage(report, STAGE.ASSUMPTION_DIFF, 'passed', 'Assumption diff fully explained.');

  recordStage(report, STAGE.PACKAGING, 'started', 'Generating PR payload artifact.');
  const prPayloadPath = path.join(REPORT_DIR, `${cardId}.pr.md`);
  await writeFile(prPayloadPath, `${renderPrPayload(report)}\n`, 'utf8');
  recordStage(report, STAGE.PACKAGING, 'passed', `PR payload written to ${path.relative(ROOT, prPayloadPath)}.`);

  report.state = STATE.READY;
  report.status = STATUS.SUCCESS;
  report.exit_code = 0;
  report.head_sha = safeGit('git rev-parse --short HEAD', baseSha);
  report.timestamps.updated_at = nowIso();
  return report;
}

function summarize(reports) {
  const counts = {
    [STATE.READY]: 0,
    [STATE.BLOCKED]: 0,
    [STATE.FAILED]: 0,
    [STATE.INTAKE_FAILED]: 0
  };

  for (const report of reports) {
    if (counts[report.state] !== undefined) counts[report.state] += 1;
  }

  return counts;
}

function deriveExitCode(reports, mode) {
  if (reports.some((report) => [STATE.BLOCKED, STATE.FAILED, STATE.INTAKE_FAILED].includes(report.state))) {
    return 1;
  }

  if (mode === 'dry') return 1;

  return reports.every((report) => report.state === STATE.READY) ? 0 : 1;
}

async function main() {
  const args = parseArgs(process.argv);
  await ensureReportDir();

  const runId = `orchestrator-${Date.now()}`;
  const baseSha = safeGit('git rev-parse --short HEAD');
  const cards = await discoverCards(args.card);

  if (cards.length === 0) {
    console.log('No active backlog cards found.');
    process.exit(1);
  }

  const reports = [];
  for (const cardPath of cards) {
    const report = await processCard(cardPath, args, runId, baseSha);
    const reportPath = await writeReport(report);
    reports.push(report);
    console.log(`[${report.state}] ${cardPath} -> ${reportPath}`);
  }

  const summary = summarize(reports);
  console.log('\nPortfolio summary:');
  console.log(JSON.stringify(summary, null, 2));

  const exitCode = deriveExitCode(reports, args.mode);
  process.exit(exitCode);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('backlog-orchestrate failed:', error.message);
    process.exit(1);
  });
}

export {
  parseArgs,
  parseCard,
  deriveExitCode,
  chooseValidationCommands,
  computeAssumptionDiff,
  validateAcTraceAgainstDiff
};
