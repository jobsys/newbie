## 示例

---

<script setup>
import { ref } from "vue" ;
import NewbiePassword from "@components/password/NewbiePassword.jsx";

const password = ref("")

</script>

<NewbiePassword  v-model:value="password" width="300"/>

```vue
<script setup>
const password = ref("");
</script>
<NewbiePassword v-model:value="password" width="300" />
```
