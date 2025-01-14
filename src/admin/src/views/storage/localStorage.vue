<route lang="yaml">
meta:
  title: 本地儲存配置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  localStorageStatus: '',
  siteUrl: '',
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: ['localStorageStatus', 'siteUrl'],
  });
  Object.assign(formInline, res.data);
}

const rules = ref<FormRules>({
  siteUrl: [{ required: true, message: '請輸入網站地址', trigger: 'blur' }],
});

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
        <div class="flex items-center gap-4">本地儲存參數設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            開啟後將優先使用本地儲存方式保存數據，有些場景需開啟跨域訪問，可能需額外自行解決讀寫權限問題。
          </div>
          <div>
            文件儲存目錄為 /public/file，更新遷移時請做好數據維護及備份。
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
        :model="formInline"
        label-width="120px"
        :rules="rules"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="啟用狀態" prop="localStorageStatus">
              <el-switch
                v-model="formInline.localStorageStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="網站地址" prop="siteUrl">
              <el-input
                v-model="formInline.siteUrl"
                placeholder="網站地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
