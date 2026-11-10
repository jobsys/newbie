import _NewbieProvider from "./NewbieProvider.jsx";
import _NewbieThemeProvider from "./NewbieThemeProvider.jsx";
import withInstall from "../../utils/withInstall";

export const NewbieProvider = withInstall(_NewbieProvider);
export const NewbieThemeProvider = _NewbieThemeProvider;
export { createNewbieTheme, NEWBIE_DENSITIES, NEWBIE_DENSITY_PRESETS } from "./theme.js";
export default NewbieProvider;
