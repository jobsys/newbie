import axios from "axios";
import { Modal } from "ant-design-vue";

export default {
  install(app, options) {
    options = options || {};
    axios.defaults.baseURL = options.baseUrl || "/";
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    axios.defaults.withCredentials = false;

    axios.interceptors.response.use(
      response => {
        if (response.headers["x-inertia"]) {
          return response;
        }
        return response && response.data;
      },
      error => {
        if (error.response.status === 401) {
          Modal.error({
            title: "消息提醒",
            content: "登录状态已失效，请重新登录",
          });
        } else if (error.response.status === 403) {
          Modal.error({
            title: "消息提醒",
            content: "您没有权限访问该页面",
          });
        } else if (!options.disabledError) {
          Modal.error({
            title: "网络出错",
            content: error.response && error.response.status,
          });
        }

        return Promise.reject(error);
      }
    );

    app.config.globalProperties.$http = axios;

    app.provide("http", axios);
  },
};
