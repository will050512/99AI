<script lang="ts" setup>
import {
  fetchLoginAPI,
  fetchRegisterAPI,
  fetchSendCode
} from '@/api';
import { useBasicLayout } from '@/hooks/useBasicLayout';
import { t } from '@/locales';
import { useAuthStore, useGlobalStoreWithOut } from '@/store';
import type { FormInst } from 'naive-ui';
import { NForm, useMessage } from 'naive-ui';
import { computed, ref } from 'vue';
import Vcode from "./SliderCaptcha.vue";

interface Emit {
  (ev: 'changeLoginType', val: string): void;
}
const emit = defineEmits<Emit>();
const formRef = ref<FormInst | null>(null);
const Nmessage = useMessage();
const isLogin = ref(true);
const loading = ref(false);
const authStore = useAuthStore();
const lastSendPhoneCodeTime = ref(0);
const siteName = authStore.globalConfig.siteName;
const { isMobile } = useBasicLayout();
const isCaptchaLogin = ref(false);
const isShow = ref(false);
const useGlobalStore = useGlobalStoreWithOut();
const globalConfig = computed(() => authStore.globalConfig);

const registerForm = ref({
  // username: '',
  password: '',
  contact: '',
  captchaId: null,
  code: '',
});

const loginForm = ref({
  username: '',
  password: '',
  contact: '',
});

const rules = {
  username: [
    { required: true, message: t('login.enterUsername'), trigger: 'blur' },
    {
      min: 2,
      max: 30,
      message: t('login.usernameLength'),
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: t('login.enterPassword'), trigger: 'blur' },
    {
      min: 6,
      max: 30,
      message: t('login.passwordLength'),
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: t('login.enterEmail'), trigger: 'blur' },
    {
      type: 'email',
      message: t('login.emailValid'),
      trigger: ['blur', 'change'],
    },
  ],
};

const wechatRegisterStatus = computed(
  () => Number(authStore.globalConfig.wechatRegisterStatus) === 1
);
const phoneLoginStatus = computed(
  () => Number(authStore.globalConfig.phoneLoginStatus) === 1
);

const noVerifyRegister = computed(
  () => Number(authStore.globalConfig.noVerifyRegister) === 1
);

const emailLoginStatus = computed(
  () => Number(authStore.globalConfig.emailLoginStatus) === 1
);

// 使用 ref 來管理全局參數的狀態
const agreedToUserAgreement = ref(true); // 讀取初始狀態並轉換為布爾類型

// 點擊“用戶協議及隱私政策”時，自動同意
function handleClick() {
  agreedToUserAgreement.value = true; // 設置為同意
  // useGlobalStore.updateNoticeDialog(true); // 假設你有一個類似的狀態管理方法，用於顯示對話框或進行其他操作
  useGlobalStore.updateUserAgreementDialog(true); // 假設你有一個類似的狀態管理方法，用於顯示對話框或進行其他操作
  // console.log('User agreed to User Agreement:', ss.get('agreedToUserAgreement'));
}

const loginTypeText = computed(() => {
  if (emailLoginStatus.value && phoneLoginStatus.value) {
    return t('login.emailPhone');
  } else if (emailLoginStatus.value) {
    return t('login.email');
  } else if (phoneLoginStatus.value) {
    return t('login.phone');
  }
});

const loginEnterType = computed(() => {
  if (emailLoginStatus.value && phoneLoginStatus.value) {
    return t('login.enterEmailOrPhone');
  } else if (emailLoginStatus.value) {
    return t('login.enterEmail');
  } else if (phoneLoginStatus.value) {
    return t('login.enterPhone');
  }
});



//  定時器改變倒計時時間方法
function changeLastSendPhoneCodeTime() {
  if (lastSendPhoneCodeTime.value > 0) {
    setTimeout(() => {
      lastSendPhoneCodeTime.value--;
      changeLastSendPhoneCodeTime();
    }, 1000);
  }
}

/* 發送驗證碼 */
async function handleSendCaptcha() {
  isShow.value = false;
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        const {  contact,  captchaId } =
          registerForm.value;

        // const isEmail = /\S+@\S+\.\S+/.test(contact);
        // const isPhone = /^\d{10,}$/.test(contact);
        const params: any = {  contact,  captchaId };
        let res: any;
        res = await fetchSendCode(params);
        const { success, message } = res;
        if (success) {
          Nmessage.success(res.data);
          // isSendCaptcha.value = true;
          // 記錄重新發送倒計時
          lastSendPhoneCodeTime.value = 60;
          changeLastSendPhoneCodeTime();
        } else {
          // isSendCaptcha.value = false;
          Nmessage.error(message);
        }
      } catch (error) {
      }
    }
  });
}

