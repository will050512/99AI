<route lang="yaml">
meta:
  title: 虎皮椒支付設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  payHupiStatus: '',
  payHupiAppId: '',
  payHupiSecret: '',
  payHupiGatewayUrl: '',
  payHupiNotifyUrl: '',
  payHupiReturnUrl: '',
});

const rules = ref<FormRules>({
  payHupiStatus: [
    { required: true, trigger: 'change', message: '請選擇當前支付開啟狀態' },
  ],
  payHupiSecret: [
    { required: true, trigger: 'blur', message: '請填寫支付秘鑰' },
  ],
  payHupiGatewayUrl: [
    { required: true, trigger: 'blur', message: '請填寫網關' },
  ],
  payHupiAppId: [{ required: true, trigger: 'blur', message: '請填寫Appid' }],
  payHupiNotifyUrl: [
    { required: true, trigger: 'blur', message: '請填寫支付通知地址' },
  ],
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'payHupiSecret',
      'payHupiNotifyUrl',
      'payHupiGatewayUrl',
      'payHupiReturnUrl',
      'payHupiAppId',
      'payHupiStatus',
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
        <div class="flex items-center gap-4">虎皮椒支付設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            <a href="https://www.xunhupay.com/" target="_blank">虎皮椒支付</a>
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
            <el-form-item label="啟用當前支付" prop="payHupiAppId">
              <el-switch
                v-model="formInline.payHupiStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付AppId" prop="payHupiAppId">
              <el-input
                v-model="formInline.payHupiAppId"
                placeholder="請填寫AppId"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付網關地址" prop="payHupiGatewayUrl">
              <el-input
                v-model="formInline.payHupiGatewayUrl"
                placeholder="請填寫支付網關地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="Secret秘鑰" prop="payHupiSecret">
              <el-input
                v-model="formInline.payHupiSecret"
                placeholder="請填寫支付秘鑰"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付通知地址" prop="payHupiSecret">
              <el-input
                v-model="formInline.payHupiNotifyUrl"
                placeholder="請填寫支付通知地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付回調地址" prop="payHupiSecret">
              <el-input
                v-model="formInline.payHupiReturnUrl"
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
