<route lang="yaml">
meta:
  title: 百度統計
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  baiduCode: '',
  baiduSiteId: '',
  baiduToken: '',
  baiduApiKey: '',
  baiduSecretKey: '',
  baiduRefreshToken: '',
});
const rules = ref<FormRules>({});
const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'baiduCode',
      'baiduSiteId',
      'baiduToken',
      'baiduApiKey',
      'baiduSecretKey',
      'baiduRefreshToken',
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
        <div class="flex items-center gap-4">百度統計設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>百度統計主要用於展示，實際的統計數據將在網站首頁顯示。</div>
          <div>
            為獲取更精確的數據分析，請參考<a
              href="https://tongji.baidu.com/api/manual/Chapter2/openapi.html"
              target="_blank"
              >百度統計介面說明</a
            >，申請專屬於您網站的 siteId 、key 以及 token 等資訊。
          </div>
          <div>
            百度統計提供的是一項免費服務，如果您選擇不使用這項服務，只需將相關設置項留空即可。
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
        label-width="120px"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="siteId" prop="baiduSiteId">
              <el-input
                v-model="formInline.baiduSiteId"
                placeholder="請填寫百度site_id"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="ApiKey" prop="baiduApiKey">
              <el-input
                v-model="formInline.baiduApiKey"
                placeholder="請填寫百度apiKey"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="SecretKey" prop="baiduSecretKey">
              <el-input
                v-model="formInline.baiduSecretKey"
                placeholder="請填寫百度 secretKey"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="AccessToken" prop="baiduToken">
              <el-input
                v-model="formInline.baiduToken"
                placeholder="請填寫百度 access_token"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="RefreshToken" prop="baiduRefreshToken">
              <el-input
                v-model="formInline.baiduRefreshToken"
                placeholder="請填寫百度 refresh_token"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="統計代碼" prop="baiduCode">
              <el-input
                v-model="formInline.baiduCode"
                placeholder="填寫百度統計代碼可統計每日訪問量詳情，如果沒有使用用請查看詳細文檔！"
                type="textarea"
                :rows="12"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
