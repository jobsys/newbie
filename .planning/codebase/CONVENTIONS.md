# Coding Conventions

**Analysis Date:** 2026-05-06

## Overview

This is a Vue 3 component library (jobsys-newbie) built on top of ant-design-vue. It uses JSX for component authoring and follows specific code quality tooling with oxfmt and oxlint.

## Naming Patterns

**Components:**
- PascalCase with `Newbie` prefix: `NewbieButton`, `NewbieForm`, `NewbieTable`
- Component names defined in `defineComponent({ name: "NewbieXxx" })`
- File names match component names: `NewbieButton.jsx`, `NewbieForm.jsx`

**Hooks:**
- camelCase with `use` prefix: `useFetch`, `useFormFormat`, `useCache`
- Located in `hooks/` directory

**Directories:**
- camelCase for multi-word: `form-designer`, `signature-pad`
- lowercase single words: `form`, `table`, `hooks`

**Files:**
- JSX for components: `NewbieXxx.jsx`
- JS for utilities: `utils.js`, `index.js`
- LESS for styles: `index.less`, `style.less`
- Barrel exports via `index.js` in each directory

## Code Style

**Formatting (oxfmt):**
- Line width: 100 characters (`"lineWidth": 100`)
- Indent: 4 spaces using tabs (`"indentWidth": 4`, `"useTabs": true`)
- Quotes: double (`"quoteStyle": "double"`)
- Trailing commas: ES5 style (`"trailingComma": "es5"`)
- Bracket spacing: enabled (`"bracketSpacing": true`)
- Arrow parens: avoid when possible (`"arrowParens": "avoid"`)

**Commands:**
```bash
# Format all files
pnpm run fmt

# Check formatting (oxlint handles linting)
pnpm run lint
```

**Linting (oxlint):**
- Environment: browser, node, es2024
- Categories enabled:
  - `correctness`: error
  - `perf`: warn
  - `style`: off (handled by oxfmt)
  - `suspicious`: warn
- Plugins: import, node, unicorn
- Console allowed (`"no-console": "off"`)
- Debugger warnings (`"no-debugger": "warn"`)
- Vue specific: `vue/no-unused-vars` as warn

## Import Organization

**Order Pattern (observed):**
1. Vue core imports
2. Third-party libraries (ant-design-vue, lodash-es)
3. Internal hooks/utils
4. Internal components
5. Styles (last)

**Example from `NewbieTable.jsx`:**
```jsx
import { computed, defineComponent, ... } from "vue";
import { Button, Card, ... } from "ant-design-vue";
import { cloneDeep, isArray, ... } from "lodash-es";
import { CheckCircleOutlined, ... } from "@ant-design/icons-vue";
import { useCache, useFetch, ... } from "../../hooks";
import { NEWBIE_TABLE } from "../provider/NewbieProvider.jsx";
import NewbieButton from "../button/NewbieButton.jsx";
import "./index.less";
```

**Path Aliases:**
- Relative paths for internal imports: `../../hooks`, `../button/NewbieButton`
- No `@/` alias configured

## Component Patterns

**Component Structure (JSX):**
```jsx
import { defineComponent } from "vue";

/**
 * Component description
 * @version 1.0.0
 */
export default defineComponent({
  name: "NewbieXxx",
  props: {
    /** JSDoc for prop */
    propName: { type: String, default: "" },
  },
  emits: ["event"],
  setup(props, { emit, slots }) {
    // Composition API logic
    return () => (
      // JSX render
    );
  },
});
```

**withInstall Pattern:**
```jsx
import _NewbieButton from "./NewbieButton.jsx";
import withInstall from "../../utils/withInstall";

export const NewbieButton = withInstall(_NewbieButton);
export default NewbieButton;
```

**Props Documentation:**
- JSDoc comments for all props
- Include type, description, values, default
- Chinese descriptions for component library users

## Error Handling

**Console Usage:**
- `console.error()` for developer-facing errors (e.g., "NewbieForm columns must sum up to 24")
- Allowed by linter (no-console: off)

**User-Facing Errors:**
- Use `message` from ant-design-vue
- Modal confirmations for destructive actions

## Logging

**Console:**
- Used for development warnings
- No structured logging framework

## Comments

**JSDoc Requirements:**
- All component exports must have JSDoc block
- Include `@version` tag
- Chinese descriptions for user-facing documentation

**Inline Comments:**
- Use for complex logic explanation
- Keep in Chinese for consistency

## Function Design

**Hook Pattern:**
```javascript
export function useHookName(params) {
  // Implementation
  return { data, method };
}
```

**Helper Functions:**
- Default export for single utilities
- Named exports for collections
- JSDoc for all exported functions

## Module Design

**Exports Pattern:**
- Barrel files at `index.js` in each directory
- Named exports for individual items
- Default export for primary component

**Example `components/index.js`:**
```javascript
import "./style.less";
export * from "./address";
export * from "./button";
// ... etc
```

**Style Organization:**
- Component-level: `index.less` in component directory
- Global overrides: `components/style.less`

## Code Quality Enforcement

**Pre-Commit Quality Check:**
```bash
# Run linter
oxlint

# Run formatter
oxfmt write .
```

**CI/CD:**
- GitHub Actions workflow for publish only
- No automated testing in CI (no tests configured)

---

*Convention analysis: 2026-05-06*
