# Architecture

**Analysis Date:** 2026-05-06

## Pattern Overview

**Overall:** Plugin-based Vue 3 Component Library Architecture

**Key Characteristics:**
- Enhanced wrapper library around `ant-design-vue` (v4.2.6)
- JSX-based component definitions using `@vitejs/plugin-vue-jsx`
- Provide/Inject pattern for cross-cutting configuration via `NewbieProvider`
- Factory pattern for dynamic form/search component generation
- Composable (hooks) architecture for reusable logic
- Modular barrel exports for clean public APIs

## Layers

**Components Layer:**
- Purpose: UI components that wrap and extend Ant Design Vue primitives
- Location: `components/`
- Contains: JSX-based Vue components, sub-components, styles
- Depends on: Hooks, Utils, Directives, Ant Design Vue, VueUse
- Used by: Consumer applications, Playground

**Hooks/Composables Layer:**
- Purpose: Reusable logic for network, forms, i18n, cipher, utilities
- Location: `hooks/`
- Contains: Composition functions (`useXxx` pattern)
- Depends on: External libraries (axios, dayjs, sm-crypto-v2, vue-i18n)
- Used by: Components Layer, Consumer applications

**Directives Layer:**
- Purpose: Custom Vue directives for cross-cutting concerns
- Location: `directives/`
- Contains: `v-auth` directive for permission-based visibility
- Depends on: Vue runtime
- Used by: Components Layer, Consumer applications

**Utils Layer:**
- Purpose: Shared utility functions and helpers
- Location: `utils/`
- Contains: `withInstall` helper, style utilities
- Depends on: None (pure functions)
- Used by: Components Layer

**Playground Layer:**
- Purpose: Development testing environment for all components
- Location: `playground/`
- Contains: Vue test files, App.vue router-like component switcher
- Depends on: All other layers
- Used by: Developers (not shipped)

## Data Flow

**Component Initialization Flow:**

1. Library consumer calls `app.use(Newbie)` from `index.js`
2. Plugin installs i18n and registers all components globally
3. Optional: Consumer wraps app with `<NewbieProvider>` to inject config
4. Provider injects configuration symbols (`NEWBIE_TABLE`, `NEWBIE_FORM`, etc.)
5. Child components `inject()` these configs and merge with props

**Form Data Flow:**

1. `NewbieForm` receives `form` config (array of field definitions)
2. Form items processed through factory functions (`createInput`, `createSelect`, etc.)
3. Form state managed in reactive `submitForm` object
4. Validation via Ant Design Vue Form rules
5. Submission processed through `useFormFormat` hook for data transformation
6. HTTP request via `useFetch` hook

**Table Data Flow:**

1. `NewbieTable` receives `columns` config and optional `url`
2. `NewbieSearch` (if `filterable=true`) manages query state
3. Search form data combined with pagination params
4. `useFetch` executes GET/POST request
5. Response processed through `afterFetched` callback
6. Data rendered with optional cell editing support

**State Management:**
- Local state: Vue 3 `reactive()` and `ref()` within components
- Cross-component config: Vue `provide/inject` via symbols
- Persistence: `localStorage` via `useCache` hook (for search/table state)
- No global store (Vuex/Pinia) - intentionally decentralized

## Key Abstractions

**withInstall Helper:**
- Purpose: Converts Vue components into installable plugins
- Location: `utils/withInstall.js`
- Pattern: Adds `install()` method that registers component globally
- Usage: All exported components use this wrapper

**Provider Pattern:**
- Purpose: Hierarchical configuration injection
- Location: `components/provider/NewbieProvider.jsx`
- Symbols: `NEWBIE_LOCALE`, `NEWBIE_EDITOR`, `NEWBIE_TABLE`, `NEWBIE_UPLOADER`, `NEWBIE_FORM`, `NEWBIE_SEARCH`
- Pattern: Props -> Provider -> Inject -> Merge with defaults

**Form Item Factory:**
- Purpose: Dynamic form component generation from JSON config
- Location: `components/form/components/*.jsx`
- Pattern: Factory functions return JSX elements based on `type` property
- Types: input, select, date, number, switch, radio, checkbox, editor, uploader, etc.

**Search Item Factory:**
- Purpose: Dynamic search component generation
- Location: `components/search/components/*.jsx`
- Pattern: Similar to form items but with condition operators (equal, like, between, etc.)

**useFetch Hook:**
- Purpose: HTTP request state management
- Location: `hooks/network.js`
- Pattern: Returns `{get, post}` methods that update loading state
- Integration: Works with `NewbieButton` fetcher prop for automatic loading UI

## Entry Points

**Main Library Entry:**
- Location: `index.js`
- Exports: All components, default install function, global config method
- Usage: `import Newbie from 'jobsys-newbie'; app.use(Newbie)`

**Hooks Entry:**
- Location: `hooks/index.js`
- Exports: All composable functions
- Usage: `import { useFetch, useFormFormat } from 'jobsys-newbie/hooks'`

**Directives Entry:**
- Location: `directives/index.js`
- Exports: `auth` directive, `setDefaultPermissions`
- Usage: `import { auth } from 'jobsys-newbie/directives'`

**Individual Component Entries:**
- Pattern: Each component directory has `index.js` barrel
- Example: `components/form/index.js` exports `NewbieForm`

**Playground Entry:**
- Location: `playground/App.vue`
- Purpose: Component showcase with switcher UI
- Not shipped in distribution

## Error Handling

**Strategy:** Centralized via hooks, with UI feedback via Ant Design Vue `message`

**Patterns:**
- `useFormFail`: Parses form validation errors and displays `message.error()`
- `useProcessStatus`: Handles standardized API response status codes
- `useProcessStatusSuccess`: Success-only variant with callback
- Status constants in `STATUS` object for consistency

## Cross-Cutting Concerns

**Logging:** Console-based, minimal - no dedicated logging framework

**Validation:** 
- Form validation: Ant Design Vue Form rules
- Permission validation: `v-auth` directive with `all/any/none` modifiers

**Authentication:** 
- Directive-based: `v-auth` checks against permission arrays
- Global permission setup via `setDefaultPermissions()`
- Integration point with external auth systems

**Internationalization (i18n):**
- Framework: `vue-i18n` v11.1.11
- Locale files: `locales/zh_CN.json`, `locales/en_US.json`
- Hook: `useT()` for translations, `useI18nJoin()` for language-aware concatenation
- Provider-controlled locale switching

**Styling:**
- Preprocessor: Less (with `javascriptEnabled: true`)
- Base styles: `components/style.less`
- Component-scoped: `index.less` per component
- No CSS-in-JS or utility-first framework

---

*Architecture analysis: 2026-05-06*
