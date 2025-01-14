<route lang="yaml">
meta:
  title: 歡迎頁設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  clientHomePath: '',
  homeHtml: '',
});
const rules = ref<FormRules>({
  siteName: [{ required: true, trigger: 'blur', message: '請填寫網站名稱' }],
});
const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: ['clientHomePath', 'homeHtml'],
  });
  Object.assign(formInline, res.data);
}

function handlerUpdateConfig() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await apiConfig.setConfig({ settings: fotmatSetting(formInline) });
        ElMessage.success('變更歡迎頁設置成功');
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
        <div class="flex items-center gap-4">歡迎頁設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            歡迎頁設置支持配置訪問首頁時的默認顯示內容。可以啟用歡迎頁，或直接跳轉到聊天頁面。
          </div>
          <div>若啟用歡迎頁，可以在此處自定義歡迎頁面內容。</div>
          <div class="mt-2 text-gray-500">
            <strong>推薦：</strong> 您可以在其他專業的 HTML 編輯器（如 VS
            Code、Sublime
            Text）中編輯歡迎頁面內容並複製粘貼到此處，以獲得更好的編輯體驗。
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
          <el-col :xs="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="開啟歡迎頁" prop="clientHomePath">
              <el-switch
                v-model="formInline.clientHomePath"
                :active-value="'/home'"
                :inactive-value="'/chat'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="formInline.clientHomePath === '/home'">
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="歡迎頁（HTML）" prop="homeHtml">
              <el-input
                v-model="formInline.homeHtml"
                placeholder="請輸入自定義歡迎頁內容"
                type="textarea"
                :rows="10"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-col :xs="28" :md="24" :lg="20" :xl="12" style="margin-top: 20px">
          <el-form-item label="預覽">
            <iframe
              class="w-full h-100 border border-gray-200 rounded-md bg-gray-100"
              :srcdoc="formInline.homeHtml"
              sandbox="allow-same-origin allow-scripts"
            ></iframe>
          </el-form-item>
        </el-col>
      </el-form>
    </el-card>
  </div>
</template>
