import { defineComponent, provide, watch } from "vue";
import { useI18n } from "vue-i18n";

export const NEWBIE_LOCALE = Symbol("NEWBIE_LOCALE");
export const NEWBIE_EDITOR = Symbol("NEWBIE_EDITOR");
export const NEWBIE_TABLE = Symbol("NEWBIE_TABLE");
export const NEWBIE_UPLOADER = Symbol("NEWBIE_UPLOADER");
export const NEWBIE_FORM = Symbol("NEWBIE_FORM");
export const NEWBIE_SEARCH = Symbol("NEWBIE_SEARCH");

/**
 * Newbie 配置组件
 * @version 1.0.0
 */
export default defineComponent({
  name: "NewbieProvider",
  /**
   * @typedef {Object} ProviderProps
   * @property {EditorProviderProps} [editor] `NewbieEditor` 配置
   * @property {TableProviderProps} [table] `NewbieTable` 配置
   * @property {UploaderProviderProps} [uploader] `NewbieUploader` 配置
   * @property {FormProviderProps} [form] `NewbieForm` 配置
   * @property {SearchProviderProps} [search] `NewbieSearch` 配置
   *
   */
  props: {
    /**
     * @typedef {Object} EditorProviderProps `NewbieEditor` 配置
     * @property  {string} editor.uploadUrl 上传地址
     */
    editor: {
      type: Object,
      default: () => ({
        uploadUrl: "",
      }),
    },
    /**
     * @typedef {Object} TableProviderProps `NewbieTable` 配置
     * @property {number} [page] 当前页码
     * @property {number} [pageSize] 每页条数
     * @property {string} [pageKey] 页码参数名
     * @property {string} [pageSizeKey] 每页条数参数名
     * @property {Function} [afterFetched] 返回数据处理函数
     */
    table: {
      type: Object,
      default: () => ({
        page: 1,
        pageSize: 10,
        pageKey: "page",
        pageSizeKey: "pageSize",
        afterFetched: null,
      }),
    },

    /**
     * @typedef {Object} UploaderProviderProps `NewbieUploader` 配置
     * @property {string} uploadUrl 上传地址
     * @property {UploadFileItem} defaultFileItem 默认文件项
     *
     * @typedef {Object} UploadFileItem 文件项
     * @property {string} [id] 文件 ID
     * @property {string} [name] 文件名
     * @property {string} defaultFileItem.url 文件地址
     * @property {string} defaultFileItem.path 文件路径
     * @property {string} [thumbUrl] 缩略图地址
     */
    uploader: {
      type: Object,
      default: () => ({
        uploadUrl: "",
        defaultFileItem: {
          id: "id",
          name: "name",
          url: "url",
          path: "path",
          thumbUrl: "thumbUrl",
        },
      }),
    },

    /**
     * @typedef {Object} FormProviderProps `NewbieForm` 配置
     * @property {Object} [format] 格式化配置, 如 {date: true} 表示在提交表单时使用 `useFormFormat` 格式所有日期字段
     * @property {Function} [afterFetched] 处理接口返回数据的函数
     * @property {Object} [columns] Field的默认配置, 如 {switch: {defaultProps: {...}}}，可以被覆盖
     */
    form: {
      type: Object,
      default: () => ({
        format: {},
        afterFetched: null,
        columns: {},
      }),
    },

    /**
     * @typedef {Object} SearchProviderProps `NewbieSearch` 配置
     * @property {Object} [maskClass] 定制伪 Input 样式
     * @property {Object} [inputClass] 弹层中 Input 的样式
     * @property {Function} [valueFormatter] 时间格式化函数
     */
    search: {
      type: Object,
      default: () => ({
        maskClass: "",
        inputClass: "",
        valueFormatter: null,
      }),
    },

    /**
     * 语言配置
     */
    locale: {
      type: String,
      default: "zh_CN",
    },
  },
  setup(props, { slots }) {
    // 获取当前 locale
    const { locale } = useI18n();

    watch(
      () => props.locale,
      value => {
        if (value) {
          locale.value = value;
        }
      },
      {
        immediate: true,
      }
    );

    // 提供语言配置
    provide(NEWBIE_LOCALE, props.locale);
    provide(NEWBIE_EDITOR, { uploadUrl: "", ...props.editor });
    provide(NEWBIE_TABLE, {
      page: 1,
      pageSize: 10,
      pageKey: "page",
      pageSizeKey: "pageSize",
      afterFetched: null,
      ...props.table,
    });
    provide(NEWBIE_UPLOADER, {
      defaultFileItem: {
        id: "id",
        name: "name",
        url: "url",
        path: "path",
        thumbUrl: "thumbUrl",
      },
      ...props.uploader,
    });
    provide(NEWBIE_FORM, { format: {}, ...props.form });
    provide(NEWBIE_SEARCH, {
      maskClass: "",
      inputClass: "",
      valueFormatter: null,
      ...props.search,
    });

    return () => <div>{slots.default?.()}</div>;
  },
});
