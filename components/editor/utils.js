export function genErrorInfo(fnName) {
  let info = `请使用 '@${fnName}' 事件，不要放在 props 中`;
  info += `\nPlease use '@${fnName}' event instead of props`;
  return info;
}
