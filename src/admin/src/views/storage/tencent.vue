<route lang="yaml">
meta:
  title: 騰訊雲cos設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  tencentCosStatus: '',
  cosSecretId: '',
  cosSecretKey: '',
  cosBucket: '',
  cosRegion: '',
  tencentCosAcceleratedDomain: '',
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'cosSecretKey',
      'cosBucket',
      'cosRegion',
      'cosSecretId',
      'tencentCosStatus',
      'tencentCosAcceleratedDomain',
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

const customRules = computed(() => {
  return [
    {
      required: Number(formInline.tencentCosStatus) === 1,
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
        <div class="flex items-center gap-4">騰訊雲COS參數設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            需前往騰訊雲申請對象儲存服務，更多配置及申請詳見<a
              href="https://console.cloud.tencent.com/cos"
              target="_blank"
              >騰訊雲COS</a
            >
            。
          </div>
        </div>
      </template>
      <HButton outline @click="handlerUpdateConfig">
        <SvgIcon name="i-ri:file-text-line" />
        保存設置
      </HButton>
    </PageHeader>

    <el-card style="margin: 20px">
      <el-form ref="formRef" :model="formInline" label-width="120px">
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="啟用狀態" prop="tencentCosStatus">
              <el-switch
                v-model="formInline.tencentCosStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="SecretId"
              prop="cosSecretId"
              :rules="customRules"
            >
              <el-input
                v-model="formInline.cosSecretId"
                placeholder="請填寫SecretId"
                type="password"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="SecretKey"
              prop="cosSecretKey"
              :rules="customRules"
            >
              <el-input
                v-model="formInline.cosSecretKey"
                placeholder="請填寫SecretKey"
                type="password"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="儲存桶名稱"
              prop="cosBucket"
              :rules="customRules"
            >
              <el-input
                v-model="formInline.cosBucket"
                placeholder="請填寫儲存桶名稱"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="所屬地域"
              prop="cosRegion"
              :rules="customRules"
            >
              <el-input
                v-model="formInline.cosRegion"
                placeholder="請填寫所屬地域(ap-guangzhou)"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="全球加速網域名稱"
              prop="tencentCosAcceleratedDomain"
            >
              <el-input
                v-model="formInline.tencentCosAcceleratedDomain"
                placeholder="如您是國外服務器可開啟全球加速網域名稱得到更快響應速度、同理也會更高計費！"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
