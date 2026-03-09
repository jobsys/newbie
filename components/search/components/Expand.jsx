import { CheckableTag, Space } from "ant-design-vue";
import { ref } from "vue";
import { find, isFunction, isNumber, isString } from "lodash-es";
import { useI18nJoin } from "../../../hooks/index.js";
import { useI18n } from "vue-i18n";

/**
 *
 * @param {SearchItemConfig} item
 * @param {Object} queryForm
 */
const render = (item, queryForm) => {
  const { t, locale } = useI18n();
  let options = isFunction(item.options) ? item.options() : item.options;
  options = options.map(op => (isString(op) || isNumber(op) ? { value: op, label: op } : op));

  const checkedOptions = ref(item.options.map(() => false));

  if (queryForm[item.key].value?.length) {
    queryForm[item.key].value.forEach(val => {
      const index = options.findIndex(option => option.value === val);
      if (index !== -1) {
        checkedOptions.value[index] = true;
      }
    });
  }

  if (item.expandable === "multiple") {
    queryForm[item.key].condition = "include";
  }

  const handleChange = index => {
    if (item.expandable === "multiple") {
      queryForm[item.key].value = checkedOptions.value.map((checked, index) => {
        if (checked) {
          return options[index].value;
        }
      });
    } else {
      // 单选，手动将其它选项置为 false
      checkedOptions.value.forEach((checked, i) => {
        if (i === index) {
          if (checked) {
            queryForm[item.key].value = [options[index].value];
          } else {
            queryForm[item.key].value = [];
          }
          return;
        }
        checkedOptions.value[i] = false;
      });
    }
  };

  item.collectItem = () => {
    let value = null,
      searchLabel = null;

    if (item.expandable === "multiple") {
      value = queryForm[item.key].value?.filter(val => val);
      if (!value || !value.length) {
        value = null;
      } else {
        const label = value.map(val => find(options, { value: val })?.label)?.join(",");
        searchLabel = `${useI18nJoin(item.title, t("search.include"), { locale })}: ${label}`;
      }
    } else {
      value = queryForm[item.key].value?.[0] || null;
      searchLabel = `${useI18nJoin(item.title, t("search.equal"), { locale })}: ${find(options, { value })?.label}`;
    }
    return { value, searchLabel };
  };

  return (
    <div class={"newbie-search-expand-item"}>
      <div class={"newbie-search-expand-item-title"}>{item.title}:</div>
      <div class={"newbie-search-expand-item-options"}>
        <Space size={[8, 2]} wrap={true}>
          {{
            default: () =>
              options.map((option, index) => (
                <CheckableTag
                  v-model:checked={checkedOptions.value[index]}
                  onChange={() => handleChange(index)}
                >
                  {{ default: () => option.label }}
                </CheckableTag>
              )),
          }}
        </Space>
      </div>
      <div class={"newbie-search-expand-item-extra"}>
        {item.expandable === "multiple" ? t("search.multiple-choice-available") : ""}
      </div>
    </div>
  );
};

export default render;
