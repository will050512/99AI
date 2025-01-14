<route lang="yaml">
meta:
  title: 微信設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  wechatRegisterStatus: '',
  wechatSilentLoginStatus: '',
  wechatOfficialName: '',
  wechatOfficialAppId: '',
  wechatOfficialToken: '',
  wechatOfficialAppSecret: '',
  officialSubscribeText: '',
  officialBindAccountText: '',
  officialScanLoginText: '',
  officialAutoReplyText: '',
});

const rules = ref<FormRules>({
  wechatOfficialName: [
    { required: false, trigger: 'blur', message: '請填寫微信公眾號名稱' },
  ],

  wechatOfficialAppId: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫微信公眾號開發配置 AppId',
    },
  ],
  wechatOfficialToken: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫微信公眾號開發配置 Token',
    },
  ],
  wechatOfficialAppSecret: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫微信公眾號開發配置 AppSecret',
    },
  ],
});
const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'wechatOfficialName',
      'wechatOfficialAppId',
      'wechatOfficialToken',
      'wechatOfficialAppSecret',
      'officialSubscribeText',
      'officialBindAccountText',
      'officialScanLoginText',
      'officialAutoReplyText',
      'wechatRegisterStatus',
      'wechatSilentLoginStatus',
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
        <div class="flex items-center gap-4">微信登錄設置[仔細閱讀]</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            系統微信登錄通過關聯公眾號實現[請務必註冊為服務號、個人公眾號沒有二維碼等此類權限]。
          </div>
          <div>
            請前往
            <a href="https://mp.weixin.qq.com/" target="_blank">微信公眾平臺</a>
            ，獲取開發者配置資訊。
          </div>
          <div>
            如果用戶對公眾號發送消息，將會從下面設置的自定義回覆默認資訊。
          </div>
          <div>
            同時別忘記在微信公眾號平臺將自己的 ip/網域名稱
            加入白名單，配置位置為公眾號後臺->基本配置：服務複製參考
            <a href="https://網域名稱/api/official/notify" target="_blank"
              >https://網域名稱/api/official/notify</a
            >
            將網域名稱修改為您的網域名稱。
          </div>
          <div>下方Token對應自己後臺設置的Token，加密秘鑰隨機即可。</div>
          <div>當設置不指定首頁並且配置了微信登錄即可默認打開靜默登錄！</div>
        </div>
      </template>
      <HButton outline text @click="handlerUpdateConfig">
        <SvgIcon name="i-ri:file-text-line" />
        保存設置
      </HButton>
    </PageHeader>

    <el-card style="margin: 20px">
      <el-form
        ref="formRef"
        :rules="rules"
        :model="formInline"
        label-width="170px"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="是否開啟微信登錄註冊"
              prop="wechatRegisterStatus"
            >
              <el-tooltip
                class="box-item"
                effect="dark"
                content="如您啟用微信註冊、則用戶端則可以通過微信掃碼方式註冊或登錄！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.wechatRegisterStatus"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="是否開啟微信靜默"
              prop="wechatSilentLoginStatus"
            >
              <el-tooltip
                class="box-item"
                effect="dark"
                content="如您啟用靜默登錄、則用戶在微信環境打開則直接自動登錄！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.wechatSilentLoginStatus"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="公眾號名稱" prop="wechatOfficialName">
              <el-input
                v-model="formInline.wechatOfficialName"
                placeholder="公眾號名稱"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="Url" prop="wechatOfficialUrl">
              <el-input
                v-model="formInline.wechatOfficialUrl"
                placeholder="公眾號自定義URL https://open.weixin.qq.com，默認無需填寫"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="AppId" prop="wechatOfficialAppId">
              <el-input
                v-model="formInline.wechatOfficialAppId"
                placeholder="公眾號開發資訊 AppId"
                clearable
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="Token" prop="wechatOfficialToken">
              <el-input
                v-model="formInline.wechatOfficialToken"
                placeholder="公眾號Token配置"
                clearable
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="AppSecret" prop="wechatOfficialAppSecret">
              <el-input
                v-model="formInline.wechatOfficialAppSecret"
                placeholder="公眾號開發資訊 AppSecret"
                clearable
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="訂閱公眾號歡迎消息"
              prop="officialSubscribeText"
            >
              <el-input
                v-model="formInline.officialSubscribeText"
                type="textarea"
                :rows="3"
                placeholder="訂閱你的公眾號後對他的歡迎語！"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="綁定賬號回覆消息"
              prop="officialBindAccountText"
            >
              <el-input
                v-model="formInline.officialBindAccountText"
                type="textarea"
                :rows="3"
                placeholder="非微信登錄用戶首次綁定微信的歡迎語"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="掃碼登錄回覆消息" prop="officialScanLoginText">
              <el-input
                v-model="formInline.officialScanLoginText"
                type="textarea"
                :rows="3"
                placeholder="用戶掃碼登錄成功時自動回覆的內容"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="自定義回覆的默認資訊"
              prop="officialAutoReplyText"
            >
              <el-input
                v-model="formInline.officialAutoReplyText"
                type="textarea"
                :rows="3"
                placeholder="當用戶對公眾號發了消息不在自動回覆列表時回覆的兜底內容"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
