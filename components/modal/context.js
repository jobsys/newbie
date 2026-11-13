/**
 * NewbieModal 与内部表单之间的通信通道。
 *
 * 按钮的「内容」（提交状态、校验、i18n、确认提示）由 NewbieForm 负责，
 * 按钮的「位置」（Drawer / Modal 底部固定区）由 NewbieModal 负责。
 * 子组件通过 register 注册一个渲染函数，NewbieModal 在底部动作区调用它，
 * 这样表单不需要知道具体弹层类型，弹层也不需要知道表单的提交细节。
 */
export const NEWBIE_MODAL_ACTIONS = Symbol("newbie-modal-actions");
