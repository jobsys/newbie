import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntdvNextResolver } from "@antdv-next/auto-import-resolver";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// `vite build --mode docs` 构建 playground 文档站；
	// 默认模式仍然构建组件库产物。
	const isDocs = mode === "docs";

	const shared = {
		plugins: [
			vue(),
			vueJsx(),
			Components({
				resolvers: [AntdvNextResolver()],
			}),
		],
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
				},
			},
		},
		resolve: {
			alias: {
				// sm-crypto-v2 的 Node 兜底分支见 shims/crypto.js
				crypto: fileURLToPath(new URL("./shims/crypto.js", import.meta.url)),
			},
		},
		server: {
			host: true,
			port: 3000,
		},
	};

	if (isDocs) {
		return {
			...shared,
			build: {
				outDir: "dist-docs",
				emptyOutDir: true,
			},
		};
	}

	return {
		...shared,
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
				// 字符串只做全等匹配，子路径（如 antdv-next/dist/form/context）
				// 必须用正则，否则会被打进产物，导致库内 InjectionKey / Context
				// 与宿主应用不是同一个实例。
				external: [
					"vue",
					/^antdv-next(\/|$)/,
					/^@antdv-next\/icons(\/|$)/,
					"axios",
					"dayjs",
					"lodash-es",
				],
				output: {
					exports: "named",
					globals: {
						vue: "Vue",
						axios: "axios",
						dayjs: "dayjs",
						"antdv-next": "antdv",
						"@antdv-next/icons": "antdvi",
						"lodash-es": "lodash",
					},
				},
			},
		},
	};
});
