<!-- src/admin/src/views/pay/ecpay.vue -->
<route lang="yaml">
meta:
  title: 綠界支付設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  payEcpayStatus: '0', // 預設關閉
  payEcpayMerchantID: '',
  payEcpayHashKey: '',
  payEcpayHashIV: '',
  payEcpayApiUrl: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', // 預設測試環境API
  payEcpayNotifyUrl: '',
  payEcpayReturnUrl: '',
});

const formRef = ref<FormInstance>();

const rules = ref<FormRules>({
  payEcpayStatus: [
    { required: true, trigger: 'change', message: '請選擇開關狀態' }
  ],
  payEcpayMerchantID: [
    { required: true, trigger: 'blur', message: '請填寫商店代號' }
  ],
  payEcpayHashKey: [
    { required: true, trigger: 'blur', message: '請填寫 HashKey' }
  ],
  payEcpayHashIV: [
    { required: true, trigger: 'blur', message: '請填寫 HashIV' }
  ],
  payEcpayApiUrl: [
    { required: true, trigger: 'blur', message: '請填寫API網址' }
  ],
  payEcpayNotifyUrl: [
    { required: true, trigger: 'blur', message: '請填寫通知回調網址' }
  ],
  payEcpayReturnUrl: [
    { required: true, trigger: 'blur', message: '請填寫返回網址' }
  ]
});

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'payEcpayStatus',
      'payEcpayMerchantID',
      'payEcpayHashKey',
      'payEcpayHashIV',
      'payEcpayApiUrl',
      'payEcpayNotifyUrl',
      'payEcpayReturnUrl',
    ],
  });
  Object.assign(formInline, res.data);
}

function formatSetting(data: Record<string, any>) {
  return Object.keys(data).map((key) => ({
    configKey: key,
    configVal: data[key],
  }));
}

function handlerUpdateConfig() {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await apiConfig.setConfig({ settings: formatSetting(formInline) });
        ElMessage.success('變更配置資訊成功');
      } catch (error) {}
      queryAllconfig();
    } else {
      ElMessage.error('請填寫完整資訊');
    }
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
        <div class="flex items-center gap-4">綠界支付設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            <a href="https://www.ecpay.com.tw/" target="_blank">綠界支付</a>
            為台灣在地化金流服務。
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
            <el-form-item label="開啟綠界支付" prop="payEcpayStatus">
              <el-switch
                v-model="formInline.payEcpayStatus"
                :active-value="'1'"
                :inactive-value="'0'"
                active-text="開啟"
                inactive-text="關閉"
              />
            </el-form-item>

            <el-form-item label="商店代號" prop="payEcpayMerchantID">
              <el-input
                v-model="formInline.payEcpayMerchantID"
                placeholder="請輸入綠界商店代號"
              />
            </el-form-item>

            <el-form-item label="HashKey" prop="payEcpayHashKey">
              <el-input
                v-model="formInline.payEcpayHashKey"
                placeholder="請輸入綠界提供的 HashKey"
              />
            </el-form-item>

            <el-form-item label="HashIV" prop="payEcpayHashIV">
              <el-input
                v-model="formInline.payEcpayHashIV"
                placeholder="請輸入綠界提供的 HashIV"
              />
            </el-form-item>

            <el-form-item label="API網址" prop="payEcpayApiUrl">
              <el-input
                v-model="formInline.payEcpayApiUrl"
                placeholder="例如: https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"
              />
            </el-form-item>

            <el-form-item label="回調通知網址" prop="payEcpayNotifyUrl">
              <el-input
                v-model="formInline.payEcpayNotifyUrl"
                placeholder="例如: https://your-domain.com/api/pay/notify/ecpay"
              />
            </el-form-item>

            <el-form-item label="返回網址" prop="payEcpayReturnUrl">
              <el-input
                v-model="formInline.payEcpayReturnUrl"
                placeholder="例如: https://your-domain.com/pay/result"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
