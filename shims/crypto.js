/**
 * sm-crypto-v2 在缺少 globalThis.crypto 的环境里会动态 `import("crypto")`
 * 作为 Node 兜底。库的构建目标是浏览器，且 engines 要求 Node >= 20.19
 * （该版本起自带 Web Crypto），这个兜底分支不会被走到；但 Rolldown 仍会
 * 把 `crypto` 当成 Node 内置模块 externalize 并给出告警。
 *
 * 通过 vite resolve.alias 把 `crypto` 指到本文件，让该分支在产物里保持
 * 无害的空实现，避免构建告警和多余的 __vite-browser-external chunk。
 */
export default {};
