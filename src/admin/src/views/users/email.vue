<route lang="yaml">
meta:
  title: 郵件設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  // isVerifyEmail: '',
  noVerifyRegister: '',
  emailLoginStatus: '',
  MAILER_HOST: '',
  MAILER_PORT: '',
  MAILER_USER: '',
  MAILER_PASS: '',
  MAILER_SECURE: '',
});

const rules = ref<FormRules>({
  MAILER_HOST: [
    { required: true, trigger: 'blur', message: '請填寫SMTP服務器地址' },
  ],
  MAILER_PORT: [
    { required: true, trigger: 'blur', message: '請填寫SMTP服務器端口' },
  ],
  MAILER_USER: [
    { required: true, trigger: 'blur', message: '請填寫SMTP用戶名稱' },
  ],
  MAILER_PASS: [
    { required: true, trigger: 'blur', message: '請填寫SMTP用戶密碼' },
  ],
  MAILER_SECURE: [{ required: true, trigger: 'blur', message: '是否使用SSL' }],
});
const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'noVerifyRegister',
      'emailLoginStatus',
      'MAILER_HOST',
      'MAILER_PORT',
      'MAILER_USER',
      'MAILER_PASS',
      'MAILER_SECURE',
    ],
  });
  Object.assign(formInline, res.data);
}

function handlerUpdateConfig() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await apiConfig.setConfig({ settings: fotmatSetting(formInline) });
        ElMessage.success('變更配置資訊成功');
      } catch (error) {}
      queryAllconfig();
    } else {
      ElMessage.error('請填寫完整資訊');
    }
  });
}

function fotmatSetting(settings: any) {
  return Object.keys(settings).map((key) => {
    return {
      configKey: key,
      configVal: settings[key],
    };
  });
}

onMounted(() => {
  queryAllconfig();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">郵件登錄設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>郵件設置主要用於發送註冊時的激活郵件。</div>
          <div>是否開啟郵箱登錄：決定用戶是否可以通過郵箱進行登錄。</div>
          <div>是否開啟郵箱註冊：決定用戶是否可以通過郵箱進行註冊。</div>
          <div>SMTP服務器配置，用於發送郵件的 SMTP 相關配置，需自行測試。</div>
        </div>
      </template>
      <HButton text outline @click="handlerUpdateConfig">
        <SvgIcon name="i-ri:file-text-line" />
        保存設置
      </HButton>
    </PageHeader>
    <el-card style="margin: 20px">
      <el-form
        ref="formRef"
        :rules="rules"
        :model="formInline"
        label-width="190px"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="開啟郵箱註冊/登錄" prop="emailLoginStatus">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="如您啟用當前郵箱登錄、則用戶端可以通過郵箱登錄！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.emailLoginStatus"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="關閉註冊驗證" prop="noVerifyRegister">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="打開即為關閉註冊校驗、註冊將直接成功、請謹慎開啟！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.noVerifyRegister"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="SMTP服務器地址" prop="MAILER_HOST">
              <el-input
                v-model="formInline.MAILER_HOST"
                placeholder="示例: smtp.example.com"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="SMTP服務器端口" prop="MAILER_PORT">
              <el-input
                v-model="formInline.MAILER_PORT"
                placeholder="示例: 465"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="SMTP用戶名稱" prop="MAILER_USER">
              <el-input
                v-model="formInline.MAILER_USER"
                placeholder="SMTP認證用戶名"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="SMTP用戶密碼" prop="MAILER_PASS">
              <el-input
                v-model="formInline.MAILER_PASS"
                placeholder="SMTP認證密碼"
                type="password"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="郵箱SSL配置" prop="MAILER_SECURE">
              <el-checkbox
                v-model="formInline.MAILER_SECURE"
                true-label="1"
                false-label="0"
              >
                啟用SSL
              </el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
