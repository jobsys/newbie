import * as components from "./components";
import { _configStatus } from "./hooks";
import i18n from "./i18n"; // 引入 i18n 配置

export * from "./components";

export default {
  install(app) {
    app.use(i18n);
    for (const componentKey in components) {
      const component = components[componentKey];
      // 只安装真正的组件/插件，跳过 theme 常量、工具函数等导出
      if (component && typeof component.install === "function") {
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
