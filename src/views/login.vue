<template>
  <div class="bg">
    <div class="login">
      <div class="logo">
      </div>
      <h2>数字孪生王英</h2>
      <p>Digital twin Wangying</p>
      <el-form class="login-form"  ref="loginRef" :model="loginForm" :rules="loginRules">
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="账号"
          >
            <template #prefix><el-icon style="font-size: 20px" ><User  /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              show-password
              placeholder="密码"
              @keyup.enter="handleLogin"
          >
            <template #prefix><el-icon style="font-size: 20px"><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled">
          <el-input
              v-model="loginForm.code"
              auto-complete="off"
              size="large"
              placeholder="验证码"
              @keyup.enter="handleLogin"
          >
            <template #prefix></template>
            <template #suffix>
              <img :src="codeUrl" @click="getCode" class="login-code-img"/>
            </template>

          </el-input>
        </el-form-item>
        <!--      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>-->
        <el-form-item style="width:100%;">
          <el-button
              :loading="loading"
              type="primary"
              size="large"
              style="width:100%;background: linear-gradient( 180deg, #33C4FF 0%, #1791FF 100%);border: 0"
              @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right;" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form-item>
        <el-popover
            placement="top"
            trigger="hover"
        >
          <template #reference>
            <div class="other-platform">
              下载手机APP（安卓版）
            </div>

          </template>
          <template #default>
            <div class="dimensional">
              <img :src="qCode" style="width: 100%;height: 100%" alt="">
            </div>
          </template>
        </el-popover>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {getCodeImg, getQCode} from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import {getListData} from "@/api/system/dict/data";
import useDictionaryStore from "@/store/modules/dictionary";
import {onMounted,ref } from "vue";
import {blobToBase64, sessionStorage} from "@/utils";
import {getConfigKey} from "@/api/system/config";

const userStore = useUserStore()
const router = useRouter();
const { proxy } = getCurrentInstance();
let qCode = ref('')
const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

onMounted(()=>{
  getQCode().then(res=>{
    let blob = new Blob([res], {type: "image/png"});
    blobToBase64(blob).then(ces => {
     qCode.value = ces
    })
  })
})

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login({...loginForm.value,password:encrypt(loginForm.value.password)}).then(() => {
        router.push({ path: redirect.value || "/" });
        // 登录成功后 立即把数据存起来 避免因为 redirect 直接跳入对应页面时 数据还未拿到数据
        // 数据字典
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
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : password,
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
.bg{
  height: 100vh;
  width: 100vw;
  background: url("../assets/images/bj.png") no-repeat center center;
  background-size: cover;
}
.login {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom:0 ;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  height: 680px;
  width: 60%;
  .logo{
    height: 120px;
    width: 120px;
    background: url("@/assets/logo/logo.png") no-repeat center center;
    background-size: 80%;
    margin-bottom: 20px;
    &:before{
      content: '';
      display: inline-block;
      height: 120px;
      width: 120px;
      background: url("@/assets/images/queen.png") no-repeat center center;
      background-size: 108%;
      animation: rotate 6s linear infinite;
    }
  }
  h2{
    font-family: TRENDS;
    font-size: 56px;
    color: #FFFFFF;
    text-shadow: 0px 0px 6px rgba(0,0,0,0.5);
    font-style: normal;
    margin-bottom: 10px;
  }
  p{
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 16px;
    color: #FFFFFF;
    margin-bottom: 50px;
  }
  .login-form{
    width: 490px;
    height: 447px;
    background: rgba(255,255,255,0.3);
    padding: 50px;
  }
  .other-platform{
    display: inline-block;
    font-weight: 400;
    font-size: 16px;
    color: #337ecc;
    cursor: pointer;
  }
  .el-form-item{
    margin-bottom: 30px;
  }

}
.dimensional{
  height: 130px;
  width: 125px;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}


.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 30px;
  padding-left: 12px;
  cursor: pointer;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  25% {
    transform: rotate(90deg);
  }

  50% {
    transform: rotate(180deg);
  }

  75% {
    transform: rotate(270deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes rotate {
  0% {
    transform: rotate(0);
  }

  25% {
    transform: rotate(90deg);
  }

  50% {
    transform: rotate(180deg);
  }

  75% {
    transform: rotate(270deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

</style>
