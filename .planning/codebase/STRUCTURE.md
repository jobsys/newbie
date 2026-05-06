# Codebase Structure

**Analysis Date:** 2026-05-06

## Directory Layout

```
newbie/
├── components/              # Vue components (JSX-based)
│   ├── address/            # Address picker component
│   ├── button/             # Enhanced button with loading state
│   ├── copy/               # Copy to clipboard component
│   ├── editor/             # WangEditor integration
│   ├── form/               # JSON-driven form generator
│   ├── form-designer/      # Visual form designer
│   ├── list/               # List/iterator component
│   ├── modal/              # Modal/Drawer wrapper
│   ├── password/           # Password input with strength
│   ├── provider/           # Configuration provider component
│   ├── search/             # Advanced search component
│   ├── signature-pad/      # Signature canvas component
│   ├── table/              # Data table with search integration
│   └── uploader/           # File upload component
├── directives/             # Custom Vue directives
├── hooks/                  # Composable functions
├── locales/                # i18n translation files
├── utils/                  # Shared utility functions
├── playground/             # Development testing environment
├── dist/                   # Build output (generated)
├── index.js                # Main library entry point
├── i18n.js                 # i18n configuration
├── package.json            # Package manifest
└── vite.config.js          # Vite/Rolldown build config
```

## Directory Purposes

**components/:**
- Purpose: All Vue 3 components written in JSX
- Contains: Component directories, each with JSX file, index.js, styles
- Key files:
  - `components/index.js` - Barrel export for all components
  - `components/provider/NewbieProvider.jsx` - Central configuration provider
  - `components/form/NewbieForm.jsx` - Core form generator
  - `components/table/NewbieTable.jsx` - Data table with integrated search

**components/[name]/:**
- Standard structure per component:
  - `Newbie[Name].jsx` - Main component implementation
  - `index.js` - Barrel export with `withInstall` wrapper
  - `index.less` - Component-specific styles
  - `components/` - Sub-components (if complex)

**directives/:**
- Purpose: Vue custom directives
- Contains:
  - `auth.js` - Permission-based visibility directive (`v-auth`)
  - `index.js` - Barrel exports

**hooks/:**
- Purpose: Composition functions for reusable logic
- Contains:
  - `index.js` - Barrel exports
  - `cipher.js` - SM2/SM3/SM4 encryption utilities
  - `datetime.js` - Date/time utilities
  - `form.js` - Form processing utilities
  - `interact.js` - UI interaction utilities
  - `network.js` - HTTP request wrapper (`useFetch`)
  - `regex.js` - Regular expression patterns
  - `utils.js` - General utilities
  - `i18n.js` - Internationalization helpers

**locales/:**
- Purpose: Translation files for vue-i18n
- Contains:
  - `zh_CN.json` - Chinese (Simplified) translations
  - `en_US.json` - English (US) translations

**utils/:**
- Purpose: Helper utilities
- Contains:
  - `withInstall.js` - Vue plugin install wrapper
  - `style.js` - CSS/style utilities

**playground/:**
- Purpose: Development testing environment
- Contains:
  - `App.vue` - Main app with component switcher
  - `[component]/Test[Component].vue` - Test pages per component

**dist/ (Generated):**
- Purpose: Build output
- Generated files:
  - `jobsys-newbie.js` / `jobsys-newbie.cjs` - Main bundle
  - `hooks.js` / `hooks.cjs` - Hooks-only bundle
  - `directives.js` / `directives.cjs` - Directives-only bundle
  - `jobsys-newbie.css` - Styles

## Key File Locations

**Entry Points:**
- `index.js` - Main library entry, exports all components + install function
- `hooks/index.js` - Hooks entry, exports all composables
- `directives/index.js` - Directives entry
- `playground/App.vue` - Playground entry

**Configuration:**
- `vite.config.js` - Vite build config with library mode
- `package.json` - Package metadata, peer dependencies, exports map
- `i18n.js` - vue-i18n setup with locale messages

**Core Logic:**
- `components/provider/NewbieProvider.jsx` - Configuration provider with injection symbols
- `components/form/NewbieForm.jsx` - Form generation and submission logic
- `components/table/NewbieTable.jsx` - Data fetching, pagination, cell editing
- `hooks/network.js` - HTTP abstraction with loading state
- `hooks/form.js` - Form validation and data formatting

**Testing:**
- `playground/[component]/Test[Component].vue` - Component test pages
- `playground/App.vue` - Test harness with component selector

## Naming Conventions

**Files:**
- Components: `Newbie[PascalCaseName].jsx` (e.g., `NewbieForm.jsx`)
- Hooks: `camelCase.js` (e.g., `useFetch` in `network.js`)
- Directives: `camelCase.js` (e.g., `auth.js`)
- Styles: `index.less` (co-located with component)
- Index barrels: `index.js`

**Directories:**
- kebab-case for multi-word names (e.g., `form-designer/`, `signature-pad/`)
- lowercase for single words (e.g., `hooks/`, `utils/`)

**Exports:**
- Components: `export const NewbieXxx = withInstall(_NewbieXxx)`
- Hooks: `export function useXxx()` or `export const useXxx = ...`
- Directives: `export { directiveName, helperFunction }`

## Where to Add New Code

**New Component:**
1. Create directory: `components/[kebab-name]/`
2. Create `Newbie[PascalName].jsx` with component implementation
3. Create `index.js` with `withInstall` wrapper
4. Create `index.less` for styles (if needed)
5. Add export to `components/index.js`
6. Add test page: `playground/[name]/Test[PascalName].vue`
7. Register in `playground/App.vue` options array

**New Form Field Type:**
1. Create factory function: `components/form/components/[PascalType].jsx`
2. Export from `components/form/components/index.js`
3. Reference in `components/form/components/Layout.jsx` type mapping

**New Hook:**
1. Add to existing file in `hooks/` OR create new file
2. Export from `hooks/index.js`
3. Document with JSDoc comments

**New Directive:**
1. Create file: `directives/[name].js`
2. Export from `directives/index.js`
3. Include install function for Vue app registration

**New Locale:**
1. Create file: `locales/[locale_code].json`
2. Add to `i18n.js` messages object

## Special Directories

**components/form/components/:**
- Purpose: Form field type implementations
- Pattern: Each file exports a `create[Type]` factory function
- Usage: Dynamically invoked by `Layout.jsx` based on form config

**components/search/components/:**
- Purpose: Search field type implementations
- Pattern: Similar to form components with condition operators

**playground/:**
- Purpose: Development only - not included in npm package
- Structure: Mirrors component structure with test implementations
- Excluded from build via `vite.config.js` external handling

**dist/:**
- Purpose: Build output
- Generated: Yes (via `vite build`)
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-05-06*
