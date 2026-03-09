import { find, isFunction } from "lodash-es";
import { computed, nextTick, ref, Transition, withModifiers } from "vue";
import { Dropdown, Menu, MenuItem, TypographyText } from "ant-design-vue";
import { DownOutlined } from "@ant-design/icons-vue";
import * as Fields from "./index";
import { OnClickOutside } from "@vueuse/components";
import anime from "animejs";
import { useT } from "../../../hooks/index.js";

/**
 *
 * @param {SearchItemConfig} item
 * @param {Object} queryForm
 * @param itemState
 * @param {Object} context
 * @return {JSX.Element}
 */
const render = (item, queryForm, itemState, context) => {
  const { searchProvider, props, slots } = context;

  const panelRef = ref(null);

  let field = {};

  if (item.customRender) {
    field = item.customRender({ item, queryForm, context });
  } else {
    switch (item.type) {
      case "number":
        field = Fields.createNumber(item, queryForm, context);
        break;
      case "select":
        field = Fields.createSelect(item, queryForm, context);
        break;
      case "textarea":
        field = Fields.createTextarea(item, queryForm, context);
        break;
      case "date":
        field = Fields.createDate(item, queryForm, context);
        break;
      case "cascade":
        field = Fields.createCascader(item, queryForm, context);
        break;
      case "switch":
        field = Fields.createSwitch(item, queryForm, context);
        break;
      default:
        field = Fields.createInput(item, queryForm, context);
        break;
    }
  }
  if (slots[item.key]) {
    field.Component = slots[item.key]({ item, queryForm, context });
  }

  const { conditions = [], Component, displayValue = "", onComponentOpen = null } = field;

  /**
   * 选择条件
   * @param index
   */
  const onSelectCondition = index => {
    queryForm[item.key].condition = conditions[index].value;
  };

  /**
   * 关闭面板
   */
  const onClosePanel = () => {
    if (!itemState.showPanel) {
      return;
    }
    itemState.showPanel = false;
  };

  /**
   * 打开面板
   *
   * onComponentOpen 一般为组件的 focus 事件
   */
  const onOpenPanel = () => {
    itemState.showPanel = true;
    nextTick(() => {
      if (onComponentOpen) {
        onComponentOpen();
      }
    });
  };

  const animations = {
    onEnter: (el, done) => {
      anime({
        targets: ".newbie-search-input-container",
        padding: "11px",
        translateX: "0",
        translateY: "0",
        duration: 100,
        easing: "linear",
      });
      anime({
        targets: ".newbie-search-condition",
        top: "-44px",
        opacity: 1,
        duration: 100,
        easing: "linear",
      });
      done();
    },
  };

  const conditionText = computed(
    () => find(conditions, { value: queryForm[item.key].condition })?.label || useT("search.equal")
  );

  const conditionMaskText = computed(
    () => find(conditions, { value: queryForm[item.key].condition })?.label || useT("search.equal")
  );

  return (
    <OnClickOutside onTrigger={onClosePanel}>
      <div
        class={`newbie-search-item ${searchProvider.maskClass || ""} ${itemState.hidden ? "hidden" : ""}`}
      >
        <div class={"newbie-search-mask"} onClick={onOpenPanel}>
          <div class={"newbie-search-mask-title"}>{item.title}</div>
          <div class={"newbie-search-mask-content"}>
            {queryForm[item.key].condition !== "equal" ? (
              <div class={"newbie-search-mask-condition"}>{conditionMaskText.value}</div>
            ) : null}
            <div class={"newbie-search-mask-value"}>{displayValue?.value}</div>
          </div>
        </div>
        <Transition css={false} onEnter={animations.onEnter}>
          {itemState.showPanel ? (
            <div class={"newbie-search-popup-panel"} ref={panelRef}>
              <div class={"newbie-search-condition"}>
                <span class={"newbie-search-condition-title"}>
                  {useT("common.search")}{" "}
                  <TypographyText code={true}>{{ default: () => item.title }}</TypographyText>
                </span>
                {props.disableConditions || item.disableConditions ? null : (
                  <Dropdown trigger={["click"]} getPopupContainer={() => panelRef.value}>
                    {{
                      default: () => (
                        <a
                          class={"newbie-search-condition-dropdown-link"}
                          onClick={withModifiers(() => {}, ["prevent"])}
                        >
                          {conditionText.value} <DownOutlined></DownOutlined>
                        </a>
                      ),
                      overlay: () => (
                        <Menu>
                          {{
                            default: () =>
                              conditions.map((condition, index) => (
                                <MenuItem key={condition.value}>
                                  {{
                                    default: () => (
                                      <a onClick={() => onSelectCondition(index)}>
                                        {condition.label}
                                      </a>
                                    ),
                                  }}
                                </MenuItem>
                              )),
                          }}
                        </Menu>
                      ),
                    }}
                  </Dropdown>
                )}
              </div>
              <div class={"newbie-search-input-container"}>
                {isFunction(Component) ? Component() : Component}
              </div>
            </div>
          ) : null}
        </Transition>
      </div>
    </OnClickOutside>
  );
};

export default render;
