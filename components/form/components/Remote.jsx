import { Select, Spin } from "ant-design-vue";
import { debounce, isFunction, isNumber, isString } from "lodash-es";
import { useFetch, useProcessStatusSuccess, useT } from "../../../hooks";
import { genPixel } from "../../../utils/style.js";
import { placeholder } from "../utils.js";

/**
 * 输入框
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @param itemState
 * @return {JSX.Element}
 */
const render = (item, submitForm, itemState) => {
  if (!Object.keys(itemState).length) {
    itemState.fetcher = { loading: false };
    itemState.options = [];
    itemState.init = false;
  }

  if (!itemState.init) {
    itemState.init = true;
    let options = [];
    if (item.options) {
      options = isFunction(item.options) ? item.options(submitForm) : item.options;
      options = options.map(op => (isString(op) || isNumber(op) ? { value: op, label: op } : op));
    }
    itemState.options = options;
  }

  const method = item.method || "get";

  if (["get", "post"].indexOf(method) === -1) {
    console.error(`${item.key}: method must be 'get' or 'post' in "remote" type`);
    return null;
  }

  if (!item.url) {
    console.error(`${item.key}: url is required in "remote" type`);
    return null;
  }

  const onSearch = debounce(async name => {
    name = name.trim();
    if (!name) {
      return;
    }

    let res = await useFetch(itemState.fetcher)[method](item.url, {
      params: {
        [item.keyword || "keyword"]: name,
        ...item.params,
      },
    });
    useProcessStatusSuccess(res, () => {
      if (item.onSearch) {
        res.result = item.onSearch(res.result);
      }
      itemState.options = res.result;
    });
  }, 1000);

  return (
    <Select
      v-model:value={submitForm[item.key]}
      options={itemState.options}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      showSearch
      allowClear
      filterOption={false}
      notFoundContent={itemState.fetcher.loading ? undefined : useT("common.no-content")}
      placeholder={placeholder(item, "select")}
      dropdownMatchSelectWidth={!item.width}
      style={item.style || (item.width ? { width: genPixel(item.width) } : {})}
      class={{ readonly: item.readonly, ...item.class }}
      onSearch={onSearch}
      {...item.defaultProps}
    >
      {{
        notFoundContent: () => (itemState.fetcher.loading ? <Spin /> : ""),
        ...item.defaultSlots,
      }}
    </Select>
  );
};

export default render;
