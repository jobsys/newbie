# External Integrations

**Analysis Date:** 2026-05-06

## APIs & External Services

**HTTP/AJAX:**
- axios 1.7.9 - HTTP client for API requests
  - Used in: `hooks/network.js`
  - Provides: `useFetch()`, `usePage()` composables for data fetching
  - Externalized: Must be provided by consuming application

**Cryptographic Services:**
- sm-crypto-v2 1.10.0 - Chinese national cryptographic standards
  - SM2: Asymmetric encryption/digital signatures
  - SM3: Cryptographic hash function
  - SM4: Symmetric block cipher
  - Used in: `hooks/cipher.js`

## Data Storage

**Local Storage:**
- No direct localStorage/sessionStorage integration detected
- Uses Vue reactivity for state management

**File Upload:**
- resumablejs 1.1.0 - Resumable chunked file uploads
  - Used in: `components/uploader/`

**Rich Text:**
- @wangeditor/editor 5.1.23 - WangEditor rich text editor
  - Chinese-developed WYSIWYG editor
  - Used in: `components/editor/`

## Authentication & Identity

**Auth Directive:**
- `directives/auth.js` - Permission-based visibility directive
  - `v-auth` directive for showing/hiding elements based on permissions
  - `setDefaultPermissions()` for configuring permission checking

**HTTP Status Integration:**
- Configurable status codes via `Newbie.config({ httpStatus })`
- Default status codes in `hooks/network.js`:
  - `STATE_CODE_SUCCESS`: "SUCCESS"
  - `STATE_CODE_FAIL`: "FAIL"
  - `STATE_CODE_NOT_FOUND`: "NOT_FOUND"
  - `STATE_CODE_INFO_NOT_COMPLETE`: "INCOMPLETE"
  - `STATE_CODE_NOT_ALLOWED`: "NOT_ALLOWED"

## UI/UX Integrations

**Animation:**
- animejs 3.2.1 - JavaScript animation library
  - Used for component animations

**Drag & Drop:**
- vuedraggable 4.1.0 - Vue wrapper for SortableJS
  - Used in form designer and table components
  - Externalized as peer dependency

**Signature Capture:**
- signature_pad 5.0.7 - HTML5 canvas-based signatures
  - Used in: `components/signature-pad/`

**Icons:**
- @ant-design/icons-vue 6.1.0 - Ant Design icon set
  - Externalized peer dependency

## Internationalization (i18n)

**Framework:**
- vue-i18n 11.1.11 - Vue I18n integration
  - Configuration: `i18n.js`
  - Legacy mode disabled (Vue 3 Composition API style)
  - Default locale: zh_CN (Chinese Simplified)
  - Fallback locale: zh_CN

**Supported Locales:**
- `locales/zh_CN.json` - Chinese Simplified (primary)
- `locales/en_US.json` - English (United States)

**Translation Namespaces:**
- `common` - General UI strings (actions, confirmations, loading states)
- `form` - Form labels, placeholders, upload messages
- `search` - Search operators, time ranges, sorting
- `table` - Table-related strings
- `signature-pad` - Signature component messages

## Theming

**Ant Design Theme:**
- `antd-theme-token.json` - Complete Ant Design 5.x design token set
  - Colors: Primary blue (#1677ff), success, warning, error palettes
  - Typography: Font families, sizes, line heights
  - Spacing: size unit system (4px base)
  - Motion: Animation timing functions and durations
  - Border radius values
  - Used for consistent theming with ant-design-vue

## CI/CD & Deployment

**GitHub Actions:**
- `.github/workflows/npm-publish.yml` - Automated NPM publishing
  - Triggers: Git tags starting with 'v' or manual dispatch
  - Node.js 20 environment
  - Steps: checkout, corepack enable, pnpm install, build, publish
  - Requires: `NPM_TOKEN` secret configured

**Package Registry:**
- npmjs.org - Public package registry
- Package name: `jobsys-newbie`

## Environment Configuration

**Build-Time Variables:**
- No .env files detected
- Configuration passed via plugin install: `Newbie.config({ httpStatus })`

**No External Service Keys:**
- No API keys, secrets, or service credentials in repository
- All external services require consumer-provided configuration

## Component Dependencies

**Ant Design Vue Components Used:**
The library extends ant-design-vue and uses these base components:
- Button, Modal, Form, Input, Select, DatePicker, etc.
- Icons from @ant-design/icons-vue

**Peer Dependency Requirements:**
Consuming applications must install:
```json
{
  "vue": "3.5.13",
  "ant-design-vue": "4.2.6",
  "@ant-design/icons-vue": "6.1.0",
  "axios": "1.7.9",
  "dayjs": "1.11.13",
  "lodash-es": "4.17.21"
}
```

## Browser Compatibility

**Target:** Modern browsers supporting ES2024

**Required Features:**
- ES2024 JavaScript
- Vue 3 reactivity system
- CSS Custom Properties (for theming)
- Canvas API (for signature pad)

---

*Integration audit: 2026-05-06*
