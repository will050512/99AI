<route lang="yaml">
meta:
  title: 藍兔支付設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  payLtzfStatus: '',
  payLtzfMchId: '',
  payLtzfSecret: '',
  payLtzfNotifyUrl: '',
  payLtzfReturnUrl: '',
});

const rules = ref<FormRules>({
  payLtzfStatus: [
    { required: true, trigger: 'change', message: '請選擇當前支付開啟狀態' },
  ],
  payLtzfSecret: [
    { required: true, trigger: 'blur', message: '請填寫商戶秘鑰' },
  ],
  payLtzfMchId: [{ required: true, trigger: 'blur', message: '請填寫商戶號' }],
  payLtzfNotifyUrl: [
    { required: true, trigger: 'blur', message: '請填寫支付通知地址' },
  ],
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'payLtzfSecret',
      'payLtzfNotifyUrl',
      'payLtzfReturnUrl',
      'payLtzfMchId',
      'payLtzfStatus',
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
        <div class="flex items-center gap-4">藍兔支付設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            <a href="https://www.ltzf.cn/" target="_blank">藍兔支付</a>
            為第三方支付，接入請購買微信渠道。
          </div>
          <div>支付通知地址為： https://您的網域名稱/api/pay/notify。</div>
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
            <el-form-item label="啟用當前支付" prop="payLtzfMchId">
              <el-switch
                v-model="formInline.payLtzfStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶號" prop="payLtzfMchId">
              <el-input
                v-model="formInline.payLtzfMchId"
                placeholder="請填寫商戶號"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶密鑰" prop="payLtzfSecret">
              <el-input
                v-model="formInline.payLtzfSecret"
                placeholder="請填寫商戶秘鑰"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付通知地址" prop="payLtzfSecret">
              <el-input
                v-model="formInline.payLtzfNotifyUrl"
                placeholder="請填寫支付通知地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付回調地址" prop="payLtzfSecret">
              <el-input
                v-model="formInline.payLtzfReturnUrl"
                placeholder="請填寫支付成功後的回跳地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
