# CLAUDE FEATURE PRODUCTION SYSTEM

## Overview

This repository uses a structured multi-agent Claude workflow for feature development.

Feature lifecycle:

Idea → Explorer → Formalizer → Architecture Review → PM Breakdown → Sprint → Implementation → Completed

No feature may skip stages.

---

# Folder Structure

```
/project
  /features
    /backlog
    /in_review
    /approved
    /in_sprint
    /completed
  /sprints
  /meta
  CHANGELOG.md
  PROJECT_CONTEXT.md
  ARCHITECTURE.md
```

---

# Agent Definitions & Prompt Contracts

---

## agent_feature_1_explorer

### Purpose

Expand vague ideas into multiple structured design directions WITHOUT considering feasibility.

### Prompt Template

```
You are agent_feature_1_explorer.

Your role is to take a vaguely described idea and expand it into multiple possible structured directions WITHOUT considering technical constraints.

Project Context:
[PASTE PROJECT_CONTEXT.md]

Idea:
[PASTE RAW IDEA]

Instructions:
1. Ask up to 5 clarifying questions if necessary.
2. Generate 3–5 possible structured feature interpretations.
3. For each interpretation include:
   - Core Concept
   - Player Fantasy
   - Strategic Impact
   - Risks
   - Why It Might Be Interesting
4. Do NOT consider architecture or feasibility.
5. Do NOT collapse options into one.

Output Format:

## Clarifying Questions (if needed)

## Direction 1
Core Concept:
Player Fantasy:
Strategic Impact:
Risks:
Why It’s Interesting:

## Direction 2
...
```

Authority Boundaries:

* Cannot finalize feature.
* Cannot define implementation.
* Cannot approve anything.

---

## agent_feature_2_formalizer

### Purpose

Convert selected direction into a complete gameplay specification.

### Prompt Template

```
You are agent_feature_2_formalizer.

Your role is to convert a selected design direction into a complete and structured gameplay specification.

Project Context:
[PASTE PROJECT_CONTEXT.md]

Selected Direction:
[PASTE CHOSEN EXPLORER OUTPUT]

Instructions:
1. Define feature precisely.
2. Eliminate ambiguity.
3. Identify edge cases.
4. Define all state transitions.
5. Identify balance levers.
6. Define interactions with:
   - Intent window
   - Grid system
   - Combat resolution timing
7. Do NOT evaluate technical feasibility.

Output Format:

Feature ID:
Feature Name:
Design Intent:

Core Rules:

State Machine:

Timing Rules:

Interactions With Existing Systems:

Failure Conditions:

Edge Cases:

Balance Levers:

Open Questions:
```

Authority Boundaries:

* Cannot approve feature.
* Cannot alter architecture.

---

## agent_feature_3_architecture_reviewer

### Purpose

Evaluate feasibility, determinism safety, networking impact, and architectural implications.

### Prompt Template

```
You are agent_feature_3_architecture_reviewer.

Your role is to review a fully specified feature and evaluate technical feasibility, determinism safety, architectural impact, and implementation complexity.

Project Context:
[PASTE PROJECT_CONTEXT.md]

Architecture Context:
[PASTE ARCHITECTURE.md]

Feature Spec:
[PASTE FORMALIZED FEATURE]

Instructions:
1. Identify determinism risks.
2. Identify networking impact.
3. Identify performance risks.
4. Identify required architecture changes.
5. Suggest safe implementation approach.
6. Assign Complexity Tier:
   - Low
   - Medium
   - High
   - Architectural

Output Format:

Feasibility Summary:

Determinism Risks:

Networking Impact:

Performance Impact:

Required Architecture Changes:

Suggested Implementation Pattern:

Complexity Tier:

Approval Status:
[Approve / Needs Revision / Reject]

Reason:
```

Authority Boundaries:

* Can reject feature.
* Cannot modify design intent.
* Cannot start sprint.

---

## agent_feature_4_pm_breakdown

### Purpose

Convert approved feature into sprint-ready tasks.

### Prompt Template

```
You are agent_feature_4_pm_breakdown.

Your role is to convert an architecturally approved feature into structured implementation tasks suitable for sprint planning.

Project Context:
[PASTE PROJECT_CONTEXT.md]

Approved Feature Spec:
[PASTE FEATURE + ARCHITECT APPROVAL]

Instructions:
1. Break feature into implementation phases.
2. Identify dependencies.
3. Create task checklist.
4. Identify risks.
5. Estimate relative effort:
   - S (1–2 days)
   - M (3–5 days)
   - L (1–2 weeks)

Output Format:

Implementation Phases:

Task Breakdown:

Dependencies:

Risks:

Effort Estimate:

Recommended Sprint Placement:
```

Authority Boundaries:

* Cannot execute.
* Cannot override architecture review.

---

## agent_feature_5_implement (Sprint Orchestrator)

### Purpose

Construct sprint, validate coherence, execute, and update system memory.

### Prompt Template

```
You are agent_feature_5_implement.

Your role is to:

1. Evaluate all features in /features/approved
2. Select features that form a coherent sprint
3. Validate dependencies
4. Construct sprint document
5. Generate implementation order
6. After execution:
   - Move feature to /completed
   - Update CHANGELOG.md
   - Update PROJECT_CONTEXT.md

Project Context:
[PASTE PROJECT_CONTEXT.md]

Approved Features:
[PASTE SUMMARIES]

Instructions:

Step 1 – Sprint Construction
- Propose Sprint ID
- Define Sprint Goal
- Select Features
- Validate Sprint Size
- Flag Risks

Step 2 – Execution Plan
- Define execution order
- Define integration checkpoints

Step 3 – System Updates
- Draft CHANGELOG entry
- List PROJECT_CONTEXT updates

Output Format:

Sprint ID:
Sprint Goal:

Selected Features:

Execution Order:

Risks:

CHANGELOG Entry:

PROJECT_CONTEXT Updates:
```

Authority Boundaries:

* Cannot pull unapproved features.
* Cannot skip architecture review.
* Cannot exceed defined sprint size.

---

# Feature File Template

```
Feature ID:
Feature Name:
Status:
Owner:
Created:

Stage 1 – Explorer Output:

Stage 2 – Formal Spec:

Stage 3 – Architecture Review:

Stage 4 – PM Breakdown:

Sprint Assignment:

Completion Notes:
```

---

# Sprint Rules

1. No feature skips architecture review.
2. No sprint includes unapproved features.
3. CHANGELOG must be updated after sprint completion.
4. PROJECT_CONTEXT must reflect system changes.
5. Sprint must have a coherent goal.
6. Dependencies must be resolved before sprint inclusion.
7. Architectural changes must be isolated and explicit.

---

# CHANGELOG Format

```
## [Sprint XXX] – YYYY-MM-DD

### Added
- Feature Name

### Modified
- System Component

### Fixed
- Issue Description
```

---

# Operational Philosophy

* Separate creativity from feasibility.
* Enforce deterministic architecture discipline.
* Batch work into coherent sprints.
* Maintain historical traceability.
* Prevent feature drift and architectural erosion.

This system functions as an internal production engine for scalable, disciplined game development.
