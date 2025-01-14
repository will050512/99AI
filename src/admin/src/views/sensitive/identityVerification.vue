<route lang="yaml">
meta:
  title: 風控設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  appCode: '',
  openIdentity: '',
  openPhoneValidation: '', // 是否開啟手機號驗證
  phoneValidationMessageCount: '', // 多少消息後開啟手機號驗證
  identityVerificationMessageCount: '', // 多少消息後開啟實名認證
  isSensitiveWordFilter: '', // 是否開啟敏感詞過濾
});

const rules = ref<FormRules>({
  appCode: [
    { required: true, trigger: 'blur', message: '請填寫身份認證appCode' },
  ],
  openIdentity: [
    { required: true, trigger: 'blur', message: '請選擇是否開啟身份認證' },
  ],
  openPhoneValidation: [
    { required: true, trigger: 'blur', message: '請選擇是否開啟手機號驗證' },
  ],
  phoneValidationMessageCount: [
    { required: true, trigger: 'blur', message: '請填寫消息數量' },
  ],
  identityVerificationMessageCount: [
    { required: true, trigger: 'blur', message: '請填寫消息數量' },
  ],
  isSensitiveWordFilter: [
    { required: true, trigger: 'blur', message: '請選擇是否開啟敏感詞過濾' },
  ],
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'appCode',
      'openIdentity',
      'openPhoneValidation',
      'phoneValidationMessageCount',
      'identityVerificationMessageCount',
      'isSensitiveWordFilter',
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
        <div class="flex items-center gap-4">認證設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            實名認證介面使用阿里雲<a
              href="https://market.aliyun.com/apimarket/detail/cmapi026109#sku=yuncode20109000025"
              target="_blank"
              >實名認證</a
            >，需自行開通並獲取 appCode。
          </div>
          <div>
            開啟實名認證/手機號驗證後，當用戶對話條數超過對應閾值時，將會觸發實名認證/手機號驗證。
          </div>
          <div>觸發優先級：手機號驗證 > 實名認證</div>
          <div>
            開啟敏感詞過濾後，將會對用戶發送以及 AI 回覆的消息進行敏感詞過濾。
          </div>
        </div>
      </template>
      <HButton outline @click="handlerUpdateConfig">
        <SvgIcon name="i-ri:file-text-line" />
        保存設置
      </HButton>
    </PageHeader>

    <el-card style="margin: 20px">
      <el-form
        ref="formRef"
        :rules="rules"
        :model="formInline"
        label-width="150px"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="開啟實名驗證" prop="openIdentity">
              <el-tooltip
                content="開啟將打開實名驗證"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.openIdentity"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="appCode" prop="appCode">
              <el-input
                v-model="formInline.appCode"
                placeholder="請填寫實名認證 appCode"
                clearable
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="開啟手機號驗證" prop="openPhoneValidation">
              <el-switch
                v-model="formInline.openPhoneValidation"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="手機號驗證閾值"
              prop="phoneValidationMessageCount"
            >
              <el-input
                v-model="formInline.phoneValidationMessageCount"
                placeholder="請填寫消息數量"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="實名認證閾值"
              prop="identityVerificationMessageCount"
            >
              <el-input
                v-model="formInline.identityVerificationMessageCount"
                placeholder="請填寫消息數量"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="開啟敏感詞過濾" prop="isSensitiveWordFilter">
              <el-switch
                v-model="formInline.isSensitiveWordFilter"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
