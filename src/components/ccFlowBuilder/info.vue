<template>
  <q-dialog
    title="流程数据信息"
    v-model="dialogVisible"
    width="70%"
  >
    <el-alert
      title="使用说明"
      type="warning"
      description="以下流程信息可以被存储起来，方便下一次流程加载"
      show-icon
      close-text="知道了"
    >
    </el-alert>
    <br />
    <!--一个高亮显示的插件-->
    <codemirror
      :value="flowJsonData"
      :options="options"
      class="code"
    ></codemirror>
  </q-dialog>
</template>

<script>
import 'codemirror/lib/codemirror.css'
import { codemirror } from 'vue-codemirror'

require('codemirror/mode/javascript/javascript.js')

export default {
  props: {
    data: Object
  },
  data () {
    return {
      dialogVisible: false,
      flowJsonData: {},
      options: {
        mode: { name: 'javascript', json: true },
        lineNumbers: true
      }
    }
  },
  components: {
    codemirror
  },
  methods: {
    init () {
      this.dialogVisible = true
      this.flowJsonData = JSON.stringify(this.data, null, 4).toString()
    }
  }
}
</script>
