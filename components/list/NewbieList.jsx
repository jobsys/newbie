import { computed, defineComponent, ref, watch } from "vue";
import { usePage, useT } from "../../hooks";
import { useScroll } from "@vueuse/core";
import { List, Spin } from "ant-design-vue";
import "./index.less";

/**
 * 列表组件
 * @version 1.0.0
 */
export default defineComponent({
  name: "NewbieList",
  props: {
    /**
     * 加载数据的URL
     */
    url: { type: String, default: "" },

    /**
     * 请求附带参数
     */
    extraData: { type: Object, default: () => ({}) },

    /**
     * 高度
     */
    height: { type: Number, default: 300 },

    /**
     * 加载触发距离，滚动条与底部距离小于 offset 时触发 load 事件
     */
    offset: { type: Number, default: 50 },

    /**
     * 加完完毕提示文案
     */
    finishedText: { type: String, default: "" },

    /**
     * 是否自动加载
     */
    autoLoad: { type: Boolean, default: true },

    /**
     * 是否使用 store
     * 如果使用 store, 请确认 store 中定义了 pagination 和 initPagination 方法
     */
    useStore: { type: Object, default: () => null },

    /**
     * 原生 [List](https://www.antdv.com/components/list-cn#api) 参数
     */
    listProps: { type: Object, default: () => ({}) },
  },

  setup(props, { slots, expose }) {
    const containerRef = ref(null);
    const listRef = ref(null);

    const combinedListProps = computed(() => {
      return {
        ...props.listProps,
      };
    });

    let pagination;
    if (props.useStore?.initPagination) {
      props.useStore.initPagination({
        uri: props.url,
        params: props.extraData,
      });
      pagination = computed(() => props.useStore.pagination);
    } else {
      pagination = ref({
        uri: props.url,
        params: props.extraData,
      });
    }

    const loadMore = refresh => {
      pagination.value = usePage(pagination.value, refresh);
    };

    const { y } = useScroll(containerRef);

    watch(y, async value => {
      if (
        value + props.height + props.offset >= containerRef.value.scrollHeight &&
        !pagination.value.loading &&
        !pagination.value.finished
      ) {
        await loadMore();
      }
    });

    if (props.autoLoad) {
      loadMore();
    }

    /****************** exposed ******************/

    const items = () => {
      return pagination.value.items || [];
    };

    expose({ loadMore, items, pagination });

    /****************** render ******************/

    return () => (
      <div ref={containerRef} class={"newbie-list"} style={{ height: `${props.height}px` }}>
        <List ref={listRef} dataSource={pagination.value?.items || []} {...combinedListProps.value}>
          {{
            default: () => slots.default?.(),
            renderItem: ({ item, index }) =>
              slots.renderItem ? slots.renderItem({ item, index }) : null,
            loadMore: () => {
              return [
                pagination.value?.loading ? (
                  <div class={"loading-container"}>
                    <Spin />
                  </div>
                ) : null,
                pagination.value?.finished ? (
                  <div class={"finished-text"}>
                    {props.finishedText || useT("common.loading-finished")}
                  </div>
                ) : null,
              ];
            },
          }}
        </List>
      </div>
    );
  },
});
