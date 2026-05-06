# Codebase Concerns

**Analysis Date:** 2026-05-06

## Tech Debt

**Form Component Duplicate Processing:**
- Issue: Form submission performs duplicate `cloneDeep` operations - once in individual item `beforeSubmit` handlers and again in `useFormFormat`
- Files: `D:/statics/newbie/components/form/NewbieForm.jsx` (lines 370-391)
- Impact: Unnecessary memory overhead on large forms, potential performance degradation
- Fix approach: Consolidate form processing into single pass; remove redundant cloning

**Table Component Request Queue Handling:**
- Issue: Request queue logic uses timestamp-based deduplication but processes all queue items
- Files: `D:/statics/newbie/components/table/NewbieTable.jsx` (lines 370-401)
- Impact: Race conditions possible with rapid pagination changes, stale data may render
- Fix approach: Implement proper request cancellation using AbortController or axios cancel tokens

**Editor Dynamic Import Without Error Handling:**
- Issue: WangEditor dynamic import lacks catch block for network/load failures
- Files: `D:/statics/newbie/components/editor/components/WangEditor.vue` (line 156)
- Impact: Silent failures if CDN/module unavailable, component appears broken without feedback
- Fix approach: Add `.catch()` handler with user-visible error message

**Address Data Hardcoded:**
- Issue: Chinese address data (`addressData.json`) is ~90KB+ embedded JSON loaded synchronously
- Files: `D:/statics/newbie/components/address/addressData.json`, `D:/statics/newbie/components/address/NewbieAddress.jsx`
- Impact: Increases bundle size significantly for all users regardless of address feature usage
- Fix approach: Lazy-load address data only when component first rendered

## Known Bugs

**Uploader Required Validation:**
- Symptoms: Required validation not working correctly for file uploads
- Files: `D:/statics/newbie/components/uploader/NewbieUploader.jsx`
- Trigger: Using `required: true` on uploader field in form
- Workaround: Manual validation in form submit handler
- Status: Listed in `D:/statics/newbie/TODOs.md`

**Select Multiple Required Validation:**
- Symptoms: Multi-select required check fails incorrectly
- Files: `D:/statics/newbie/components/form/components/Select.jsx`, `D:/statics/newbie/components/form/components/FormItem.jsx`
- Trigger: Using `mode: 'multiple'` with `required: true`
- Workaround: Custom validator function in rules array
- Status: Listed in `D:/statics/newbie/TODOs.md`

**Table Selection Fixed Column:**
- Symptoms: Selection column positioning issues with fixed columns
- Files: `D:/statics/newbie/components/table/NewbieTable.jsx` (lines 803-821)
- Trigger: Using both `rowSelection` and column `fixed` property
- Workaround: Avoid fixed columns with selection enabled
- Status: Listed in `D:/statics/newbie/TODOs.md`

**SM4 Decrypt Function Bug:**
- Issue: `useSm4Decrypt` incorrectly calls `sm4.encrypt` instead of `sm4.decrypt`
- Files: `D:/statics/newbie/hooks/cipher.js` (line 42-43)
- Impact: Decryption operations will fail or produce incorrect results
- Fix approach: Change `sm4.encrypt` to `sm4.decrypt`

**Table Page Size Change:**
- Symptoms: Changing page size does not trigger data reload properly
- Files: `D:/statics/newbie/components/table/NewbieTable.jsx`
- Status: Marked as fixed in TODOs but may need verification

## Security Considerations

**File Upload Security:**
- Risk: No client-side file type validation beyond HTML accept attribute; server-side validation required
- Files: `D:/statics/newbie/components/uploader/NewbieUploader.jsx` (lines 35, 286-297)
- Current mitigation: File size check only (`maxSize` prop)
- Recommendations: Add magic number/file signature validation, implement virus scanning on server

**XSS via Editor Content:**
- Risk: WangEditor allows HTML content without sanitization
- Files: `D:/statics/newbie/components/editor/NewbieEditor.jsx`, `D:/statics/newbie/components/editor/components/WangEditor.vue`
- Current mitigation: None visible in code
- Recommendations: Implement DOMPurify or similar HTML sanitization before displaying editor content

