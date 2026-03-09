import { Transfer } from "ant-design-vue";
import Draggable from "vuedraggable/src/vuedraggable";
import { Button, Tooltip } from "ant-design-vue";
import { MenuOutlined, DeleteOutlined, FallOutlined, RiseOutlined } from "@ant-design/icons-vue";
import { find } from "lodash-es";
import { useT } from "../../../hooks/index.js";

const render = (sortColumns, sortForm) => {
  const onDeleteItem = item => {
    const index = sortForm.targetKeys.indexOf(item.key);
    sortForm.targetKeys.splice(index, 1);
  };

  return (
    <Transfer
      class={"newbie-search-sortable"}
      v-model:selectedKeys={sortForm.selectedKeys}
      v-model:targetKeys={sortForm.targetKeys}
      locale={{
        itemUnit: "", //useT("search.item-unit"),
        itemsUnit: "", // useT("search.items-unit"),
        notFoundContent: useT("common.no-data"),
        searchPlaceholder: useT("form.search-placeholder"),
        titles: [useT("search.sortable-items"), useT("search.sorted-items")],
      }}
      listStyle={{ minWidth: "300px" }}
      dataSource={sortColumns}
      titles={[useT("search.sortable-items"), useT("search.sorted-items")]}
      oneWay={true}
      render={item => item.title}
    >
      {{
        children({ direction, filteredItems }) {
          if (direction === "right") {
            if (!filteredItems.length) {
              return (
                <div class={"newbie-search-sortable__sortable-empty"}>
                  {useT("search.select-sorting-item")}
                </div>
              );
            }
            return (
              <Draggable
                class="list-group"
                itemKey={"key"}
                tag={"div"}
                v-model={sortForm.targetKeys}
                sort={true}
                animation={0}
                group={"sortables"}
                ghostClass={"ghost"}
                handle={".drag-handle"}
              >
                {{
                  item: ({ element }) => {
                    const item = find(sortColumns, { key: element });
                    if (!item.direction) {
                      item.direction = "asc";
                    }

                    return (
                      <div class={"newbie-search-sortable__sortable-item"}>
                        <span class={"drag-handle"}>
                          <MenuOutlined></MenuOutlined>
                        </span>
                        <div class={"newbie-search-sortable__sortable-item-content"}>
                          <span class={"newbie-search-sortable__sortable-item-title"}>
                            {item.title}
                          </span>
                          <span class={"newbie-search-sortable__sortable-item-sorter"}>
                            <Tooltip
                              title={
                                item.direction === "asc"
                                  ? useT("search.ascending")
                                  : useT("search.descending")
                              }
                              placement={"left"}
                            >
                              <Button
                                size={"small"}
                                type={item.direction === "asc" ? "primary" : "default"}
                                icon={
                                  item.direction === "asc" ? <RiseOutlined /> : <FallOutlined />
                                }
                                onClick={() =>
                                  (item.direction = item.direction === "asc" ? "desc" : "asc")
                                }
                              ></Button>
                            </Tooltip>
                          </span>
                        </div>
                        <span class={"newbie-search-sortable__sortable-item-delete"}>
                          <Tooltip title={useT("search.remove-item")} placement={"right"}>
                            <Button
                              type={"danger"}
                              icon={<DeleteOutlined />}
                              onClick={() => onDeleteItem(item)}
                            ></Button>
                          </Tooltip>
                        </span>
                      </div>
                    );
                  },
                }}
              </Draggable>
            );
          }
        },
      }}
    </Transfer>
  );
};

export default render;
