# Technology Stack

**Analysis Date:** 2026-05-06

## Languages

**Primary:**
- JavaScript (ES2024) - Core library implementation
- Vue Single File Components (.vue) - Component definitions

**Secondary:**
- Less - CSS preprocessing for component styles
- JSON - Configuration and locale files

## Runtime

**Environment:**
- Node.js 20+ (CI/CD requirement per `.github/workflows/npm-publish.yml`)
- Browser (ES2024 compatible)

**Package Manager:**
- pnpm (evident from `pnpm-lock.yaml`)
- Lockfile: Present

## Frameworks

**Core:**
- Vue 3.5.13 - Primary framework (Composition API, `<script setup>`)
- Ant Design Vue 4.2.6 - Base UI component library (peer dependency)
- @ant-design/icons-vue 6.1.0 - Icon components (peer dependency)

**State & Reactivity:**
- @vueuse/core 10.2.1 - Vue utility functions
- @vueuse/components 10.3.0 - Vueuse component bindings

**Build & Development:**
- rolldown-vite 7.3.1 - Build tool (Vite-based with Rolldown for faster bundling)
- @vitejs/plugin-vue 6.0.4 - Vue plugin for Vite
- @vitejs/plugin-vue-jsx 5.1.4 - JSX support for Vue
- unplugin-vue-components 28.0.0 - Auto-import components with AntDesignVueResolver

**Styling:**
- Less 4.2.2 - CSS preprocessor
- Autoprefixer 10.4.21 - CSS vendor prefixing
- PostCSS 8.5.1 - CSS processing

## Key Dependencies

**Critical (Bundled):**
- vue-i18n 11.1.11 - Internationalization support
- sm-crypto-v2 1.10.0 - Chinese SM2/SM3/SM4 cryptographic algorithms
- @wangeditor/editor 5.1.23 - Rich text editor component
- signature_pad 5.0.7 - Signature pad component
- vuedraggable 4.1.0 - Drag and drop functionality
- resumablejs 1.1.0 - Resumable file uploads
- animejs 3.2.1 - Animation library

**Peer Dependencies (Not Bundled - Consumer Must Install):**
- vue 3.5.13 - Vue framework
- ant-design-vue 4.2.6 - Base components
- @ant-design/icons-vue 6.1.0 - Icons
- axios 1.7.9 - HTTP client (used in `hooks/network.js`)
- dayjs 1.11.13 - Date/time library
- lodash-es 4.17.21 - Utility library

**Externalized in Build:**
- vue, ant-design-vue, @ant-design/icons-vue, axios, dayjs, lodash-es, vuedraggable

## Configuration

**Build Configuration:**
- `vite.config.js` - Main build configuration
  - Library mode with multiple entry points (`index.js`, `hooks/index.js`, `directives/index.js`)
  - ES and CJS output formats
  - Source maps enabled
  - Less preprocessor with JavaScript enabled
  - Dev server on port 3000

**Code Quality:**
- `oxlint` 1.51.0 - Linting (OXC-based, fast Rust implementation)
- `oxfmt` 0.36.0 - Code formatting
- `.oxlintrc.json` - Lint rules (import, node, unicorn plugins)
- `.oxfmtrc.json` - Format config (tabs, double quotes, 100 char line width)

**TypeScript Declarations:**
- `components.d.ts` - Auto-generated component type declarations from unplugin-vue-components

## Platform Requirements

**Development:**
- Node.js 20+
- pnpm package manager
- Modern browser with ES2024 support

**Production:**
- Browser with Vue 3 support
- Requires peer dependencies to be installed by consumer
- Supports both ESM (`dist/*.js`) and CommonJS (`dist/*.cjs`) consumption

**NPM Package:**
- Name: `jobsys-newbie`
- Version: 3.0.1
- Published to npm registry via GitHub Actions
- Multiple entry points for tree-shaking:
  - Main: `dist/jobsys-newbie.js` (components + i18n)
  - Hooks: `dist/hooks.js` (composable functions)
  - Directives: `dist/directives.js` (Vue directives)
  - CSS: `dist/jobsys-newbie.css`

---

*Stack analysis: 2026-05-06*
