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
  payEcpayStatus: '0', // 確保初始值為字串
  payEcpayMerchantId: '',
  payEcpayHashKey: '',
  payEcpayHashIV: '',  // 使用大寫 IV
  payEcpayNotifyUrl: '',
  payEcpayReturnUrl: '',
  payEcpayChannel: '["credit", "webatm", "cvs"]',
  payEcpayTestMode: '',
});

const rules = ref<FormRules>({
  payEcpayStatus: [
    { required: true, trigger: 'change', message: '請選擇當前支付開啟狀態' },
  ],
  payEcpayMerchantId: [
    { required: true, trigger: 'blur', message: '請填寫商店代號' },
  ],
  payEcpayHashKey: [
    { required: true, trigger: 'blur', message: '請填寫HashKey' },
  ],
  payEcpayHashIV: [
    { required: true, trigger: 'blur', message: '請填寫HashIV' },
  ],
  payEcpayNotifyUrl: [
    { required: true, trigger: 'blur', message: '請填寫付款通知網址' },
  ],
  payEcpayReturnUrl: [
    { required: true, trigger: 'blur', message: '請填寫付款完成返回網址' },
  ],
  payEcpayChannel: [
    { required: true, trigger: 'blur', message: '請設定支付渠道' },
  ],
  payEcpayTestMode: [
    { required: true, trigger: 'change', message: '請選擇測試環境狀態' },
  ],
});

const apiBaseUrl = import.meta.env.VITE_APP_API_BASEURL

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'payEcpayStatus',
      'payEcpayMerchantId',
      'payEcpayHashKey',
      'payEcpayHashIV',
      'payEcpayNotifyUrl',
      'payEcpayReturnUrl',
      'payEcpayChannel',
      'payEcpayTestMode'
    ],
  });
  Object.assign(formInline, res.data);
}

async function handlerUpdateConfig() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await apiConfig.setConfig({
          settings: Object.entries(formInline).map(([key, value]) => ({
            configKey: key,
            configVal: value
          }))
        });
        ElMessage.success('變更配置資訊成功');
        await queryAllconfig();
      } catch (error) {
        ElMessage.error('保存失敗');
      }
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
          <div>綠界支付為臺灣地區主要支付平台,支持多種支付方式。</div>
          <div>
            請確認已申請綠界支付商店，付款通知網址為：https://您的網域名稱/api/pay/notify/ecpay
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
        label-width="140px"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="啟用當前支付" prop="payEcpayStatus">
              <el-switch
                v-model="formInline.payEcpayStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商店代號" prop="payEcpayMerchantId">
              <el-input
                v-model="formInline.payEcpayMerchantId"
                placeholder="請填寫商店代號"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="HashKey" prop="payEcpayHashKey">
              <el-input
                v-model="formInline.payEcpayHashKey"
                placeholder="請填寫HashKey"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="HashIV" prop="payEcpayHashIV">
              <el-input
                v-model="formInline.payEcpayHashIV"
                placeholder="請填寫HashIV"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="付款通知網址" prop="payEcpayNotifyUrl">
              <el-input
                v-model="formInline.payEcpayNotifyUrl"
                placeholder="請填寫付款通知網址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="付款完成返回網址" prop="payEcpayReturnUrl">
              <el-input
                v-model="formInline.payEcpayReturnUrl"
                placeholder="請填寫付款完成返回網址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付渠道" prop="payEcpayChannel">
              <el-input
                v-model="formInline.payEcpayChannel"
                type="textarea"
                :rows="3"
                placeholder="請填寫支付渠道配置,格式為 JSON 數組"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="測試環境" prop="payEcpayTestMode">
              <el-switch
                v-model="formInline.payEcpayTestMode"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <div class="tips">
              <p>使用說明:</p>
              <p>1. 請先至綠界平台申請商店</p>
              <p>2. 請設置前後端網域至綠界商店的網域名單中</p>
              <p>3. 付款通知網址為: {{apiBaseUrl}}/api/pay/notify/ecpay</p>
              <p>4. 支付渠道請填寫JSON數組格式,例如: ["credit","webatm","cvs"]</p>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.tips {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
.tips p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}
</style>
