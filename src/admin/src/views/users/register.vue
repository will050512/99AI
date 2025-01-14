<route lang="yaml">
meta:
  title: 訪問配置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  registerSendStatus: '',
  registerSendModel3Count: '',
  registerSendModel4Count: '',
  registerSendDrawMjCount: '',
  firstRegisterSendStatus: 0,
  firstRegisterSendRank: '',
  firstRregisterSendModel3Count: '',
  firstRregisterSendModel4Count: '',
  firstRregisterSendDrawMjCount: '',
  signInStatus: '',
  signInModel3Count: '',
  signInModel4Count: '',
  signInMjDrawToken: '',
  visitorModel3Num: null,
  visitorModel4Num: null,
  visitorMJNum: null,
});

const rules = ref<FormRules>({
  visitorModel3Num: [
    {
      required: true,
      trigger: 'blur',
      message: '請填寫每日限制的基礎模型積分',
    },
  ],
  visitorModel4Num: [
    {
      required: true,
      trigger: 'blur',
      message: '請填寫每日限制的高級模型積分',
    },
  ],
  visitorMJNum: [
    {
      required: true,
      trigger: 'blur',
      message: '請填寫每日限制的繪畫額度積分',
    },
  ],
  signInStatus: [
    { required: true, trigger: 'blur', message: '請選擇是否開啟簽到獎勵' },
  ],
  signInModel3Count: [
    { required: true, trigger: 'blur', message: '請填寫贈送的基礎模型額度' },
  ],
  signInModel4Count: [
    { required: true, trigger: 'blur', message: '請填寫贈送的高級模型額度' },
  ],
  signInMjDrawToken: [
    { required: true, trigger: 'blur', message: '請填寫贈送的繪畫Token數量' },
  ],

  registerSendStatus: [
    { required: true, trigger: 'change', message: '請確認是否開啟註冊贈送' },
  ],
  firstRegisterSendStatus: [
    {
      required: true,
      trigger: 'change',
      message: '請確認是否開啟優先註冊贈送',
    },
  ],
});
const formRef = ref<FormInstance>();
async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'visitorModel4Num',
      'visitorModel3Num',
      'visitorMJNum',
      'registerSendStatus',
      'registerSendModel3Count',
      'registerSendModel4Count',
      'registerSendDrawMjCount',
      'firstRegisterSendStatus',
      'firstRegisterSendRank',
      'firstRregisterSendModel3Count',
      'firstRregisterSendModel4Count',
      'firstRregisterSendDrawMjCount',
      'signInModel3Count',
      'signInModel4Count',
      'signInMjDrawToken',
      'signInStatus',
    ],
  });
  res.data.firstRegisterSendStatus &&
    (res.data.firstRegisterSendStatus = Number(
      res.data.firstRegisterSendStatus
    ));
  res.data.registerSendStatus &&
    (res.data.registerSendStatus = Number(res.data.registerSendStatus));

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

const firstSendRules = computed(() => {
  return [
    {
      required: formInline.firstRegisterSendStatus,
      message: '開啟優先註冊贈送選項後需填寫此項',
      trigger: 'change',
    },
  ];
});
const registerSendRules = computed(() => {
  return [
    {
      required: formInline.registerSendStatus,
      message: '開啟註冊贈送選項後需填寫此項',
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
        <div class="flex items-center gap-4">基礎訪問設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            註冊與訪問設置支持為新用戶定義默認贈送額度，涵蓋對話次數、普通繪畫次數和高級繪畫次數。
          </div>
          <div>
            系統還為最初註冊的前x名用戶提供額外獎勵，同時允許通過邀請機制為新用戶及邀請者設置特定的獎勵額度。
          </div>
          <div>
            此外，管理員可配置簽到獎勵和為訪客分配可使用的額度，以鼓勵日常活躍和吸引更多用戶體驗平臺。
          </div>
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
        label-width="220px"
      >
        <h5>註冊贈送</h5>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="是否開啟註冊贈送" prop="registerSendStatus">
              <el-switch
                v-model="formInline.registerSendStatus"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="註冊贈送基礎模型對話額度"
              prop="registerSendModel3Count"
            >
              <el-input
                v-model="formInline.registerSendModel3Count"
                placeholder="首次註冊贈基礎模型對話額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="註冊贈送高級模型對話額度"
              prop="registerSendModel4Count"
            >
              <el-input
                v-model="formInline.registerSendModel4Count"
                placeholder="首次註冊贈高級模型對話額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="註冊贈送繪畫額度"
              prop="registerSendDrawMjCount"
            >
              <el-input
                v-model="formInline.registerSendDrawMjCount"
                placeholder="首次註冊贈送MJ額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <h5>限定註冊贈送</h5>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="開啟優先註冊贈送"
              prop="firstRegisterSendStatus"
            >
              <el-switch
                v-model="formInline.firstRegisterSendStatus"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="前多少名獲得獎勵" prop="firstRegisterSendRank">
              <el-input
                v-model="formInline.firstRegisterSendRank"
                placeholder="設置優先註冊前N名可以獲得獎勵"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="優先贈基礎模型送對話額度"
              prop="firstRregisterSendModel3Count"
            >
              <el-input
                v-model="formInline.firstRregisterSendModel3Count"
                placeholder="優先註冊用戶額外贈送基礎模型對話額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="優先贈高級模型送對話額度"
              prop="firstRregisterSendModel4Count"
            >
              <el-input
                v-model="formInline.firstRregisterSendModel4Count"
                placeholder="優先註冊用戶額外贈送高級模型對話額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="優先贈送繪畫額度"
              prop="firstRregisterSendDrawMjCount"
            >
              <el-input
                v-model="formInline.firstRregisterSendDrawMjCount"
                placeholder="優先註冊用戶額外贈送MJ額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <h5>簽到獎勵</h5>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="開啟簽到獎勵" prop="signInStatus">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="如您啟用簽到獎勵、則用戶端則可以通過每日簽到獲取額度！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.signInStatus"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="贈送基礎模型額度" prop="signInModel3Count">
              <el-input
                v-model="formInline.signInModel3Count"
                type="number"
                placeholder="請填寫簽到贈送的基礎模型額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="贈送高級模型額度" prop="signInModel4Count">
              <el-input
                v-model="formInline.signInModel4Count"
                type="number"
                placeholder="請填寫簽到贈送的高級模型額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="贈送繪畫額度" prop="signInMjDrawToken">
              <el-input
                v-model="formInline.signInMjDrawToken"
                type="number"
                placeholder="請填寫簽到贈送繪畫額度"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <h5>訪客設置</h5>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="基礎模型額度" prop="visitorModel3Num">
              <el-input
                v-model="formInline.visitorModel3Num"
                type="number"
                placeholder="請填寫每日限制基礎模型積分"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="高級模型額度" prop="visitorModel4Num">
              <el-input
                v-model="formInline.visitorModel4Num"
                type="number"
                placeholder="請填寫每日限制的高級模型積分"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="繪畫積分額度" prop="visitorMJNum">
              <el-input
                v-model="formInline.visitorMJNum"
                type="number"
                placeholder="請填寫每日限制的繪畫額度積分"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<style>
.tips {
  font-size: 12px;
  color: #7a7474;
  margin-left: 14px;
}
</style>
