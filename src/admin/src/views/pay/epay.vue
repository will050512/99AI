<route lang="yaml">
meta:
  title: 易支付設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  payEpayStatus: '',
  payEpayPid: '',
  payEpaySecret: '',
  payEpayNotifyUrl: '',
  payEpayReturnUrl: '',
  payEpayApiPayUrl: '',
  payEpayApiQueryUrl: '',
  payEpayRedirect: '',
  payEpayChannel: [],
});

const rules = ref<FormRules>({
  payEpayStatus: [
    { required: true, trigger: 'change', message: '請選擇當前支付開啟狀態' },
  ],
  payEpaySecret: [
    { required: true, trigger: 'blur', message: '請填寫支付秘鑰' },
  ],
  payEpayPid: [{ required: true, trigger: 'blur', message: '請填寫商戶PID' }],
  payEpayNotifyUrl: [
    { required: true, trigger: 'blur', message: '請填寫支付通知地址' },
  ],
  payEpayApiPayUrl: [
    { required: true, trigger: 'blur', message: '請填寫平臺支付API請求地址' },
  ],
  payEpayApiQueryUrl: [
    { required: true, trigger: 'blur', message: '請填寫平臺API商戶查詢地址' },
  ],
});

const formRef = ref<FormInstance>();

const channelList = [
  { label: '微信支付', value: 'wxpay' },
  { label: '支付寶支付', value: 'alipay' },
];

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'payEpaySecret',
      'payEpayNotifyUrl',
      'payEpayReturnUrl',
      'payEpayPid',
      'payEpayStatus',
      'payEpayApiPayUrl',
      'payEpayApiQueryUrl',
      'payEpayRedirect',
      'payEpayChannel',
    ],
  });
  const payEpayChannel = res.data.payEpayChannel
    ? JSON.parse(res.data.payEpayChannel)
    : [];
  Object.assign(formInline, res.data, { payEpayChannel });
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

function formatMenuListConfig(key: string, val: any) {
  if (['payEpayChannel'].includes(key)) {
    if (!val) {
      return [];
    }
    if (val) {
      return JSON.stringify(val);
    }
  } else {
    return val;
  }
}

function fotmatSetting(settings: any) {
  return Object.keys(settings).map((key) => {
    return {
      configKey: key,
      configVal: formatMenuListConfig(key, settings[key]),
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
        <div class="flex items-center gap-4">易支付設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>通用易支付渠道，請按文檔配置即可。</div>
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
            <el-form-item label="啟用當前支付" prop="payEpayPid">
              <el-switch
                v-model="formInline.payEpayStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶PID" prop="payEpayPid">
              <el-input
                v-model="formInline.payEpayPid"
                placeholder="請填寫商戶PID"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶秘鑰" prop="payEpaySecret">
              <el-input
                v-model="formInline.payEpaySecret"
                placeholder="請填寫商戶秘鑰"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付通知地址" prop="payEpaySecret">
              <el-input
                v-model="formInline.payEpayNotifyUrl"
                placeholder="請填寫支付通知地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付回調地址" prop="payEpaySecret">
              <el-input
                v-model="formInline.payEpayReturnUrl"
                placeholder="請填寫支付成功後的回跳地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付請求地址" prop="payEpayApiPayUrl">
              <el-input
                v-model="formInline.payEpayApiPayUrl"
                placeholder="請填寫平臺支付請求地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶查詢地址" prop="payEpayApiQueryUrl">
              <el-input
                v-model="formInline.payEpayApiQueryUrl"
                placeholder="請填寫平臺查詢商戶地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="是否開啟跳轉支付"
              prop="payEpayRedirect"
              label-width="130px"
            >
              <el-tooltip
                class="box-item"
                effect="dark"
                content="請注意、僅mapi支持不跳轉支付、其他都需要為跳轉支付、不開啟跳轉支付表示購買頁面顯示二維碼直接掃碼購買、跳轉支付表示前往新頁面！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.payEpayRedirect"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="開啟支付渠道" prop="payEpayChannel">
              <el-checkbox-group
                v-model="formInline.payEpayChannel"
                size="small"
              >
                <el-checkbox
                  v-for="item in channelList"
                  :key="item.value"
                  border
                  :label="item.value"
                >
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
