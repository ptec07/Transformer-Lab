# Transformer Lab Implementation Plan

> **For Hermes:** Use TDD vertical slices and verify each public seam before proceeding.

**Goal:** Build and deploy a beginner-friendly animated mini-transformer simulator.

**Architecture:** Pure TypeScript math engine feeds a Zustand-controlled React stage viewer. SVG and CSS visualize vectors, matrices, attention edges and token probabilities; no backend or external model API is used.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, shadcn-style UI primitives, Zustand, TanStack Query, Framer Motion, Vitest, Testing Library, Playwright, GitHub Actions, Vercel.

---

### Task 1: Scaffold and test harness
- Create Vite React TypeScript app without overwriting existing paths.
- Add Tailwind, Vitest, Testing Library, Playwright and scripts.
- Add a smoke test first, verify red, then add minimal app shell and verify green.

### Task 2: Mathematical primitives
- Test `softmax` against independently worked literals and probability-sum invariant.
- Test sinusoidal positional vectors for known position/dimension values.
- Implement only enough math to pass each test.

### Task 3: Tokenization and embeddings
- Test punctuation-safe tokenization, unknown-token fallback and deterministic vectors.
- Implement fixed educational vocabulary and color-safe vector normalization.

### Task 4: Scaled dot-product attention
- Test known two-token Q/K/V example, row sums and dominant attention relation.
- Implement matrix multiply, transpose, scale, row softmax and weighted value sum.

### Task 5: FFN and output distribution
- Test ReLU behavior, output shape, stable logits-to-probability conversion and deterministic next-token choice.
- Implement a small fixed two-layer FFN and vocabulary projection.

### Task 6: End-to-end mini-transformer trace
- Test that a question produces all named stages and a generated answer token.
- Implement trace objects containing labels, formulas, matrices and plain-language explanations.

### Task 7: Interactive UI shell
- Test question submission, example selection, stage navigation and view mode.
- Implement hero, pipeline stepper, controls and responsive layout.

### Task 8: Visual learning stages
- Test accessible headings and key numeric summaries.
- Implement token cards, vector heatmap, positional wave, attention SVG, FFN flow and softmax bars.
- Add reduced-motion handling and 44px control targets.

### Task 9: Playback and polish
- Test play/pause and speed state with fake timers.
- Implement animated transitions, progress, restart and concise learning tips.

### Task 10: CI and deployment
- Add GitHub Actions workflow for lint, tests and build, with Vercel production deploy on main.
- Run full local test/build and Playwright smoke test.
- Create GitHub repo, set Vercel/GitHub secrets, push, wait for green Actions run.
- Verify production URL, core UI, mobile viewport and browser console.

### Final verification
- `npm run lint`
- `npm test -- --run`
- `npm run build`
- `npm run test:e2e`
- GitHub Actions conclusion: success for pushed head SHA
- Live Vercel page loads, accepts a question, advances through all stages, and has no console errors
