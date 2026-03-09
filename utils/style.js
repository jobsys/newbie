import { isNull, isUndefined } from "lodash-es";

const genPixel = num => {
  if (isNull(num) || isUndefined(num)) {
    return "auto";
  } else if (!isNaN(num)) {
    return `${num}px`;
  }

  return num;
};

export { genPixel };