**CSRF Token Handling:**
- Risk: `useHiddenForm` reads CSRF token from meta tag but provides no fallback
- Files: `D:/statics/newbie/hooks/form.js` (lines 57-63)
- Current mitigation: Attempts to read from `<meta name="csrf-token">`
- Recommendations: Add explicit CSRF token prop, validate token presence

**Auth Directive DOM Manipulation:**
- Risk: `v-auth` directive uses `el.style.display = "none"` which can be bypassed via browser dev tools
- Files: `D:/statics/newbie/directives/auth.js` (lines 38, 42, 46)
- Current mitigation: Visual hiding only
- Recommendations: Use conditional rendering or route guards for security-critical features; directive should supplement, not replace, server-side authorization

**Cipher Hook Exposes SM2 Instance:**
- Risk: `useSm2()` returns raw sm2 instance allowing any cryptographic operation
- Files: `D:/statics/newbie/hooks/cipher.js` (lines 10-12)
- Current mitigation: None
- Recommendations: Wrap operations in constrained functions; avoid exposing full crypto library interface

## Performance Bottlenecks

**Large Table Rendering:**
- Problem: Table renders all rows without virtualization; page sizes up to 500 supported
- Files: `D:/statics/newbie/components/table/NewbieTable.jsx` (line 780: `pageSizeOptions: ["10", "30", "50", "100", "300", "500"]`)
- Cause: No virtual scrolling implementation
- Improvement path: Implement row virtualization using `@vueuse/virtualList` or similar for large datasets

**Form Deep Cloning on Every Change:**
- Problem: `cloneDeep` used extensively in form value processing
- Files: `D:/statics/newbie/components/form/NewbieForm.jsx` (lines 307-338, 372, 391, 404)
- Cause: Immutable update patterns without optimization
- Improvement path: Use structural sharing or selective cloning; consider Immer.js

**Address Data Synchronous Load:**
- Problem: 90KB+ address JSON loaded and parsed on component initialization
- Files: `D:/statics/newbie/components/address/addressData.json`
- Cause: Static import of large dataset
- Improvement path: Dynamic import with loading state; consider IndexedDB for caching

**Editor Toolbar Recreation:**
- Problem: Toolbar element recreated on each render cycle
- Files: `D:/statics/newbie/components/editor/NewbieEditor.jsx` (lines 178-190)
- Cause: Function called in render without memoization
- Improvement path: Use `computed` or `shallowRef` to cache toolbar element

**Table Column Recursion:**
- Problem: `tidyColumnsRecursion` and `tidyCustomColumnsRecursion` called on every column change
- Files: `D:/statics/newbie/components/table/NewbieTable.jsx` (lines 438-488)
- Cause: Deep cloning and recursion without memoization
- Improvement path: Memoize column transformations; use computed properties more aggressively

## Fragile Areas

**Form Group Component:**
- Files: `D:/statics/newbie/components/form/components/Group.jsx`
- Why fragile: Complex nested rendering with multiple conditional paths; tight coupling with table display logic
- Safe modification: Maintain `item.type` checks in bodyCell renderer; test all field types in groups
- Test coverage: Limited; relies on manual integration testing

**Table Editable Cell Feature:**
- Files: `D:/statics/newbie/components/table/NewbieTable.jsx` (lines 824-984)
- Why fragile: State management split between `editingData` and `editingSwitchData`; complex event handling
- Safe modification: Avoid changing state structure; use provided helper functions only
- Test coverage: No automated tests visible

**Signature Pad Window Resize Handler:**
- Files: `D:/statics/newbie/components/signature-pad/NewbieSignaturePad.jsx` (line 52)
- Why fragile: Global `window.onresize` assignment overwrites other handlers
- Safe modification: Use `addEventListener` with proper cleanup in `onBeforeUnmount`
- Test coverage: None

**Form Layout Engine:**
- Files: `D:/statics/newbie/components/form/components/Layout.jsx`
- Why fragile: Complex grid calculation with placeholder logic; manual DOM manipulation for collapse animations
- Safe modification: Avoid changing row/column index calculations; test with various `columns` configurations
- Test coverage: Manual testing only

