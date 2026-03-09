import {
  Button,
  FormItemRest,
  Modal,
  Popconfirm,
  Switch,
  Table,
  TableSummaryCell,
  TableSummaryRow,
  Tag,
} from "ant-design-vue";
import { computed, toRef } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { initItemDefaultValue } from "../utils";
import NewbieModal from "../../modal/NewbieModal.jsx";
import { cloneDeep, isArray, isFunction, isNumber, isString } from "lodash-es";
import { useFindLabelsInValues, useI18nJoin, useLabelFromOptionsValue } from "../../../hooks";
import dayjs from "dayjs";
import { useTableImage } from "../../table";
import { useI18n } from "vue-i18n";

/**
 * 渲染表单组
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @param itemState
 * @param {Object} context 组件上下文
 * @return {*|JSX.Element}
 */
const render = (item, submitForm, itemState, context) => {
  const { t } = useI18n();
  if (!Object.keys(itemState).length) {
    itemState.editFormRef = null;
    itemState.showEditModal = false;
    itemState.editIndex = -1;
    itemState.editFormData = {};
  }

  const editFormRef = toRef(itemState.editFormRef);

  const { provider } = context;
  const uploaderProvider = provider.uploaderProvider;

  let childrenItems = item.children;

  if (isFunction(item.children)) {
    childrenItems = item.children({ submitForm });
  }

  const dataColumns = childrenItems
    .filter(child => !child.invisible) // 有的不用在 table 中显示
    .map(child => ({
      dataIndex: child.key,
      title: child.title,
      width: child.width,
      key: child.key,
      item: child, // 将子项的配置传递给子组件，用于自定义渲染
      ...child.cellProps,
    }));

  const operations = {
    title: t("common.actions"),
    dataIndex: "operations",
    align: "center",
    fixed: "right",
    width: 120 + (item.childrenOperations?.length || 0) * 60,
  };

  const columns = item.disabled || item.readonly ? [...dataColumns] : [...dataColumns, operations];

  const dataSource = computed(() => submitForm[item.key] || []);

  const onEdit = (currentItem, index) => {
    if (!currentItem) {
      let extractFormData = {};
      childrenItems.forEach(child => {
        extractFormData[child.key] = initItemDefaultValue(child, {}, {}, { uploaderProvider });
      });
      itemState.editFormData = extractFormData;
      itemState.editIndex = -1;
    } else {
      itemState.editFormData = currentItem;
      itemState.editIndex = index;
    }

    itemState.showEditModal = true;
  };

  const onSubmitEditItem = ({ formatForm }) => {
    if (itemState.editIndex === -1) {
      submitForm[item.key].push(formatForm);
    } else {
      submitForm[item.key][itemState.editIndex] = formatForm;
    }
    itemState.showEditModal = false;
    return false;
  };

  const onBeforeCloseEditModal = () => {
    return new Promise(resolve => {
      if (editFormRef.value?.isDirty()) {
        Modal.confirm({
          content: t("common.cancel-confirm"),
          okText: t("common.confirm"),
          cancelText: t("common.cancel"),
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      } else {
        resolve(true);
      }
    });
  };

  const onDelete = index => {
    submitForm[item.key].splice(index, 1);
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource.value}
        pagination={false}
        bordered={true}
        size="small"
      >
        {{
          bodyCell: ({ column, record, index }) => {
            // 可以在这里根据 column.item.type 对单元格进行通用性定制化渲染
            // 如果需要对单元格进行定制化渲染，可以在表单项的 cellProps 中使用 customRender 函数进行渲染
            // column.item 为该单元格对应的表单项配置
            if (column.item?.type === "select") {
              let options = isFunction(column.item?.options)
                ? column.item.options({
                    submitForm,
                    record,
                  })
                : column.item.options;
              options = options.map(op =>
                isString(op) || isNumber(op) ? { value: op, label: op } : op
              );
              return <span>{useLabelFromOptionsValue(record[column.item.key], options)}</span>;
            } else if (column.item?.type === "date") {
              if (record[column.item.key]) {
                const dayjsObj = dayjs(record[column.item.key]);
                if (column.item?.defaultProps?.format) {
                  return <span>{dayjsObj.format(column.item.defaultProps.format)}</span>;
                } else if (column.item?.defaultProps?.showTime) {
                  return <span>{dayjsObj.format("YYYY-MM-DD HH:mm:ss")}</span>;
                }
                return <span>{dayjsObj.format("YYYY-MM-DD")}</span>;
              }
              return null;
            } else if (column.item?.type === "switch") {
              const options = column.item.options || [t("common.yes"), t("common.no")];

              /**
               * 由于 Group 内嵌在一个 FormItem 内，AntD 会对 FormItem 进行内容收集
               * 为了避免该 FormItem 内出现多个输入组件收集引发的问题，使用 FormItemRest 进行包裹
               * @see https://www.antdv.com/components/form-cn#%E6%B3%A8%E6%84%8F%EF%BC%9A
               */
              return (
                <FormItemRest>
                  <Switch
                    v-model:checked={record[column.item.key]}
                    disabled={true}
                    checkedChildren={options[0]}
                    unCheckedChildren={options[1]}
                    {...column.item.defaultProps}
                  ></Switch>
                </FormItemRest>
              );
            } else if (column.item?.type === "tree-select") {
              let options = isFunction(column.item?.options)
                ? column.item.options({
                    submitForm,
                    record,
                  })
                : column.item.options;

              let value = cloneDeep(record[column.item.key]);

              if (!isArray(value)) {
                value = [value];
              }

              const labels = useFindLabelsInValues(
                options,
                value,
                column.item?.defaultProps?.fieldNames || null
              );

              return <span>{labels.join(", ")}</span>;
            } else if (column.item?.type === "tag") {
              return record[column.item.key]?.map(tag => <Tag color={"blue"}>{tag}</Tag>);
            } else if (column.item?.type === "uploader") {
              return (
                <div class={"flex justify-center"}>{useTableImage(record[column.item.key])}</div>
              );
            } else if (column.item?.type === "time" || column.item?.type === "date") {
              const format =
                column.item?.defaultProps?.format ||
                (column.item?.type === "time" ? "HH:mm:ss" : "YYYY-MM-DD");

              if (column.item?.defaultProps?.type === "range") {
                return (
                  <span>
                    {dayjs(record[column.item.key][0]).format(format)} -{" "}
                    {dayjs(record[column.item.key][1]).format(format)}
                  </span>
                );
              }
              if (record[column.item.key]) {
                return <span>{dayjs(record[column.item.key]).format(format)}</span>;
              }

              return <span></span>;
            }

            if (column.dataIndex === "operations") {
              const actions = [
                <Button type={"text"} size={"small"} onClick={() => onEdit(record, index)}>
                  {{ default: () => t("common.edit") }}
                </Button>,
              ];

              item.childrenOperations?.forEach(op => {
                actions.push(
                  <Button
                    type={"text"}
                    size={"small"}
                    onClick={() => op.action({ column, record, index })}
                  >
                    {{ default: () => op.name }}
                  </Button>
                );
              });

              actions.push(
                <Popconfirm title={t("common.delete-confirm")} onConfirm={() => onDelete(index)}>
                  {{
                    default: () => (
                      <Button type={"text"} size={"small"}>
                        {{ default: () => t("common.delete") }}
                      </Button>
                    ),
                  }}
                </Popconfirm>
              );

              return <div class={"table-actions-wrapper"}> {actions} </div>;
            }
          },

          summary: () =>
            item.disabled || item.readonly ? null : (
              <TableSummaryRow>
                {{
                  default: () => (
                    <TableSummaryCell colSpan={columns.length}>
                      {{
                        default: () => (
                          <Button icon={<PlusOutlined />} block onClick={() => onEdit(false)}>
                            {{ default: () => useI18nJoin(t("common.add"), item.title) }}
                          </Button>
                        ),
                      }}
                    </TableSummaryCell>
                  ),
                }}
              </TableSummaryRow>
            ),
        }}
      </Table>

      <NewbieModal
        v-model:visible={itemState.showEditModal}
        type={"drawer"}
        title={useI18nJoin(t("common.edit"), item.title)}
        beforeClose={onBeforeCloseEditModal}
      >
        <NewbieForm
          ref={editFormRef}
          form={childrenItems}
          closable={false}
          data={itemState.editFormData}
          beforeSubmit={onSubmitEditItem}
          onClose={async () => {
            itemState.showEditModal = !(await onBeforeCloseEditModal());
          }}
        ></NewbieForm>
      </NewbieModal>
    </div>
  );
};

export default render;