/* 註冊登錄 */
function handlerSubmit() {
    if (agreedToUserAgreement.value === false&&globalConfig.value.isAutoOpenAgreement === '1') {
    return Nmessage.error(`請閱讀並同意《${globalConfig.value.agreementTitle}》`);
  }
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        loading.value = true;
        const Interface = isLogin.value ? fetchLoginAPI : fetchRegisterAPI;
        const params: any = !isLogin.value
          ? registerForm.value
          : {
            username: loginForm.value.username,
            password: loginForm.value.password,
          };
        const res: any = await Interface(params);
        loading.value = false;

        const { success, message } = res;
        if (!success) return Nmessage.error(message);
        if (!isLogin.value) {
          Nmessage.success(t('login.registrationSuccess'));
          const { contact, password } = registerForm.value;
          loginForm.value.username = contact;
          loginForm.value.password = password;
          isLogin.value = !isLogin.value;
        } else {
          Nmessage.success(t('login.loginSuccess'));
          authStore.setToken(res.data);
          authStore.getUserInfo();
          authStore.setLoginDialog(false);
        }
      } catch (error) {
        loading.value = false;
      }
    }
  });
}

</script>

<template>
  <div class="flex w-full flex-col h-full justify-center " :class="isMobile ? 'px-5 py-5' : 'px-10 py-5'">
    <NForm v-if="!isLogin&& !isCaptchaLogin" ref="formRef" :model="registerForm" :rules="rules" label-placement="left" label-width="auto"
      require-mark-placement="right-hanging">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mb-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-300">
          {{ siteName }} {{ t('login.registerTitle') }}
        </h2>
      </div>
        <div class="mt-4  flex">
        <input id="username" type="text" v-model="registerForm.contact"
          :placeholder="t('login.enterContact') + loginTypeText"
          class="flex-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm dark:text-gray-300 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:focus:ring-gray-400" />

      </div>

      <div v-if="!noVerifyRegister" class="mt-4  relative">
        <input id="username" type="text" v-model="registerForm.code" :placeholder="t('login.enterCode')"

          class="block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm dark:text-gray-300 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:focus:ring-gray-400 pl-3 pr-12" />
          <button block
        v-if="!noVerifyRegister"
          class="absolute right-0 top-1/2 transform -translate-y-1/2 flex justify-center rounded-r-md bg-primary-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          :disabled="loading" :loading="loading" @click="isShow = true">
          {{ t('login.sendVerificationCode') }}
        </button>
      </div>

      <div class="rounded-lg ">
    <Vcode :show="isShow" @success="handleSendCaptcha()" @close="isShow = false"  class="bg-red-500" />

  </div>

      <div class="mt-4 ">
        <input id="username" type="password" v-model="registerForm.password" :placeholder="t('login.enterPassword')"
          class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm dark:text-gray-300 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:focus:ring-gray-400" />
      </div>

      <div v-if="globalConfig.isAutoOpenAgreement === '1'" class="flex items-center justify-between my-3">
        <div class="flex items-center">
          <input
            v-model="agreedToUserAgreement"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"

          />
          <p class="ml-1 text-center text-sm text-gray-500 dark:text-gray-400">
            已閱讀並同意
            <a
              href="#"
              class="font-semibold leading-6 text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-600"
              @click="handleClick"
              >《{{globalConfig.agreementTitle}}》</a
            >
          </p>
        </div>
      </div>

      <div>
        <button @click="handlerSubmit" type="submit"
          class="flex w-full my-5 justify-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {{ t('login.registerAccount') }}
        </button>
      </div>

      <p v-if="emailLoginStatus || phoneLoginStatus"
        class=" text-center text-sm text-gray-500 dark:text-gray-400">
        {{ t('login.alreadyHaveAccount') }}
        <a href="#"
          class="font-semibold leading-6 text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-600"
          @click="isLogin = !isLogin">{{ t('login.goToLogin') }}</a>
      </p>
    </NForm>

    <!-- login -->
    <NForm v-if="isLogin && !isCaptchaLogin" size="large" ref="formRef" :model="loginForm" :rules="rules" label-placement="left"
      label-width="auto" require-mark-placement="right-hanging">
      <div class="mb-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class=" text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-300">
          {{ siteName }} 登錄
        </h2>
      </div>


      <div class="mt-4 ">
        <label for="username" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">{{
          loginTypeText }}</label>
        <div class="mt-2">
          <input id="username" type="text" v-model="loginForm.username" :placeholder="loginEnterType"
            class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm dark:text-gray-300 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:focus:ring-gray-400" />
        </div>
      </div>

      <!-- 密碼 輸入框 -->
      <div class="mt-4 ">
        <!-- 使用flex佈局將標籤和忘記密碼鏈接放在同一行 -->
        <div class="mt-2">
                  <label for="username" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">{{
          t('login.password') }}</label>
          <input id="password" type="password" v-model="loginForm.password" :placeholder="t('login.enterYourPassword')"
            class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm dark:text-gray-300 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:focus:ring-gray-400" />
        </div>
      </div>

      <div class="flex items-center justify-between my-3">
              <div v-if="globalConfig.isAutoOpenAgreement === '1'" class="flex items-center justify-between my-3">
        <div class="flex items-center">
          <input
            v-model="agreedToUserAgreement"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"

          />
          <p class="ml-1 text-center text-sm text-gray-500 dark:text-gray-400">
            已閱讀並同意
            <a
              href="#"
              class="font-semibold leading-6 text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-600"
              @click="handleClick"
              >《{{globalConfig.agreementTitle}}》</a
            >
          </p>
        </div>
      </div>
        <!-- <div class="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
          <label for="remember-me" class="ml-3 block text-sm leading-6 text-gray-500 dark:text-gray-400">{{
            t('login.rememberAccount') }}</label>
        </div> -->

        <!-- <div class="text-sm leading-6">
          <a href="#" class="font-semibold text-gray-500 hover:text-indigo-500 dark:text-gray-400" @click="isCaptchaLogin = !isCaptchaLogin">{{
            t('login.forgotPassword') }}</a>
        </div> -->
      </div>

      <div>
        <button @click="handlerSubmit" type="submit"
          class="flex w-full my-5 justify-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {{ t('login.loginAccount') }}
        </button>
      </div>

      <p v-if="emailLoginStatus || phoneLoginStatus"
        class=" text-center text-sm text-gray-500 dark:text-gray-400">
        {{ t('login.noAccount') }}
        <a href="#"
          class="font-semibold leading-6 text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-600"
          @click="isLogin = !isLogin">
          {{ t('login.register') }}</a>
      <div v-if="wechatRegisterStatus">
        {{ t('login.orUse')
        }}<a href="#"
          class="font-semibold leading-6 text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-600"
          @click="emit('changeLoginType', 'wechat')">
          {{ t('login.scanLogin') }}
        </a>
      </div>

      </p>
    </NForm>

    <!-- forget passwd-->
    <NForm v-if="isCaptchaLogin" ref="formRef" :model="registerForm" :rules="rules" label-placement="left" label-width="auto"
      require-mark-placement="right-hanging">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mb-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-300">
         驗證碼登錄
        </h2>
      </div>

        <div class="mt-4  relative">
        <input id="username" type="text" v-model="registerForm.contact"
          :placeholder="t('login.enterContact') + loginTypeText"
          class="block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm dark:text-gray-300 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:focus:ring-gray-400 pl-3 pr-12" />
        <button block

          class="absolute right-0 top-1/2 transform -translate-y-1/2 flex justify-center rounded-r-md bg-primary-500 px-2 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          :disabled="loading" :loading="loading" @click="handleSendCaptcha">
          {{ t('login.sendVerificationCode') }}
        </button>
      </div>


      <div  class="mt-4  flex">
        <input id="username" type="text" v-model="registerForm.code" :placeholder="t('login.enterCode')"
          class="flex-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm dark:text-gray-300 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:focus:ring-gray-400" />
      </div>



      <div>
        <button @click="handlerSubmit" type="submit"
          class="flex w-full my-5 justify-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          驗證碼登錄
        </button>
      </div>

      <p v-if="emailLoginStatus || phoneLoginStatus"
        class="mt-0 mb-5 text-center text-sm text-gray-500 dark:text-gray-400">
         繼續使用密碼登錄？
        <a href="#"
          class="font-semibold leading-6 text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-600"
          @click="isCaptchaLogin = !isCaptchaLogin">返回</a>
      </p>
    </NForm>
  </div>


</template>
