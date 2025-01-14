<route lang="yaml">
meta:
  title: 百度雲敏感詞設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  baiduTextStatus: '',
  baiduTextApiKey: '',
  baiduTextSecretKey: '',
});

const rules = ref<FormRules>({
  baiduTextStatus: [
    { required: true, trigger: 'blur', message: '請選擇是否啟用百度文本審核' },
  ],
  baiduTextSecretKey: [
    { required: true, trigger: 'blur', message: '請填寫百度文本審核SecretKey' },
  ],
  baiduTextApiKey: [
    { required: true, trigger: 'blur', message: '請填寫百度文本審核APIKey' },
  ],
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: ['baiduTextStatus', 'baiduTextSecretKey', 'baiduTextApiKey'],
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
        <div class="flex items-center gap-4">百度文本審核參數設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            當前百度雲免費5萬條，可查看<a
              href="https://console.bce.baidu.com/ai/#/ai/antiporn/overview/index"
              target="_blank"
              >使用文檔</a
            >，如果百度雲敏感詞與自定義敏感詞都配置的情況，會先檢測百度雲後檢測自定義的敏感詞。
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
            <el-form-item label="開啟此敏感詞設置" prop="baiduTextStatus">
              <el-tooltip
                content="開啟將打開敏感詞檢測、如果同時開啟其他敏感詞將會通過菜單順序僅同時開啟一個！"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.baiduTextStatus"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="文本審核ApiKey" prop="baiduTextApiKey">
              <el-input
                v-model="formInline.baiduTextApiKey"
                placeholder="請填寫百度文本審核ApiKey"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="文本審核SecretKey" prop="baiduTextSecretKey">
              <el-input
                v-model="formInline.baiduTextSecretKey"
                placeholder="請填寫百度文本審核SecretKey"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
