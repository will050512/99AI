<route lang="yaml">
name: personalEditPassword
meta:
  title: 修改密碼
</route>

<script lang="ts" setup name="PersonalEditPassword">
import useUserStore from '@/store/modules/user';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

import ApiUser from '@/api/modules/user';

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();

const formRef = ref<FormInstance>();
const form = ref({
  password: '',
  newpassword: '',
  checkpassword: '',
});

const mainPage = useMainPage();

const rules = ref<FormRules>({
  password: [{ required: true, message: '請輸入原密碼', trigger: 'blur' }],
  newpassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, max: 18, trigger: 'blur', message: '密碼長度為6到18位' },
  ],
  checkpassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== form.value.newpassword) {
          callback(new Error('兩次密碼不一致！'));
        } else {
          callback();
        }
      },
    },
  ],
});

function onSubmit() {
  formRef.value &&
    formRef.value.validate((valid) => {
      if (valid) {
        const { password, newpassword } = form.value;
        ApiUser.passwordEdit({
          oldPassword: password,
          password: newpassword,
        }).then(() => {
          ElMessage({
            type: 'success',
            message: '修改密碼成功，請重新登錄',
          });
          userStore.logout().then(() => {
            router.push({
              name: 'login',
              query: {
                redirect: route.fullPath,
              },
            });
          });
        });
      }
    });
}

function reload() {
  mainPage.reload();
}
</script>

<template>
  <div>
    <page-header title="修改密碼" content="定期修改密碼可以提高帳號安全性噢~" />
    <page-main>
      <el-row>
        <el-col :md="24" :lg="12">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="120px"
          >
            <el-form-item label="原密碼" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="請輸入原密碼"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密碼" prop="newpassword">
              <el-input
                v-model="form.newpassword"
                type="password"
                placeholder="請輸入原密碼"
                show-password
              />
            </el-form-item>
            <el-form-item label="確認新密碼" prop="checkpassword">
              <el-input
                v-model="form.checkpassword"
                type="password"
                placeholder="請輸入原密碼"
                show-password
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </page-main>
    <fixed-action-bar>
      <el-button type="primary" size="large" @click="onSubmit">
        遞交
      </el-button>
      <el-button type="default" size="large" @click="reload"> 取消 </el-button>
    </fixed-action-bar>
  </div>
</template>
