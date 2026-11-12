import * as components from "./components";
import { _configStatus } from "./hooks";
import i18n from "./i18n"; // 引入 i18n 配置
import { isNewbieComponent } from "./utils/withInstall";

export * from "./components";

export default {
  install(app) {
    // 宿主已安装 vue-i18n 时直接复用，避免安装第二个实例导致宿主切换语言不影响库内文案
    if (!app.config.globalProperties?.$i18n) {
      app.use(i18n);
    }
    for (const component of Object.values(components)) {
      // 只安装 withInstall 标记过的库组件，跳过 theme 常量、工具函数与普通插件
      if (isNewbieComponent(component)) {
        app.use(component);
      }
    }
  },
  /**
   * 用于配置一些全局的工具参数
   * @param httpStatus
   */
  config({ httpStatus }) {
    if (httpStatus && Object.keys(httpStatus).length) {
      _configStatus(httpStatus);
    }
  },
};
