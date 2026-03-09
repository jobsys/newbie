import { isArray, isNumber, isString, isUndefined, sum } from "lodash-es";
import { Affix, Card, Col, Divider, Row } from "ant-design-vue";
import createFormItem from "./FormItem.jsx";
import { nextTick } from "vue";
import { RightOutlined } from "@ant-design/icons-vue";

/**
 *
 * @param {Array.<NewbieFormItemConfig>} formItems
 * @param {object} submitForm
 * @param {*[]|JSX.Element} submitButtons
 * @param {object} context
 * @return {*[]|JSX.Element}
 */
const render = (formItems, submitForm, submitButtons, context) => {
  const { props, slots, formState } = context;

  const fixedFormItems = [];
  const staticFormItems = [];

  formItems.forEach(item => {
    if (item.columnIndex === "fixed") {
      fixedFormItems.push(item);
    } else {
      if (item.break || !staticFormItems.length) {
        staticFormItems.push([]);
      }
      staticFormItems[staticFormItems.length - 1].push(item);
    }
  });

  // 24 栅格分布
  let columns = props.columns;
  if (!columns || !isArray(columns) || !columns.length) {
    columns = [24];
  }

  if (sum(columns) !== 24) {
    console.error("NewbieForm columns must sum up to 24");
    return null;
  }

  const sortedFormItems = staticFormItems.map(() => columns.map(() => []));

  staticFormItems.forEach((items, index) => {
    items.forEach(item => {
      let columnIndex = item.columnIndex || 0;
      columnIndex = isNumber(columnIndex)
        ? Math.min(columnIndex, props.columns.length - 1)
        : columnIndex;

      let span = 0;

      /**
       * [0, 1] 代表占 1-2 列
       * [1, 2] 代表占 2-3 列
       * [2, 4] 代表占 3-5 列
       * 超过 columns.length 的值会被忽略
       */
      if (isArray(columnIndex)) {
        for (let i = columnIndex[0]; i <= columnIndex[1]; i++) {
          if (!columns[i]) {
            break;
          }

          span += columns[i];

          // 渲染的元素会被放在数组第1项的列，其它的列放置占位元素

          if (i !== columnIndex[0]) {
            sortedFormItems[index][i].push("placeholder");
          }
        }
        item.span = span;

        // 默认的 labelCol.span 为 6，如果是 2 列，那么 labelCol.span 应该为 3， 3 列则为 2
        item.formItemProps = {
          labelCol: {
            span:
              (props.formProps.labelCol?.span || 6) /
              (columnIndex[columnIndex.length - 1] - columnIndex[0] + 1),
          },
          ...item.formItemProps,
        };
        sortedFormItems[index][columnIndex[0]].push(item);
      } else if (isNumber(columnIndex)) {
        item.span = columns[columnIndex];
        sortedFormItems[index][columnIndex].push(item);
      }
    });
  });

  /**
   * 生成固定在右侧的表单项
   */
  const fixedFormElems = fixedFormItems.map(item => createFormItem(item, submitForm, context));

  let staticFormElems = [];

  const onToggle = item => {
    const collapseElem = document.getElementById(`collapse_${item.key}`);

    if (formState[item.key].isCollapse) {
      collapseElem.style.height = `${collapseElem.scrollHeight}px`;
    } else {
      //由于没有定义 height 的样式第一次无法触发动画，所以先设置个原始高度，再异步变为0来触发动画
      if (!collapseElem.style.height) {
        collapseElem.style.height = `${collapseElem.scrollHeight}px`;
      }
      setTimeout(() => (collapseElem.style.height = "0px"));
    }
    nextTick(() => {
      formState[item.key].isCollapse = !formState[item.key].isCollapse;
    });
  };

  /**
   * 生成静态表单项
   */
  sortedFormItems.forEach((items, index) => {
    /**
     * 计算最长的一列有多少个表单项,则代表有多少行
     * @type {number}
     */
    const maxLength = Math.max(...items.map(item => item.length));

    const rows = [];

    let breakItem = null;

    for (let row = 0; row < maxLength; row++) {
      let offset = 0;
      const columnElems = [];

      for (let col = 0; col < sortedFormItems[index].length; col++) {
        const formItem = sortedFormItems[index][col][row];
        if (!formItem) {
          offset += columns[col];
          continue;
        }

        if (formItem.break) {
          breakItem = formItem;
        }

        //如果是占位元素，则跳过，表示左则的元素占用了该列的位置，该位置没有元素
        if (formItem === "placeholder") {
          continue;
        }

        columnElems.push(
          <Col span={formItem.span} offset={offset}>
            {createFormItem(formItem, submitForm, context)}
          </Col>
        );
        offset = 0;
      }

      rows.push(<Row gutter={16}>{columnElems}</Row>);
    }

    if (breakItem) {
      if (props.breakMode === "divider") {
        rows.unshift(
          <Divider {...props.dividerProps}>
            {() => (isString(breakItem.break) ? breakItem.break : "")}
          </Divider>
        );
        staticFormElems = staticFormElems.concat(rows);
      } else if (props.breakMode === "collapse") {
        if (isUndefined(formState[breakItem.key].isCollapse)) {
          formState[breakItem.key].isCollapse = !!index; //默认展开第一个
        }

        const collapseElem = (
          <div class={`newbie-form__collapse-wrapper`}>
            <div class={`newbie-form__collapse-header`} onClick={() => onToggle(breakItem)}>
              <span
                class={`newbie-form__collapse-icon ${formState[breakItem.key].isCollapse ? "" : "open"}`}
              >
                <RightOutlined />
              </span>
              <span class={`newbie-form__collapse-title`}>{breakItem.break}</span>
            </div>
            <div
              class={`newbie-form__collapse-content-wrapper ${formState[breakItem.key].isCollapse ? "collapse" : ""}`}
              id={`collapse_${breakItem.key}`}
            >
              <div class={`newbie-form__collapse-content`}>{rows}</div>
            </div>
          </div>
        );
        staticFormElems = staticFormElems.concat(collapseElem);
      }
    } else {
      staticFormElems = staticFormElems.concat(rows);
    }
  });

  const footerElem = () => {
    if (slots.footer) {
      return <div class={"newbie-form__footer"}>{slots.footer()}</div>;
    }
    return null;
  };

  let layoutElem;

  if (fixedFormElems.length) {
    const submitButtonWrapper =
      props.disabled || props.readonly || props.hideButtons ? null : (
        <div class={"newbie-form__submit-wrapper"}>
          <Divider />
          <Row>
            <Col span={24} offset={2}>
              {{ default: () => submitButtons }}
            </Col>
          </Row>
        </div>
      );
    layoutElem = (
      <Row gutter={16}>
        <Col span={24 - props.fixedColumns}>{() => staticFormElems}</Col>
        <Col span={props.fixedColumns}>
          <Affix offsetTop={20}>
            <Card style={{ marginLeft: "20px" }}>
              {() => [fixedFormElems, footerElem(), submitButtonWrapper]}
            </Card>
          </Affix>
        </Col>
      </Row>
    );
  } else {
    const submitButtonWrapper =
      props.disabled || props.readonly || props.hideButtons ? null : (
        <div class={"newbie-form__submit-wrapper"}>
          <Divider />
          <Row gutter={16}>
            <Col offset={props.closable ? 9 : 10}>{{ default: () => submitButtons }}</Col>
          </Row>
        </div>
      );

    layoutElem = [staticFormElems, footerElem(), submitButtonWrapper];
  }

  return layoutElem;
};

export default render;
