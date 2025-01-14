<route lang="yaml">
meta:
  title: 登錄
  constant: true
  layout: false
</route>

<script lang="ts" setup name="Login">
import type { FormInstance, FormRules } from 'element-plus'
import useUserStore from '@/store/modules/user'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()
const title = import.meta.env.VITE_APP_TITLE

// 校驗 title 是否包含 "AIWeb"
const encodedKeyword = 'QUlXZWI=' // "AIWeb" 的 Base64 編碼
const decodedKeyword = atob(encodedKeyword)

if (!title.includes(decodedKeyword)) {
  document.body.innerHTML = '<h1></h1>'
  throw new Error('')
}

// 表單類型，login 登錄，reset 重置密碼
const formType = ref('login')
const loading = ref(false)
const redirect = ref(route.query.redirect?.toString() ?? '/')

// 登錄
const loginFormRef = ref<FormInstance>()
const loginForm = ref({
  username: localStorage.login_username || '',
  password: '',
  remember: !!localStorage.login_username,
})
const loginRules = ref<FormRules>({
  username: [{ required: true, trigger: 'blur', message: '請輸入用戶名' }],
  password: [
    { required: true, trigger: 'blur', message: '請輸入密碼' },
    { min: 6, max: 18, trigger: 'blur', message: '密碼長度為6到18位' },
  ],
})
function handleLogin() {
  loginFormRef.value
  && loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      userStore
        .login(loginForm.value)
        .then(() => {
          loading.value = false
          if (loginForm.value.remember) {
            localStorage.setItem('login_username', loginForm.value.username)
          }
          else {
            localStorage.removeItem('login_username')
          }
          router.push(redirect.value)
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div id="login-box" class="min-h-[60vh] min-w-[40vw] items-center rounded-lg bg-gray-50 p-6 shadow-lg">
      <el-form
        v-show="formType === 'login'"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form mx-12 my-10"
        autocomplete="on"
      >
        <div class="mb-6 text-center">
          <h3 class="text-xl text-gray-900 font-bold">
            歡迎來到 {{ title }}
          </h3>
        </div>
        <div>
          <el-form-item prop="username" class="py-2">
            <el-input
              v-model="loginForm.username"
              placeholder="用戶名"
              text
              tabindex="1"
              autocomplete="on"
              size="large"
              class="h-10"
            >
              <template #prefix>
                <el-icon>
                  <svg-icon name="ep:user" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password" class="py-2">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密碼"
              tabindex="2"
              autocomplete="on"
              show-password
              size="large"
              class="h-10"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon>
                  <svg-icon name="ep:lock" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <el-checkbox v-model="loginForm.remember" size="large">
            記住我
          </el-checkbox>
        </div>
        <el-button
          :loading="loading"
          type="primary"
          size="large"
          class="w-full"
          @click.prevent="handleLogin"
        >
          登錄
        </el-button>
      </el-form>
    </div>
  </div>
</template>
