import _NewbieTable, {
  useTableActions as _useTableActions,
  useTableFile as _useTableFile,
  useTableImage as _useTableImage,
} from "./NewbieTable.jsx";
import withInstall from "../../utils/withInstall";

export const useTableActions = _useTableActions;
export const useTableImage = _useTableImage;
export const useTableFile = _useTableFile;
export const NewbieTable = withInstall(_NewbieTable);
export default NewbieTable;
