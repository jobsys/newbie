# Testing Patterns

**Analysis Date:** 2026-05-06

## Test Framework Status

**Current State: NO TESTS CONFIGURED**

This codebase has no testing infrastructure in place.

## What Was Found

**No Test Files:**
- Zero `.test.js`, `.test.ts`, `.spec.js`, `.spec.ts` files in the codebase
- All search results for test files were within `node_modules/` dependencies

**No Test Configuration:**
- No `vitest.config.ts`, `jest.config.js`, or similar
- No `playwright.config.ts` for E2E
- No test scripts in `package.json`

**No Test Dependencies:**
- No vitest, jest, @vue/test-utils, cypress, or playwright in devDependencies

## Available Scripts

**Current Scripts (`package.json`):**
```bash
pnpm run dev      # Start dev server
pnpm run build    # Build library
pnpm run lint     # Run oxlint
pnpm run fmt      # Run oxfmt write .
```

## Recommended Testing Setup

### Unit Testing (Recommended)

**Framework:** Vitest + @vue/test-utils

**Installation:**
```bash
pnpm add -D vitest @vue/test-utils @vitejs/plugin-vue-jsx happy-dom
```

**Configuration (`vitest.config.ts`):**
```typescript
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", "dist", "playground"],
  },
});
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Component Testing Pattern

**For JSX Components:**
```javascript
// components/button/NewbieButton.spec.jsx
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NewbieButton from "./NewbieButton.jsx";

describe("NewbieButton", () => {
  it("renders with label", () => {
    const wrapper = mount(NewbieButton, {
      props: { label: "Click Me" },
    });
    expect(wrapper.text()).toContain("Click Me");
  });

  it("emits click event", async () => {
    const wrapper = mount(NewbieButton);
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });
});
```

### Hook Testing Pattern

```javascript
// hooks/utils.spec.js
import { describe, it, expect } from "vitest";
import { useLabelFromOptionsValue } from "./utils.js";

describe("useLabelFromOptionsValue", () => {
  it("finds label by value", () => {
    const options = [{ value: 1, label: "One" }, { value: 2, label: "Two" }];
    expect(useLabelFromOptionsValue(1, options)).toBe("One");
  });

  it("returns empty string for missing value", () => {
    expect(useLabelFromOptionsValue(99, [])).toBe("");
  });
});
```

### E2E Testing (Optional)

**Framework:** Playwright

**Test Playground Components:**
```javascript
// e2e/form.spec.js
import { test, expect } from "@playwright/test";

test("form renders and submits", async ({ page }) => {
  await page.goto("http://localhost:3000/form");
  await expect(page.locator("[data-testid='newbie-form']")).toBeVisible();
});
```

## Test File Organization

**Recommended Structure:**
```
components/
├── button/
│   ├── NewbieButton.jsx
│   └── NewbieButton.spec.jsx      # Co-located test
├── form/
│   ├── NewbieForm.jsx
│   └── NewbieForm.spec.jsx
hooks/
├── utils.js
└── utils.spec.js                  # Co-located test
```

## Testing Priorities

**High Priority (Core Components):**
1. `NewbieForm` - Critical business logic, validation
2. `NewbieTable` - Data display, pagination, sorting
3. `hooks/utils.js` - Pure functions, data transformations
4. `hooks/form.js` - Form state management
5. `hooks/network.js` - API interactions (mock axios)

**Medium Priority (UI Components):**
1. `NewbieButton` - Props, events, loading states
2. `NewbieModal` - Open/close, confirm/cancel
3. `NewbieSearch` - Filter logic

**Low Priority (Complex Integrations):**
1. `NewbieEditor` - WangEditor integration
2. `NewbieUploader` - File upload flow

## CI Integration

**Update `.github/workflows/npm-publish.yml`:**
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Run linter
  run: pnpm run lint

- name: Run tests
  run: pnpm run test:ci

- name: Build
  run: pnpm run build
```

## Code Quality Without Tests

**Current Quality Gates:**
- `oxlint` - Static analysis for correctness, performance
- `oxfmt` - Consistent formatting
- TypeScript types via JSDoc (partial coverage via `components.d.ts`)

**Missing Quality Gates:**
- No automated testing
- No code coverage metrics
- No regression prevention

## Known Issues (from TODOs.md)

**Bugs Requiring Tests:**
- Uploader required detection abnormal
- Select multi-select required detection abnormal
- Table change page size issue (marked fixed)
- Table search pagination reset (marked fixed)

These bugs indicate areas where automated tests would prevent regression.

---

*Testing analysis: 2026-05-06*
