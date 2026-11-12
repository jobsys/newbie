import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

const resolvedViteConfig =
	typeof viteConfig === "function"
		? viteConfig({ command: "serve", mode: "test" })
		: viteConfig;

export default mergeConfig(
	resolvedViteConfig,
	defineConfig({
		test: {
			environment: "jsdom",
			globals: true,
			include: ["tests/**/*.test.{js,jsx}"],
			setupFiles: ["./tests/setup.js"],
		},
	})
);
