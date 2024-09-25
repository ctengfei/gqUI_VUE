<template>
    <div class="boxFlex">
      <div class='tables'>
        <pro-crud
          ref="crudRef"
          v-model:search="searchForm"
          :columns="columns"
          :index="index"
          :menu="menu"
          :data="tableData"
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          layout="->,total,sizes,prev, pager, next, jumper"
          @load="load"
          background
          :page-sizes="[10, 20, 30, 40, 50]"
          :total="pagination.total"
          label-width="100px"
          :column="1"
          :width="400"
          @search="searchSubmit"
          @search-reset="searchReset"
        >
          <template #table-imgs="{ size, row }">
            <el-image
              v-for="(item, index) in row.imgs"
              :key="index"
              :src="item.url"
              :preview-teleported="true"
              :preview-src-list="[row.imgArr]"
              style="width: 50px; height: 50px"
              fit="cover"
          />
          </template>
          <template #form-menu-right="{ size }">
            <el-button :size="size" @click="crudRef.closeDialog()">
              关闭
            </el-button>
          </template>
          <template #menu="{ size, row }">
            <el-button
              icon="View"
              link
              :size="size"
              @click="detailView(row)"
              type="primary"
              >问题详情</el-button
            >
            <el-button
              icon="Document"
              link
              :size="size"
              @click="clickPoint(row)"
              type="primary"
              >查看点位</el-button
            >
          </template>
        </pro-crud>
      </div>
      <div class="mapComs">
        <mapPoint class="mapCom" id="mapCom" :pointObj="pointObj"/>
      </div>
    </div>
    <ReportDialog
      @closeDialog="isShowResult = false"
      :id="nodeId"
      :type="true"
      v-if="isShowResult"
      :title="title"
      :dialogVisible="isShowResult"
    />
  </template>
    
    <script setup name="report">
  import { ReportDialog } from "../../components";
  import mapPoint from "./mapPoint";
  import { nextTick, onMounted, ref, reactive, computed } from "vue";
  import {
    defineCrudColumns,
    defineCrudMenuColumns,
    defineCrudSubmit,
    defineCrudSearch,
    defineFormColumns,
    defineTableIndexColumns,
    defineCrudBeforeOpen,
    defineCrudBeforeClose,
  } from "element-pro-components";
  import { reportMenu, problemStatus } from "../../constant";
  import { getPatrolPlanApi, getPatrolProblem } from "../../apis";
  import { formatterVal } from "@/utils";

  // import {Vector as VectorSource, XYZ} from 'ol/source';
  // import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
  // import {TileSuperMapRest} from '@supermap/iclient-ol';
  // import View from 'ol/View';
  // import Map from 'ol/Map';
  // import {Point, Circle} from 'ol/geom';
  // import {Feature, Overlay} from 'ol';
  // import {Fill, Stroke, Style, Text, Icon} from 'ol/style';
  // import CircleStyle from 'ol/style/Circle';
  // import {defaults as defaultControls, ScaleLine} from 'ol/control';
  // import {GeoJSON} from 'ol/format'
  //表格实例
  const crudRef = ref();
  //表单搜索数据
  const searchForm = ref({});
  //表格数据
  let tableData = ref([]);
  let partLocs = ref('');
  //分页数据
  let pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  let title = ref("");
  let nodeId = ref("");
  let isShowResult = ref(false);
  let detail = ref({});
  let pointObj = ref({})
  const props = defineProps(["type"]);
  const { proxy } = getCurrentInstance();
  const { PATROL_TYPE } = proxy.useDict("PATROL_TYPE");
  
  //表格配置数据
  const columns = defineCrudColumns([
    {
      label: "桩号及位置",
      prop: "partLoc",
      width: "100px",
      component: 'el-input',
      props:{
        placeholder:'请输入桩号及位置',
      },
      // render: (row) => {
      //   return (
      //     problemStatus.filter((item) => item.value === row.status)[0].label || ""
      //   );
      // },
      search: true,
      detail: true,
    },
    {
      label: "检查情况描述",
      prop: "checkDesc",
      width: "200px",
      detail: true,
    },
    {
      label: "问题图片",
      prop: "imgs",
      width: "100px",
      detail: true,
    },
    {
      label: "提交人",
      prop: "createBy",
      width: "100px",
      detail: true,
    },
    {
      label: "问题上报时间",
      prop: "createTime",
      width: "200px",
      detail: true,
    },
  ]);
  //操作按钮配置
  const menu = defineCrudMenuColumns(reportMenu);
  //序号
  const index = defineTableIndexColumns({
    label: "序号",
    width: 50,
  });
  
  //挂载完成之后获取表格数据
  onMounted(() => {
    // document.getElementById('mapCom').style.padding = "1vw";
    getPatrolProblemList();
  });
  //获取表格数据

  const getPatrolProblemList = () => {
    const { partLoc } = searchForm.value;
    getPatrolProblem(
      {
        patrolType: 2,
        partLoc: partLoc,
        checkDesc: '',
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      }
    ).then(res=>{
      let temp = res.data.data;
      let newArrs = [];
      temp.forEach(item => {
        let imgs = item.img.replace(/\\/g, "\\\\");
        let imgResult = JSON.parse(imgs);
        let imgArr = imgResult.map(items=>items.url);
        let newArr = {
          ...item,
          imgs: JSON.parse(imgs),
          imgArr: imgArr
        }
        newArrs.push(newArr);
      })
      tableData.value = newArrs;
      pagination.total = res.data.total;
    })
  };
  // 分页选择
  const load = () => {
    getPatrolProblemList();
  };
  
  //搜索
  const searchSubmit = defineCrudSearch((done) => {
    getPatrolProblemList();
    done();
  });
  //弹窗开启之前
  const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
    detail.value = row || {};
    done();
  });
  //重置
  const searchReset = () => {
    pagination.pageNum = 1;
    getPatrolProblemList();
  };
  const detailView = (row) => {
    title.value = "问题详情";
    setNode(row);
  };
  const clickPoint = (row) => {
    title.value = "处理详情";
    // setNode(row);
    pointObj.value = row
  };
  const setNode = (row) => {
    nodeId.value = row.id;
    isShowResult.value = true;
  };
  </script>
    
  <style lang="scss">
    .boxFlex{
      display: flex;
      justify-content: space-between;
      .tables{
        width: 50%;
      }
      .mapComs{
        width: 40vw;
        height: 75vh;
        #mapCom{
          height: 75vh;
          width: 40vw;
        }
      }
      
    }
  </style>
    
    