<route lang="yaml">
meta:
  title: 手機驗證碼配置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  phoneLoginStatus: '',
  aliPhoneAccessKeyId: '',
  aliPhoneAccessKeySecret: '',
  aliPhoneSignName: '',
  aliPhoneTemplateCode: '',
});

const rules = ref<FormRules>({
  phoneLoginStatus: [
    { required: false, trigger: 'blur', message: '請選擇是否開啟手機號登錄' },
  ],
  aliPhoneAccessKeyId: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫阿里雲短信服務accessKeyId',
    },
  ],
  aliPhoneAccessKeySecret: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫阿里雲短信服務accessKeySecret',
    },
  ],
  aliPhoneSignName: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫阿里雲短信服務的模板簽名',
    },
  ],
  aliPhoneTemplateCode: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫阿里雲短信服務的模板ID',
    },
  ],
});
const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'phoneLoginStatus',
      'aliPhoneAccessKeyId',
      'aliPhoneAccessKeySecret',
      'aliPhoneSignName',
      'aliPhoneTemplateCode',
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
        <div class="flex items-center gap-4">手機驗證碼登錄設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            手機驗證使用<a
              href="https://dysms.console.aliyun.com/overview"
              target="_blank"
              >阿里雲短信服務</a
            >，請先申請好籤名模板以及獲取到您的秘鑰資訊。
          </div>
          <div>當您配置並開啟後則表示開啟用戶端手機號註冊的行為！</div>
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
        label-width="170px"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="開啟手機號註冊/登錄" prop="phoneLoginStatus">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="如您啟用短信登錄、則用戶端則可以通過手機號的方式登錄！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.phoneLoginStatus"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="AccessKeyId" prop="aliPhoneAccessKeyId">
              <el-input
                v-model="formInline.aliPhoneAccessKeyId"
                placeholder="請填寫AccessKeyId"
                clearable
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="AccessKeySecret"
              prop="aliPhoneAccessKeySecret"
            >
              <el-input
                v-model="formInline.aliPhoneAccessKeySecret"
                placeholder="請填寫AccessKeySecret"
                clearable
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="短信簽名" prop="aliPhoneSignName">
              <el-input
                v-model="formInline.aliPhoneSignName"
                placeholder="請填寫您申請的短信簽名"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="短信模板ID" prop="aliPhoneTemplateCode">
              <el-input
                v-model="formInline.aliPhoneTemplateCode"
                placeholder="請填寫短信模板ID"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
