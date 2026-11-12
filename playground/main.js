import { createApp } from "vue";
import App from "./App.vue";
import Newbie from "../index.js";
import http from "./http.js";
import "antdv-next/dist/reset.css";
import "./docs/styles/docs.less";
//import Newbie from "../../newbie/dist/jobsys-newbie.js"

const app = createApp(App);
app.use(Newbie).use(http);

app.mount("#app");
