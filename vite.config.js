import { defineConfig } from "rolldown-vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		Components({
			resolvers: [AntDesignVueResolver({ importStyle: "less" })],
		}),
	],
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},
	},
	build: {
		lib: {
			entry: ["./index.js", "./hooks/index.js", "./directives/index.js"],
			fileName: (format, entryName) => {
				const extension = format === "es" ? "js" : "cjs";
				return `${entryName}.${extension}`;
			},
		},
		sourcemap: true,
		rollupOptions: {
			input: {
				"jobsys-newbie": "./index.js",
				hooks: "./hooks/index.js",
				directives: "./directives/index.js",
			},
			// make sure to externalize deps that shouldn't be bundledinto your library
			external: [
				"vue",
				"ant-design-vue",
				"@ant-design/icons-vue",
				"axios",
				"dayjs",
				"lodash-es",
				"vuedraggable",
			],
			output: {
				exports: "named",
				globals: {
					vue: "Vue",
					axios: "axios",
					dayjs: "dayjs",
					"ant-design-vue": "antdv",
					"@ant-design/icons-vue": "antdvi",
					"lodash-es": "lodash",
				},
			},
		},
	},
	server: {
		host: true,
		port: 3000,
	},
});
