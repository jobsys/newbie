import { createI18n } from "vue-i18n";

// 导入语言包
import zhCN from "./locales/zh_CN.json";
import enUS from "./locales/en_US.json";

const messages = {
  zh_CN: zhCN,
  en_US: enUS,
};

const i18n = createI18n({
  legacy: false,
  locale: "zh_CN", // 默认语言
  fallbackLocale: "zh_CN", // 回退语言
  messages,
});

export default i18n;
