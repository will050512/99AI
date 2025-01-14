<route lang="yaml">
meta:
  title: Chevereto圖床設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  cheveretoStatus: '',
  cheveretoUploadPath: '',
  cheveretoKey: '',
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: ['cheveretoKey', 'cheveretoUploadPath', 'cheveretoStatus'],
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

const customRules = computed(() => {
  return [
    {
      required: Number(formInline.cheveretoStatus) === 1,
      message: '開啟配置後請填寫此項',
      trigger: 'change',
    },
  ];
});

onMounted(() => {
  queryAllconfig();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">Chevereto圖床設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            詳細搭建及配置請參考
            <a
              href="https://v4-docs.chevereto.com/developer/api/api-v1.html"
              target="_blank"
              >Chevereto圖床文檔</a
            >
            。如果同時開啟多個儲存服務，騰訊雲、阿里雲優先級高於 Chevereto
            圖床。
          </div>
        </div>
      </template>
      <HButton outline @click="handlerUpdateConfig">
        <SvgIcon name="i-ri:file-text-line" />
        保存設置
      </HButton>
    </PageHeader>

    <el-card style="margin: 20px">
      <template #header>
        <div class="flex justify-between">
          <b>chevereto圖床參數設置</b>
          <el-button class="button" text @click="handlerUpdateConfig">
            保存設置
          </el-button>
        </div>
      </template>
      <el-form ref="formRef" :model="formInline" label-width="100px">
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="服務啟用狀態" prop="cheveretoStatus">
              <el-switch
                v-model="formInline.cheveretoStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="上傳地址"
              prop="cheveretoUploadPath"
              :rules="customRules"
            >
              <el-input
                v-model="formInline.cheveretoUploadPath"
                placeholder="請填寫您的圖床上傳地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="ApiKey"
              prop="cheveretoKey"
              :rules="customRules"
            >
              <el-input
                v-model="formInline.cheveretoKey"
                placeholder="請填寫ApiKey"
                clearable
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
