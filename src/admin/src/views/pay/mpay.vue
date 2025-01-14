<route lang="yaml">
meta:
  title: 碼支付設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  payMpayStatus: '',
  payMpayPid: '',
  payMpaySecret: '',
  payMpayNotifyUrl: '',
  payMpayReturnUrl: '',
  payMpayApiPayUrl: '',
  payMpayRedirect: '',
  payMpayChannel: [],
});

const rules = ref<FormRules>({
  payMpayStatus: [
    { required: true, trigger: 'change', message: '請選擇當前支付開啟狀態' },
  ],
  payMpaySecret: [
    { required: true, trigger: 'blur', message: '請填寫支付秘鑰' },
  ],
  payMpayPid: [{ required: true, trigger: 'blur', message: '請填寫商戶PID' }],
  payMpayNotifyUrl: [
    { required: true, trigger: 'blur', message: '請填寫支付通知地址' },
  ],
  payMpayApiPayUrl: [
    { required: true, trigger: 'blur', message: '請填寫平臺支付API請求地址' },
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
      'payMpaySecret',
      'payMpayNotifyUrl',
      'payMpayReturnUrl',
      'payMpayPid',
      'payMpayStatus',
      'payMpayApiPayUrl',
      'payMpayRedirect',
      'payMpayChannel',
    ],
  });
  const payMpayChannel = res.data.payMpayChannel
    ? JSON.parse(res.data.payMpayChannel)
    : [];
  Object.assign(formInline, res.data, { payMpayChannel });
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
  if (['payMpayChannel'].includes(key)) {
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
        <div class="flex items-center gap-4">碼支付設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
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
            <el-form-item label="啟用當前支付" prop="payMpayPid">
              <el-switch
                v-model="formInline.payMpayStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶PID" prop="payMpayPid">
              <el-input
                v-model="formInline.payMpayPid"
                placeholder="請填寫商戶PID"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶秘鑰" prop="payMpaySecret">
              <el-input
                v-model="formInline.payMpaySecret"
                placeholder="請填寫商戶秘鑰"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付通知地址" prop="payMpaySecret">
              <el-input
                v-model="formInline.payMpayNotifyUrl"
                placeholder="請填寫支付通知地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付回調地址" prop="payMpaySecret">
              <el-input
                v-model="formInline.payMpayReturnUrl"
                placeholder="請填寫支付成功後的回跳地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付請求地址" prop="payMpayApiPayUrl">
              <el-input
                v-model="formInline.payMpayApiPayUrl"
                placeholder="請填寫平臺支付請求地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />
        <!-- <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12" >
            <el-form-item label="是否開啟跳轉支付" prop="payMpayRedirect" label-width="130px">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="請注意、僅mapi支持不跳轉支付、其他都需要為跳轉支付、不開啟跳轉支付表示購買頁面顯示二維碼直接掃碼購買、跳轉支付表示前往新頁面！"
                placement="right"
              >
              <el-switch
                v-model="formInline.payMpayRedirect"
                active-value="1"
                inactive-value="0"
              />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :xs="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="開啟支付渠道" prop="payMpayChannel">
              <el-checkbox-group
                v-model="formInline.payMpayChannel"
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
