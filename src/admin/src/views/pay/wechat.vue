<route lang="yaml">
meta:
  title: 官方微信支付設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  payWechatStatus: '',
  payWeChatMchId: '',
  payWeChatAppId: '',
  payWeChatSecret: '',
  payWeChatNotifyUrl: '',
  payWeChatPublicKey: '',
  payWeChatPrivateKey: '',
});

const rules = ref<FormRules>({
  payWechatStatus: [
    { required: true, trigger: 'change', message: '請選擇當前支付開啟狀態' },
  ],
  payWeChatSecret: [
    { required: true, trigger: 'blur', message: '請填寫支付Secret秘鑰' },
  ],
  payWeChatMchId: [
    { required: true, trigger: 'blur', message: '請填寫商戶號' },
  ],
  payWeChatAppId: [{ required: true, trigger: 'blur', message: '請填寫AppId' }],
  payWeChatNotifyUrl: [
    { required: true, trigger: 'blur', message: '請填寫支付通知地址' },
  ],
  payWeChatPublicKey: [
    {
      required: true,
      trigger: 'blur',
      message: '請填寫支付公鑰資訊（cert.pem文件）',
    },
  ],
  payWeChatPrivateKey: [
    {
      required: true,
      trigger: 'blur',
      message: '請填寫支付私鑰地址（key.pem文件）',
    },
  ],
});

const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'payWeChatSecret',
      'payWeChatNotifyUrl',
      'payWeChatAppId',
      'payWechatStatus',
      'payWeChatMchId',
      'payWeChatPublicKey',
      'payWeChatPrivateKey',
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
        <div class="flex items-center gap-4">微信支付設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            同時開啟多個支付，將以微信支付作為最高優先級，在pc端會調用 native
            支付，在微信環境內將調用 Jsapi 支付。
          </div>
          <div>
            請確認微信支付已經申請了支付權限，支付通知地址為：
            https://您的網域名稱/api/pay/notify。
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
            <el-form-item label="啟用當前支付" prop="payWechatStatus">
              <el-switch
                v-model="formInline.payWechatStatus"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶ID" prop="payWeChatMchId">
              <el-input
                v-model="formInline.payWeChatMchId"
                placeholder="請填寫商戶ID"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="AppId" prop="payWeChatAppId">
              <el-input
                v-model="formInline.payWeChatAppId"
                placeholder="請填寫AppId"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="商戶秘鑰" prop="payWeChatSecret">
              <el-input
                v-model="formInline.payWeChatSecret"
                placeholder="請填寫Secret秘鑰"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="支付通知地址" prop="payWeChatNotifyUrl">
              <el-input
                v-model="formInline.payWeChatNotifyUrl"
                placeholder="請填寫支付通知地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="公鑰地址" prop="payWeChatPublicKey">
              <el-input
                v-model="formInline.payWeChatPublicKey"
                type="textarea"
                :rows="6"
                placeholder="請填寫支付公鑰資訊（cert.pem文件）"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="私鑰地址" prop="payWeChatPrivateKey">
              <el-input
                v-model="formInline.payWeChatPrivateKey"
                type="textarea"
                :rows="6"
                placeholder="請填寫支付私鑰地址（key.pem文件）"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
