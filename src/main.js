import { createApp } from 'vue'
import Cookies from 'js-cookie'
import Antd from 'ant-design-vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPro from 'element-pro-components'

import VXETable from 'vxe-table'
import v3ImgPreview from 'v3-img-preview'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-pro-components/lib/styles/index'
import 'vxe-table/lib/style.css'
import zhCn from 'element-plus/dist/locale/zh-cn'
import 'ol/ol.css';
import '@/assets/styles/index.scss' // global css
import 'ant-design-vue/dist/antd.css';
import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'
import AlUpload from '@/components/AlUpload';
// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect'
// 字典标签组件
import DictTag from '@/components/DictTag'
import {getToken} from "@/utils/auth";
import {getListData} from "@/api/system/dict/data";
import useDictionaryStore from "@/store/modules/dictionary";
import {getConfigKey} from "@/api/system/config";
import {sessionStorage} from "@/utils";

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

// 全局组件挂载
app.component('AlUpload',AlUpload)
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.use(Antd)
app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.use(ElementPro)
app.use(v3ImgPreview)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.component('svg-icon', SvgIcon)


function useTable (app) {
  app.use(VXETable)
}

app.use(useTable);

directive(app)

// 全局注册字典
if(getToken()){
  const dic = {};
  getListData().then(res=>{
    if(res.code === 200){
      res.data.forEach(r=>{
        dic[r.dictType] =[];
        dic[r.dictType] = r.dictDataList.map(r=>({label:r.dictLabel,value:r.dictValue }))
      });
      useDictionaryStore().setDict(dic)
    }
  })
  // 地图token
  getConfigKey('sys.map.token').then(res=>{
    if(res.code == 200){
      sessionStorage.set('MAP_TOKEN',res.msg)
    }
  })
}

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: zhCn,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')
