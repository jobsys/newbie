import { FormItemRest, Radio, RadioGroup, Table } from "ant-design-vue";
import { cloneDeep, findIndex, isFunction, isNumber, isString } from "lodash-es";
import { useT } from "../../../hooks/index.js";

/**
 * 矩阵量表
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let rows = isFunction(item.rows) ? item.rows(submitForm) : cloneDeep(item.rows);

  const level = item.defaultProps?.level || 5;

  let options = isFunction(item.options) ? item.options(submitForm) : item.options || [];

  options = options.map(op => (isString(op) || isNumber(op) ? { value: op, label: op } : op));

  if (options.length > level) {
    options = options.slice(0, level);
  } else if (options.length < level) {
    //如果选项不及量表等级则补全
    for (let i = options.length; i < level; i += 1) {
      options.push({ label: i + 1, value: i + 1 });
    }
  }

  const columns = [
    {
      title: `${useT("form.row-title")}\\${useT("form.options")}`,
      dataIndex: "row",
      type: "title",
    },
  ].concat(
    options.map(option => ({
      title: option.label,
      dataIndex: option.value,
      align: "center",
      type: "option",
    }))
  );

  rows = rows.map(item => ({ row: item }));

  if (item.defaultProps?.showScale) {
    let scale = { row: useT("form.scale") };
    options.forEach((option, index) => (scale[option.value] = index + 1));
    rows.unshift(scale);
  }
  return (
    <Table pagination={false} bordered={true} columns={columns} dataSource={rows} size={"middle"}>
      {{
        bodyCell: ({ index, column, record }) => {
          if (index === 0 && item.defaultProps?.showScale) {
            return (
              <span style={{ color: "orange", fontWeight: "bold" }}>
                {record[column.dataIndex]}
              </span>
            );
          } else if (column.type === "option") {
            const { row } = rows[index];
            const value = findIndex(columns, { dataIndex: column.dataIndex });
            return (
              <FormItemRest>
                {() => (
                  <RadioGroup v-model:value={submitForm[item.key][row]}>
                    <Radio
                      value={value}
                      disabled={
                        isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled
                      }
                    ></Radio>
                  </RadioGroup>
                )}
              </FormItemRest>
            );
          }
          return record[column.dataIndex];
        },
      }}
    </Table>
  );
};

export default render;