**Search Component Persistence:**
- Files: `D:/statics/newbie/components/search/NewbieSearch.jsx`
- Why fragile: localStorage keys generated from URL hashes; collision possible with dynamic routes
- Safe modification: Ensure unique `persistence` prop values across pages
- Test coverage: None

## Scaling Limits

**LocalStorage Persistence:**
- Current capacity: 5-10MB browser limit shared across all data
- Limit: Table and Search persistence use `useCache` with localStorage; unbounded growth
- Scaling path: Implement LRU eviction; add size limits; consider IndexedDB for larger datasets

**Concurrent Uploads:**
- Current capacity: `simultaneousUploads: 3` in resumable config
- Limit: Hardcoded in `D:/statics/newbie/components/uploader/NewbieUploader.jsx` (line 363)
- Scaling path: Make configurable via props; implement adaptive concurrency based on network conditions

**Form Field Count:**
- Current capacity: No explicit limit
- Limit: Deep cloning and validation overhead grows with field count
- Scaling path: Benchmark with 100+ fields; implement field lazy-loading for very large forms

**Table Column Customization:**
- Current capacity: All columns stored in reactive state
- Limit: Memory usage grows with column count and nested children
- Scaling path: Virtualize column headers; lazy-render nested column groups

## Dependencies at Risk

**WangEditor:**
- Risk: Version 5.1.23; v6 is available with breaking changes
- Impact: Security updates may not be backported to v5
- Migration plan: Evaluate v6 migration; consider alternative editors (TipTap, Quill) if migration cost high

**ResumableJS:**
- Risk: Version 1.1.0 from 2018; minimal recent maintenance
- Impact: Chunk upload reliability issues in modern browsers
- Migration plan: Evaluate native `fetch` with Streams API or tus-js-client as replacement

**VueUse Components:**
- Risk: Version 10.3.0 pinned; minor version behind latest
- Impact: Missing bug fixes and performance improvements
- Migration plan: Update to latest 10.x; test drag functionality in `NewbieModal.jsx`

**SM-Crypto-V2:**
- Risk: SM algorithms primarily used in China; limited community outside Chinese ecosystem
- Impact: Limited documentation and support in English
- Migration plan: Document usage patterns thoroughly; consider fallback to standard crypto for international deployments

## Missing Critical Features

**Accessibility (a11y) Gaps:**
- Problem: No ARIA labels on custom form components; modal lacks focus trapping
- Blocks: WCAG 2.1 AA compliance not achievable
- Priority: High for government/enterprise clients

**Error Boundary:**
- Problem: No error boundaries around complex components (Table, Form, Editor)
- Blocks: Single component error can crash entire application
- Priority: Medium

**Image Upload Preprocessing:**
- Problem: No client-side image resizing/optimization before upload
- Blocks: Users uploading multi-MB images directly
- Priority: Medium

**Internationalization Coverage:**
- Problem: Hardcoded Chinese strings in some components; `addressData.json` Chinese-only
- Blocks: Full internationalization support
- Priority: Low-Medium

## Test Coverage Gaps

**No Unit Tests Detected:**
- What's not tested: Component logic, hooks, utility functions
- Files: All `.jsx` and `.js` files in `components/` and `hooks/`
- Risk: Regressions in complex form validation and table operations
- Priority: High - implement testing framework (Vitest recommended based on existing Vite setup)

**Upload Error Scenarios:**
- What's not tested: Network failures, partial chunk failures, server errors
- Files: `D:/statics/newbie/components/uploader/NewbieUploader.jsx`
- Risk: Resumable upload edge cases untested
- Priority: High

**Form Validation Edge Cases:**
- What's not tested: Matrix field validation, nested group validation, conditional required fields
- Files: `D:/statics/newbie/components/form/components/FormItem.jsx`
- Risk: Validation logic may fail on complex form configurations
- Priority: Medium

**Crypto Operations:**
- What's not tested: SM2/SM3/SM4 encryption/decryption round-trips
- Files: `D:/statics/newbie/hooks/cipher.js`
- Risk: The SM4 decrypt bug demonstrates lack of testing
- Priority: High

---

*Concerns audit: 2026-05-06*
