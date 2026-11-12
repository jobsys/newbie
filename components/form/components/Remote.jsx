import { Select, Spin } from "antdv-next";
import { debounce, isFunction, isNumber, isString } from "lodash-es";
import { useFetch, useProcessStatusSuccess, useT } from "../../../hooks";
import { genPixel } from "../../../utils/style.js";
import { placeholder } from "../utils.js";

// 渲染期不能写响应式状态，debounce 与最近一次字段配置缓存到 WeakMap，
// key 为 formState[item.key]（跨渲染稳定），避免每次渲染新建 debounce 丢失上一次的定时器
const remoteStateMap = new WeakMap();

/**
 * 取（或首次创建）远程搜索状态，并记录本次渲染的字段配置
 * @param {Object} itemState
 * @param {NewbieFormItemConfig} item
 * @return {{item: NewbieFormItemConfig, search: Function}}
 */
const getRemoteState = (itemState, item) => {
  let remoteState = remoteStateMap.get(itemState);

  if (!remoteState) {
    remoteState = { item, search: null };
    remoteState.search = debounce(async name => {
      name = name.trim();
      if (!name) {
        return;
      }

      const currentItem = remoteState.item;

      let res = await useFetch(itemState.fetcher)[currentItem.method || "get"](currentItem.url, {
        params: {
          [currentItem.keyword || "keyword"]: name,
          ...currentItem.params,
        },
      });
      useProcessStatusSuccess(res, () => {
        if (currentItem.onSearch) {
          res.result = currentItem.onSearch(res.result);
        }
        itemState.options = res.result;
      });
    }, 1000);
    remoteStateMap.set(itemState, remoteState);
  }

  remoteState.item = item;

  return remoteState;
};

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

  const onSearch = getRemoteState(itemState, item).search;

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
      popupMatchSelectWidth={!item.width}
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
