import _NewbieApp from "./NewbieApp.jsx";
import _NewbieProvider from "./NewbieProvider.jsx";
import _NewbieThemeProvider from "./NewbieThemeProvider.jsx";
import withInstall from "../../utils/withInstall";

export const NewbieProvider = withInstall(_NewbieProvider);
export const NewbieThemeProvider = _NewbieThemeProvider;
export const NewbieApp = _NewbieApp;
export { createNewbieTheme, NEWBIE_DENSITIES, NEWBIE_DENSITY_PRESETS } from "./theme.js";
export { applyThemeVariables, createThemeVariables, NEWBIE_THEME_VARIABLES } from "./theme.js";
export { useNewbieTheme } from "./useNewbieTheme.js";
export { NEWBIE_CONFIG, EMPTY_CONFIG, mergeConfig } from "./config.js";
export default NewbieProvider;
