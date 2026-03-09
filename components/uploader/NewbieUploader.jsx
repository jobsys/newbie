import { computed, defineComponent, inject, onMounted, reactive, watch } from "vue";
import { Form, message, Upload, Image, ImagePreviewGroup } from "ant-design-vue";
import { every, isArray, isEqual, map, pick, random } from "lodash-es";
import { NEWBIE_UPLOADER } from "../provider/NewbieProvider.jsx";
import { STATUS, useFetch, useT } from "../../hooks";
import Resumable from "resumablejs";
import "./index.less";
import { CloudUploadOutlined } from "@ant-design/icons-vue";
import NewbieButton from "../button/NewbieButton.jsx";

/**
 * 上传组件
 *
 * @version 1.0.0
 *
 */
export default defineComponent({
  name: "NewbieUploader",
  props: {
    value: { type: [Object, Array, String], default: () => ({}) },

    /**
     * 上传文件字段名
     */
    name: { type: String, default: "file" },

    /**
     * 设置上传的请求头部，IE10 以上有效
     */
    headers: { type: Object, default: () => ({}) },

    /**
     * 接受上传的文件类型, 详见 [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept)
     */
    accept: { type: String, default: "" },

    /**
     * 上传列表的内建样式，支持三种基本样式 text/file, picture 和 picture-card
     *
     * @values text|file, picture, picture-card
     */
    type: { type: String, default: "file" },

    /**
     * 是否禁用
     */
    disabled: { type: Boolean, default: false },

    /**
     * 单个文件大小上限，单位为 MB
     */
    maxSize: { type: Number, default: 20 },

    /**
     * 上传文件个数上限
     */
    maxNum: { type: Number, default: 1 },

    /**
     * 是否支持多选文件
     */
    multiple: { type: Boolean, default: false },

    /**
     * 是否使用分块上传
     */
    multipart: { type: Boolean, default: false },

    /**
     * 上传文件的服务器地址
     */
    action: { type: String, default: "" },

    /**
     * 上传时的附加参数
     */
    extraData: { type: Object, default: () => ({}) },

    /**
     * 上传按钮文本
     */
    uploadText: { type: String, default: "" },

    /**
     * 上传盘符标志，可以灵活配合后台使用
     */
    disk: { type: String, default: "" },

    /**
     * 原生 [Uploader](https://www.antdv.com/components/upload-cn#api) 配置
     */
    uploadProps: { type: Object, default: () => ({}) },
  },
  emits: [
    "update:value",

    /**
     * 上传成功时触发
     *
     * @event success
     * @param {Array} fileList 文件列表
     *
     */
    "success",
  ],

  setup(props, { emit }) {
    const { STATE_CODE_SUCCESS } = STATUS;

    const formItemContext = Form.useInjectFormItemContext();

    const uploaderProvider = inject(NEWBIE_UPLOADER, () => ({}));
    const defaultUploadUrl = uploaderProvider.uploadUrl || "";
    const defaultFileItem = uploaderProvider.defaultFileItem || {};

    const { url: urlKey, path: pathKey, name: nameKey } = defaultFileItem;

    const state = reactive({
      fileList: [],
      previewVisible: false,
      previewCurrent: 0,
      progress: props.multipart
        ? {
            strokeColor: {
              "0%": "#108ee9",
              "100%": "#87d068",
            },
            strokeWidth: 3,
            format: percent => `${parseFloat(percent.toFixed(2))}%`,
          }
        : null,
    });

    const isSignle = computed(() => !props.maxNum || props.maxNum === 1);

    const isOverflow = computed(() => {
      return state.fileList.length >= props.maxNum;
    });

    const isImage = computed(() => {
      return props.type === "picture-card" || props.type === "picture";
    });

    /**
     * submit 前处理文件列表
     * @param list
     * @returns {{[p: string]: *}[]}
     */
    const processFileList = list => {
      if (!isArray(list)) {
        list = [list];
      }
      const fileList = list
        .filter(item => item.done || !!item[pathKey] || !!item[nameKey])
        .map(item => ({
          ...pick(item, Object.values(defaultFileItem)),
          _type: "file",
          _disk: props.disk,
        }));

      return isSignle.value ? fileList[0] || null : fileList;
    };

    /**
     * 将文件列表处理成符合文件结构的数组
     * @param {Array|Object} fileList
     */
    const prepareFileList = fileList => {
      if (!fileList) {
        return [];
      }
      fileList = isArray(fileList) ? fileList : [fileList];

      state.fileList = fileList
        .filter(item => item[urlKey] || item[nameKey] || item[pathKey])
        .map(item => ({
          uid: random(1, 10000000),
          done: true,
          name: item[nameKey] || useT("form.attachment"),
          url: item[urlKey],
          _type: "file",
          ...item,
        }));

      //由于初始值可能不符合文件结构，处理后再次触发更新
      emit("update:value", processFileList(state.fileList));
    };

    onMounted(() => {
      // 控制这个组件的渲染时间
      prepareFileList(props.value);
    });

    watch(
      () => props.value,
      fileList => {
        if (fileList && !isArray(fileList)) {
          fileList = [fileList];
        }
        //如果文件列表相同应该避免重复处理
        if (!isEqual(map(fileList, pathKey).sort(), map(state.fileList, pathKey).sort())) {
          prepareFileList(fileList);
        }
      }
    );

    const handlePreview = file => {
      let url = file[urlKey];

      if (!url) {
        return;
      }

      url = url.toLowerCase();
      if (
        url.includes(".jpg") ||
        url.includes(".jpeg") ||
        url.includes(".png") ||
        url.includes(".gif") ||
        isImage.value
      ) {
        state.previewCurrent = state.fileList.findIndex(item => item.uid === file.uid);
        state.previewVisible = true;
      } else {
        location.href = file[urlKey];
      }
    };

    const submitFile = list => {
      let fileList = processFileList(list);

      emit("update:value", fileList);
      emit("success", fileList);

      formItemContext.onFieldChange();
    };

    const handleChange = ({ file, fileList }) => {
      fileList = fileList
        .map(item => {
          if (item.status === "done" && item.response) {
            const res = item.response;
            if (res.result[pathKey]) {
              item = { ...item, ...pick(res.result, Object.values(defaultFileItem)) };
              item.done = true;
            } else {
              item.isRemoved = true;
            }
          } else if (item.status === "error") {
            item.isRemoved = true;
          }
          return item;
        })
        .filter(item => !item.isRemoved);

      if (file.status === "removed") {
        submitFile(fileList);
      } else if (file.status === "done" && file.response?.status !== STATE_CODE_SUCCESS) {
        message.error(file.response?.result || useT("form.upload-fail"));
      } else if (file.status === "error" && file.error) {
        if (file.error.status === 413) {
          message.error(`${file.error.status}: ${useT("form.upload-size-limit")}`);
        } else {
          message.error(file.error.message || useT("form.upload-fail"));
        }
      } else if (!file.status) {
        let index = -1;
        fileList.forEach((item, i) => {
          if (item.uid === file.uid) {
            index = i;
          }
        });
        if (index >= 0) {
          fileList.splice(index, 1);
        }
      }

      //仅当所有的文件状态都为 “done” 才 submitFile, 主要是在多文件上传时不能仅判断当前文件状态
      if (every(fileList, item => item.done)) {
        submitFile(fileList);
      }

      state.fileList = fileList;
    };

    const handleBeforeUpload = file => {
      if (file.size > props.maxSize * 1024 * 1024) {
        message.error(useT("form.upload-size-max", { size: props.maxSize }));
        return false;
      }
      if (isOverflow.value) {
        message.error(useT("form.upload-num-max", { num: props.maxNum }));
        return false;
      }

      return true;
    };

    // 普通上传
    const uploadAction = async ({
      action,
      data,
      file,
      filename,
      headers,
      onError,
      onProgress,
      onSuccess,
      withCredentials,
    }) => {
      console.log("Using uploadAction");
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
      }
      formData.append(filename, file);
      if (props.disk) {
        formData.append("_disk", props.disk);
      }

      try {
        let res = await useFetch().post(action, formData, {
          withCredentials,
          headers,
          onUploadProgress: ({ total, loaded }) => {
            onProgress({ percent: parseInt(Math.round((loaded / total) * 100).toFixed(2)) }, file);
          },
        });
        onSuccess(res, file);
      } catch (e) {
        onError(e);
      }

      return {
        abort() {
          console.log("upload progress is aborted.");
        },
      };
    };

    // 分块上传
    const multipartUploadAction = async ({
      action,
      data,
      file,
      headers,
      onError,
      onProgress,
      onSuccess,
    }) => {
      data = data || {};
      if (props.disk) {
        data["_disk"] = props.disk;
      }
      const resumable = new Resumable({
        // Use chunk size that is smaller than your maximum limit due a resumable issue
        // https://github.com/23/resumable.js/issues/51
        chunkSize: 1 * 1024 * 1024,
        //https://github.com/23/resumable.js/issues/559#issuecomment-622429803
        forceChunkSize: false,
        simultaneousUploads: 3,
        testChunks: false,
        throttleProgressCallbacks: 1,
        // Get the url from data-url tag
        target: action,
        query: data,
        headers,
      });

      resumable.on("fileAdded", () => {
        // trigger when file picked
        resumable.upload(); // to actually start uploading.
      });

      resumable.on("fileProgress", uploadFile => {
        onProgress({ percent: uploadFile.progress() * 100 });
      });

      resumable.on("fileSuccess", (uploadFile, uploadMessage) => {
        onSuccess(JSON.parse(uploadMessage), uploadFile);
      });

      resumable.on("fileError", uploadMessage => {
        onError(uploadMessage);
      });

      resumable.addFile(file);
    };

    /********** render **********/

    const uploadBtn = () => {
      if (props.disabled) {
        return null;
      }
      if (isImage.value) {
        if (!isOverflow.value) {
          return [
            <CloudUploadOutlined />,
            <div class="newbie-upload-text">{useT("form.upload")}</div>,
          ];
        }

        return null;
      } else if (!isImage.value && !isOverflow.value) {
        return [
          <NewbieButton
            label={props.uploadText || useT("form.upload")}
            type="primary"
            icon={<CloudUploadOutlined />}
          ></NewbieButton>,
        ];
      }
      return null;
    };

    return () => (
      <div class="newbie-uploader">
        <Upload
          v-model={[state.fileList, "fileList"]}
          class={`newbie-upload ${isImage.value ? "is-image" : ""}`}
          name={props.name}
          listType={props.type}
          disabled={props.disabled}
          accept={props.accept}
          action={props.action || defaultUploadUrl}
          headers={props.headers}
          data={props.extraData}
          multiple={props.multiple}
          progress={state.progress}
          beforeUpload={handleBeforeUpload}
          customRequest={props.multipart ? multipartUploadAction : uploadAction}
          onPreview={handlePreview}
          onChange={handleChange}
          {...props.uploadProps}
        >
          {uploadBtn()}
        </Upload>
        <ImagePreviewGroup
          preview={{
            visible: state.previewVisible,
            onVisibleChange: vis => (state.previewVisible = vis),
            current: state.previewCurrent,
          }}
        >
          {state.fileList.map(item => (
            <Image style={{ display: "none" }} src={item.url}></Image>
          ))}
        </ImagePreviewGroup>
      </div>
    );
  },
});
