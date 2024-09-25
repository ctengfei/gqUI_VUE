<template>
  <div class="app-container" style="display: flex;flex-direction: column;position: relative">
    <div style="flex: 1" ref="deptChart"></div>
    <div class="user">
      <i></i>
      <div class="box">
        <p>人员数量</p>
        <strong>{{ userNum }} 人</strong>
      </div>
    </div>
    <div class="dept">
      <i></i>
      <div class="box">
        <p>部门总数</p>
        <strong>{{ deptNum.length }} 个</strong>
      </div>
    </div>
  </div>
  <el-dialog
      v-model="dialogVisible"
      title="查看"
      width="50%"
      draggable
      class="custom-dialog"
  >
    <userTable :deptId="deptId" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>

import {onMounted, ref} from "vue";
import {listDept} from "@/api/system/dept";
import * as echarts from "echarts";
import {listUser} from "@/api/system/user";
import userTable from './components/userTable';
import {getUserOutList} from "@/api/userManager";
import { treeToArray } from '@/utils'
const { proxy } = getCurrentInstance();
const deptChart = ref();
let deptId = ref('');
let dialogVisible = ref(false);
let userNum = ref(0);
let deptNum = ref(0);
const loop = (data,index=0)=>{
  return data.map((r,i)=>{
      if(r.children && r.children.length){
        r['level'] = index
        r.children = loop(r.children,index +1 )
      }
    return{
      name:r.deptName,
      value:r.deptId,
      level:index,
      children:r.children
    }
  })
}

const getData = () => {
  listDept().then(res=>{
    if(res.code == 200){
      const result = res.data.filter(r=> !(r.deptId == 115))
      let tree = proxy.handleTree(result, "deptId");
      tree = loop(tree);
      deptNum.value = treeToArray(tree).filter(r=>r.level == 2)
      const dept = echarts.init(deptChart.value);
      dept.setOption({
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: '{b}'
        },
        series: [
          {
            type: 'tree',
            data: tree,
            left: '0%',
            right: '0%',
            top: '10%',
            bottom: '35%',
            symbol: 'emptyCircle',
            symbolSize: 12, //状态大小
            orient: 'vertical',
            edgeShape:'polyline',
            avoidLabelOverlap: true,
            lineStyle:{
              type: 'broken',
              width: 5,
              color:new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(252, 127, 0, .5)' },
                { offset: 1, color: 'rgba(53, 194, 254, .5)' },
              ])
            },
            overflow:'break',
            expandAndCollapse: false,
            edgeForkPosition:'30%',
            // roam: true,
            // scaleLimit:{ //缩放比例
            //   min:1,//最小的缩放值
            //   max:4,//最大的缩放值
            // },
            label: {
              position: 'top',
              offset:[0,-15],
              verticalAlign: 'middle',
              align: 'center',
              fontSize: 15,
              backgroundColor:new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: 'rgb(126, 233, 245)' },
                { offset: 1, color: 'rgb(3, 48, 231)' },
              ]),
              borderColor: '#fff',
              color:'#fff',
              borderWidth: 1,
              borderRadius: 5,
              padding: [8,8],
            },
            leaves: {
              label: {
                position: 'bottom',
                offset:[0,100],
                verticalAlign: 'center',
                align: 'center',
                width:20,
                height:180,
                fontSize: 15,
                backgroundColor:new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#8FB8FF' },
                  { offset: 1, color: '#5A90FF' },
                ]),
                formatter: function (val) {
                  let strs = val.name.split(''); //字符串数组
                  let str = ''
                  for (let i = 0, s; s = strs[i++];) { //遍历字符串数组
                    if(i< strs.length){
                      str += s +'\n';
                    }else{
                      str += s;
                    }
                  }
                  return str
                },
              }
            },
            animationDurationUpdate: 750
          }
        ]
      });
      dept.on("click", (param)=>{
        let args = param.data; //当前节点及其子节点的值
        if(args.level == 2){
          deptId.value = args.value;
          dialogVisible.value = true
        }
      });
    }
  })
}

onMounted(()=>{
  getData();
  getUserOutList().then(res=>{
    if(res.success){
      userNum.value = res.data;
    }
  })
  window.addEventListener('resize', () => {
    getData();
  })
})
</script>

<style scoped lang="scss">
i{
  display: inline-block;
  height: 50px;
  width: 50px;
  margin-right: 15px;
}
.box{
  display: flex;
  flex-direction: column;
  p:nth-child(1){
    text-align: center;
    font-size: 20px;
    margin-bottom: 0;
  }
  strong:nth-child(2){
    text-align: center;
    font-size: 22px;
  }
}
.user{
  position: absolute;
  display: flex;
  align-items: center;
  left: 40px;
  i{
    background: url("@/assets/images/user.png") no-repeat center center;
    background-size: cover;
  }
}
.dept{
  position: absolute;
  display: flex;
  align-items: center;
  right: 40px;
  i{
    background: url("@/assets/images/dept.png") no-repeat center center;
    background-size: cover;
  }

}
</style>