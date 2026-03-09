import _NewbieAddress, { useAddressFullCode as _useAddressFullCode } from "./NewbieAddress.jsx";
import withInstall from "../../utils/withInstall";

export const useAddressFullCode = _useAddressFullCode;
export const NewbieAddress = withInstall(_NewbieAddress);
export default NewbieAddress;
