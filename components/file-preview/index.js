import _NewbieFilePreview from "./NewbieFilePreview.jsx";
import withInstall from "../../utils/withInstall";

export const NewbieFilePreview = withInstall(_NewbieFilePreview);
export { getFileExtension, getPreviewKind } from "./utils.js";
export default NewbieFilePreview;
