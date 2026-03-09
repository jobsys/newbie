import { createApp } from "vue";
import App from "./App.vue";
import Newbie from "../index.js";
import http from "./http.js";
import "ant-design-vue/dist/reset.css";
//import Newbie from "../../newbie/dist/jobsys-newbie.js"

const app = createApp(App);
app.use(Newbie).use(http);

app.mount("#app");
