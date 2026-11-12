import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { usePage, useT } from "../../hooks";
import { useScroll, useThrottleFn } from "@vueuse/core";
import { Empty, Spin } from "antdv-next";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { listDefaults } from "./config.js";
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
    url: { type: String, default: undefined },

    /**
     * 请求附带参数
     */
    extraData: { type: Object, default: undefined },

    /**
     * 高度
     */
    height: { type: Number, default: undefined },

    /**
     * 加载触发距离，滚动条与底部距离小于 offset 时触发 load 事件
     */
    offset: { type: Number, default: undefined },

    /**
     * 加完完毕提示文案
     */
    finishedText: { type: String, default: undefined },

    /**
     * 是否自动加载
     */
    autoLoad: { type: Boolean, default: undefined },

    /**
     * 是否使用 store
     * 如果使用 store, 请确认 store 中定义了 pagination 和 initPagination 方法
     */
    useStore: { type: Object, default: undefined },

    /**
     * 原生 [List](https://www.antdv.com/components/list-cn#api) 参数
     */
    listProps: { type: Object, default: undefined },
  },

  setup(rawProps, { slots, expose }) {
    const props = useMergedProps(rawProps, "list", listDefaults);
    const containerRef = ref(null);

    const combinedListProps = computed(() => {
      const { header, footer } = props.listProps || {};
      return { header, footer };
    });

    const useStorePagination = !!props.useStore?.initPagination;

    let pagination;
    if (useStorePagination) {
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

    /**
     * 加载下一页。
     * 注意不要把 Promise 直接赋给 pagination，否则 loading 期间读不到分页状态。
     */
    const loadMore = refresh => {
      const current = pagination.value;
      const task = usePage(current, refresh);

      if (useStorePagination) {
        return task;
      }

      return task.then(result => {
        pagination.value = result;
        return result;
      });
    };

    /**
     * url / extraData 变化后重置分页：清空已加载数据并回到第一页
     */
    const resetPagination = () => {
      if (useStorePagination) {
        props.useStore.initPagination({
          uri: props.url,
          params: props.extraData,
        });
        return;
      }

      const current = pagination.value;
      current.uri = props.url;
      current.params = props.extraData;
      current.items = [];
      current.page = 0;
      current.loading = false;
      current.finished = false;
      current.error = false;
      current.empty = false;
    };

    const { y } = useScroll(containerRef);

    // 快速滚动时节流，避免连续触发请求
    const onReachBottom = useThrottleFn(async () => {
      const container = containerRef.value;
      if (!container || !pagination.value) {
        return;
      }
      if (
        y.value + props.height + props.offset >= container.scrollHeight &&
        !pagination.value.loading &&
        !pagination.value.finished
      ) {
        await loadMore();
      }
    }, 300);

    watch(y, () => {
      onReachBottom();
    });

    watch(
      [() => props.url, () => props.extraData],
      () => {
        resetPagination();
        if (props.autoLoad) {
          loadMore(true);
        }
      }
    );

    onMounted(() => {
      if (props.autoLoad) {
        loadMore();
      }
    });

    /****************** exposed ******************/

    const items = () => {
      return pagination.value.items || [];
    };

    expose({ loadMore, items, pagination });

    /****************** render ******************/

    return () => (
      <div ref={containerRef} class={"newbie-list"} style={{ height: `${props.height}px` }}>
        {combinedListProps.value.header ? (
          <div class={"newbie-list__header"}>{combinedListProps.value.header}</div>
        ) : null}
        {slots.renderItem
          ? (pagination.value?.items || []).map((item, index) =>
              slots.renderItem({ item, index })
            )
          : slots.default?.()}
        {!pagination.value?.loading &&
        !slots.renderItem &&
        !slots.default &&
        !(pagination.value?.items || []).length ? (
          <Empty class={"newbie-list__empty"} description={useT("common.no-data")} />
        ) : null}
        {pagination.value?.loading ? (
          <div class={"loading-container"}>
            <Spin />
          </div>
        ) : null}
        {pagination.value?.finished ? (
          <div class={"finished-text"}>
            {props.finishedText || useT("common.loading-finished")}
          </div>
        ) : null}
        {combinedListProps.value.footer ? (
          <div class={"newbie-list__footer"}>{combinedListProps.value.footer}</div>
        ) : null}
      </div>
    );
  },
});
