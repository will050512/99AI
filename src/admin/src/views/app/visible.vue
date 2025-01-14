<route lang="yaml">
meta:
  title: 基礎設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import { QuestionFilled } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  pluginUrl: '',
  pluginKey: '',
  siteRobotName: '',
  pluginFirst: '1',
  isHidePlugin: '0',
});

const rules = ref<FormRules>({
  pluginUrl: [{ required: true, trigger: 'blur', message: '請填寫外掛地址' }],
  pluginKey: [{ required: true, trigger: 'blur', message: '請填寫外掛key' }],
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: ['pluginUrl', 'pluginKey', 'pluginFirst', 'isHidePlugin'],
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
        <div class="flex items-center gap-4">外掛應用基礎配置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            外掛基礎配置，包括外掛地址、外掛 Key、隱藏外掛、外掛優先顯示等。
          </div>
          <div>
            外掛項目<a
              href="https://github.com/vastxie/99AIPlugin"
              target="_blank"
              >開源地址</a
            >
            ，可自行部署，歡迎共同維護。
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
            <el-form-item label="外掛地址" prop="pluginUrl">
              <el-input
                v-model="formInline.pluginUrl"
                placeholder="外掛地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="外掛 Key" prop="pluginKey">
              <el-input
                v-model="formInline.pluginKey"
                placeholder="外掛 Key"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="隱藏外掛" prop="isHidePlugin">
              <el-switch
                v-model="formInline.isHidePlugin"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    <p>開啟後，將隱藏外掛功能</p>
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="外掛優先顯示" prop="pluginFirst">
              <el-switch
                v-model="formInline.pluginFirst"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    <p>開啟後，對話頁默認優先顯示外掛</p>
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
