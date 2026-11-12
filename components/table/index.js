import _NewbieTable from "./NewbieTable.jsx";
import withInstall from "../../utils/withInstall";

// 渲染助手从 helpers 直接导出，render* 为新名字，use* 为向后兼容别名
export {
  renderTableActions,
  renderTableImage,
  renderTableFile,
  useTableActions,
  useTableImage,
  useTableFile,
} from "./helpers.jsx";

export const NewbieTable = withInstall(_NewbieTable);
export default NewbieTable;
