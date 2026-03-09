## 示例

---

<script setup>
import { ref } from "vue";
import NewbieUploader from "@components/uploader/NewbieUploader.jsx";
import NewbieProvider from "@components/provider/NewbieProvider.jsx";

const fileList = ref([
	{
		uid: "-1",
		name: "image.png",
		status: "done",
		url: "https://aliyuncdn.antdv.com/logo.png",
	},
	{
		uid: "-2",
		name: "image.png",
		status: "done",
		url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
	},
	{
		uid: "-3",
		name: "image.png",
		status: "done",
		url: "https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp",
	},
	{
		uid: "-xxx",
		percent: 50,
		name: "image.png",
		status: "uploading",
		url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
	},
]);

const files = ref([]);

const provider = {
	uploader: {
		uploadUrl: "",
		defaultFileItem: {
			id: "id",
			name: "name",
			url: "url",
			path: "path",
			thumbUrl: "thumbUrl",
		},
	},
};
</script>

<NewbieProvider v-bind="provider">
    <p>图片上传</p>
    <NewbieUploader v-model:value="fileList" accept=".png,.jpg,.jpeg" :max-num="5" action="https://www.mocky.io/v2/5cc8019d300000980a055e76"></NewbieUploader>
    <p>文件上传</p>
    <NewbieUploader v-model:value="files" type="file" action="https://www.mocky.io/v2/5cc8019d300000980a055e76"></NewbieUploader>
</NewbieProvider>
