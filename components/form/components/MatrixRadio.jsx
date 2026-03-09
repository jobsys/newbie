import { FormItemRest, Radio, RadioGroup, Table } from "ant-design-vue";
import { isFunction, isNumber, isString } from "lodash-es";
import { useT } from "../../../hooks/index.js";

/**
 * 矩阵单选
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  const rows = isFunction(item.rows) ? item.rows(submitForm) : item.rows;

  let options = isFunction(item.options) ? item.options(submitForm) : item.options;
  options = options.map(op => (isString(op) || isNumber(op) ? { value: op, label: op } : op));

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

  return (
    <Table pagination={false} bordered={true} columns={columns} dataSource={rows} size={"middle"}>
      {{
        bodyCell: ({ index, column }) => {
          const row = rows[index];
          if (column.type === "title") {
            return row;
          }
          if (column.type === "option") {
            const value = `${column.dataIndex}`;
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
        },
      }}
    </Table>
  );
};

export default render;
