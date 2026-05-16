# TESTS — PromptBudget

## Test Framework

- **Runner**: Vitest v4.1.6
- **Config**: `vitest.config.ts` with path alias resolution
- **Run**: `npm run test` (single run) or `npm run test:watch` (watch mode)

## Test Results

```
✓ __tests__/audit-engine.test.ts (30 tests) 11ms

Test Files  1 passed (1)
     Tests  30 passed (30)
  Duration  323ms
```

## Test Groups (8 Groups, 30 Tests)

### 1. Pricing Data Integrity (5 tests)
Validates the pricing database is complete and well-formed.
- Has at least 8 tools
- Every tool has at least one priced plan
- Every tool has a valid pricing URL
- Plan IDs are unique within each tool
- minSeats values are valid

### 2. Pricing Helper Functions (7 tests)
Validates the utility functions used throughout the app.
- `getToolById` returns correct tool
- `getToolById` returns undefined for unknown tools
- `getPlanById` returns correct plan with price
- `calculateMonthlyCost` handles per-seat pricing (5 seats × $40 = $200)
- `calculateMonthlyCost` handles individual pricing (stays flat regardless of seats)
- `getComparableTools` returns same-category tools excluding self
- `getSubscriptionTools` and `getApiTools` filter correctly

### 3. Audit Engine — Basic Functionality (3 tests)
Tests core audit execution and result structure.
- Single-tool audit returns valid result structure
- Empty input returns empty results with "optimal" status
- Multi-tool audit aggregates spend correctly

### 4. Plan Fit Recommendations (3 tests)
Tests the plan-fit evaluation logic.
- Detects overspending on team plan with only 2 users
- Detects enterprise plan is overkill for team of 5
- Marks truly optimal spend correctly (Copilot Pro at $10/mo for solo dev)

### 5. Credex Savings (2 tests)
Tests the Credex credit recommendation logic.
- Recommends Credex credits for significant spend ($400/mo)
- Skips Credex for tiny spend ($10/mo, below $20 threshold)

### 6. Alternative Tool Suggestions (2 tests)
Tests the cross-tool comparison logic.
- Suggests cheaper coding alternatives (e.g., Copilot $10 vs Cursor $20)
- Does not suggest alternatives for API platforms (too different)

### 7. Overall Status Calculation (2 tests)
Tests the summary statistics.
- Detects significant savings potential on high spend
- Savings percentage math is correct

### 8. Benchmark Calculations (5 tests)
Tests the industry benchmark comparison feature.
- Calculates spend per developer correctly
- Returns correct company stage for team size
- Identifies above-median spending
- Identifies below-median spending
- Handles edge case of zero team size

## What's Not Tested (and Why)

| Area | Reason |
|------|--------|
| API routes | Require Supabase/Resend mocking; would add complexity without proportional value for a 7-day build |
| UI components | Visual testing is better done via Lighthouse/Playwright; unit tests for React components add overhead |
| Anthropic integration | External API; tested manually and has a fallback path |
| localStorage persistence | Browser-specific; tested manually during development |

## How to Add Tests

```bash
# Create a new test file
touch __tests__/my-feature.test.ts

# Run tests in watch mode during development
npm run test:watch

# Run all tests once (CI mode)
npm run test
```
