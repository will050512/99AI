<route lang="yaml">
meta:
  title: 介面請求設置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import { QuestionFilled } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  openaiBaseUrl: '',
  openaiBaseKey: '',
  openaiTimeout: '',
  openaiBaseModel: 'gpt-4o-mini',
  openaiTemperature: 1,
  isGeneratePromptReference: 0,
  mjNotSaveImg: 0,
  mjProxyImgUrl: '',
  systemPreMessage: '',
  mjNotUseProxy: 1,
  isMjTranslate: 0,
  mjTranslatePrompt: '',
  isDalleChat: 1,
  isModelInherited: 1,
  openaiVoice: '',
  isConvertToBase64: 0,
});

type VoiceOption = { label: string; value: string };
const voiceOptions = ref<VoiceOption[]>([
  { label: 'Alloy', value: 'alloy' },
  { label: 'Echo', value: 'echo' },
  { label: 'Fable', value: 'fable' },
  { label: 'Onyx', value: 'onyx' },
  { label: 'Nova', value: 'nova' },
  { label: 'Shimmer', value: 'shimmer' },
]);

const rules = ref<FormRules>({
  openaiBaseUrl: [
    { required: false, trigger: 'blur', message: '請填寫openai的請求地址' },
  ],
  isMjTranslate: [
    { required: false, trigger: 'blur', message: '是否開啟翻譯/聯想' },
  ],
  isGeneratePromptReference: [
    { required: false, trigger: 'blur', message: '是否生成提示詞參考' },
  ],
  isDalleChat: [
    { required: false, trigger: 'blur', message: '是否開啟連續繪畫' },
  ],
  isModelInherited: [
    { required: false, trigger: 'blur', message: '是否繼承模型' },
  ],
  openaiTimeout: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫openai的超時時間（單位ms）',
    },
  ],
  openaiBaseModel: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫全局模型，用於後臺一些靜默性賦能操作',
    },
  ],
  openaiTemperature: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫溫度',
    },
  ],
  mjTranslatePrompt: [
    {
      required: false,
      trigger: 'blur',
      message: '用於翻譯 / 聯想的提示詞',
    },
  ],
  openaiVoice: [
    {
      required: false,
      trigger: 'blur',
      message: '請填寫openai的語音音色',
    },
  ],
  isConvertToBase64: [
    {
      required: false,
      trigger: 'blur',
      message: '是否轉換為base64',
    },
  ],
});
const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'openaiBaseUrl',
      'openaiBaseKey',
      'openaiTimeout',
      'openaiBaseModel',
      'openaiTemperature',
      'mjNotSaveImg',
      'mjProxyImgUrl',
      'systemPreMessage',
      'mjNotUseProxy',
      'isMjTranslate',
      'isGeneratePromptReference',
      'mjTranslatePrompt',
      'isDalleChat',
      'isModelInherited',
      'openaiVoice',
      'isConvertToBase64',
    ],
  });
  const {
    openaiBaseUrl = '',
    openaiBaseKey = '',
    openaiTimeout = 300,
    openaiBaseModel = 'gpt-4o-mini',
    openaiTemperature = 1,
    isMjTranslate = '',
    isGeneratePromptReference = 0,
    // openaiaAtoDowngrade,
    mjNotSaveImg,
    mjProxyImgUrl,
    systemPreMessage,
    mjNotUseProxy,
    mjTranslatePrompt,
    isDalleChat,
    isModelInherited,
    openaiVoice,
    isConvertToBase64,
  } = res.data;
  Object.assign(formInline, {
    openaiBaseUrl,
    openaiBaseKey,
    openaiTimeout,
    isMjTranslate,
    isGeneratePromptReference,
    openaiTemperature,
    // openaiaAtoDowngrade: Number(openaiaAtoDowngrade),
    openaiBaseModel,
    mjNotSaveImg,
    mjProxyImgUrl,
    systemPreMessage,
    mjNotUseProxy,
    mjTranslatePrompt,
    isDalleChat,
    isModelInherited,
    openaiVoice,
    isConvertToBase64,
  });
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
        <div class="flex items-center gap-4">全局參數設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            系統默認的請求地址是
            <a href="https://api.openai.com" target="_blank"
              >https://api.openai.com</a
            >，國內服務器可能無法訪問，需使用自己的代理或中轉。
          </div>
          <div>
            此處配置為全局配置，一些系統內置的自動服務會使用到該模型。另外，當模型不配置
            Key 以及 Url 時，會使用全局配置。
          </div>
          <div>
            API 中轉推薦
            <a
              href="https://api.lightai.io"
              target="_blank"
              style="margin-right: 10px"
              >https://api.lightai.io</a
            >，支持OpenAI，Midjourney
            以及多種國內外模型，無強制綁定關係，可按需選擇。
          </div>
        </div>
      </template>
      <HButton text outline @click="handlerUpdateConfig">
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
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="請求地址"
              prop="openaiBaseUrl"
              label-width="120px"
            >
              <el-input
                v-model="formInline.openaiBaseUrl"
                placeholder="默認地址: https://api.openai.com 第三方代理推薦：https://api.lightai.io"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="全局key"
              prop="openaiBaseKey"
              label-width="120px"
            >
              <el-input
                v-model="formInline.openaiBaseKey"
                placeholder="請填寫模型全局 Key 資訊，當模型 Key 為空時調用"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="全局模型"
              prop="openaiBaseModel"
              label-width="120px"
            >
              <el-input
                v-model="formInline.openaiBaseModel"
                placeholder="全局模型配置，用於後臺一些靜默賦能操作"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="繼承對話模型"
              prop="isModelInherited"
              label-width="120"
            >
              <el-switch
                v-model="formInline.isModelInherited"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    <p>開啟後、對話模型將會繼承上一次對話的模型、默認開啟</p>
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="base64 識圖"
              prop="isConvertToBase64"
              label-width="120"
            >
              <el-switch
                v-model="formInline.isConvertToBase64"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    <p>
                      開啟後，識圖時將使用 base64 格式，對於本地/儲存桶 鏈接 API
                      端無法訪問時建議開啟
                    </p>
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="生成提問建議"
              prop="isGeneratePromptReference"
              label-width="120"
            >
              <el-switch
                v-model="formInline.isGeneratePromptReference"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    <p>開啟後，將使用全局模型在每次對話後，生成提問建議</p>
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="連續繪畫" prop="isDalleChat" label-width="120">
              <el-switch
                v-model="formInline.isDalleChat"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    開啟連續繪畫會在使用 Dalle
                    繪圖的時候,調用全局模型,根據上文總結繪畫要求
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="提示詞優化"
              prop="isMjTranslate"
              label-width="120"
            >
              <el-switch
                v-model="formInline.isMjTranslate"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    開啟優化後, MJ 提示詞默認會使用全局模型進行翻譯/聯想,
                    不再單獨扣費, 一般中轉會自帶翻譯, 請根據實際情況選擇。
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="[1].includes(Number(formInline.isMjTranslate))">
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="優化提示詞"
              prop="mjTranslatePrompt"
              label-width="120px"
            >
              <el-input
                type="textarea"
                :rows="5"
                v-model="formInline.mjTranslatePrompt"
                placeholder="Midjourney 翻譯/聯想提示詞"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="不儲存圖片"
              prop="mjNotSaveImg"
              label-width="120"
            >
              <el-switch
                v-model="formInline.mjNotSaveImg"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    默認會儲存圖片到配置的儲存中、如果開啟此選擇則表示不保存原圖到我們配置的儲存上、直接反代訪問原始圖片、這樣可以進一步節省空間、但訪問速度及穩定性可能有所降低！
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="不使用代理"
              prop="mjNotUseProxy"
              label-width="120"
            >
              <el-switch
                v-model="formInline.mjNotUseProxy"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px">
                    開啟不使用代理將直接使用重中轉獲取到的鏈接、原生discord地址國內無法訪問!
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="[0].includes(Number(formInline.mjNotUseProxy))">
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="反代地址"
              prop="mjProxyImgUrl"
              label-width="120px"
            >
              <el-input
                v-model="formInline.mjProxyImgUrl"
                placeholder="Midjourney 反代地址，為空將直接使用原鏈接"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="Temperature"
              prop="openaiTemperature"
              label-width="120px"
            >
              <el-input-number
                v-model="formInline.openaiTemperature"
                controls-position="right"
                :min="0"
                :max="2"
                :step="0.1"
                placeholder="模型 Temperature 設置，默認1"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="TTS 音色"
              prop="openaiVoice"
              label-width="120px"
            >
              <el-select
                v-model="formInline.openaiVoice"
                placeholder="選擇或輸入 openai 語音合成的默認發音人"
                clearable
                filterable
                allow-create
              >
                <!-- 預定義選項 -->
                <el-option
                  v-for="voice in voiceOptions"
                  :key="voice.value"
                  :label="voice.label"
                  :value="voice.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="超時時間"
              prop="openaiTimeout"
              label-width="120px"
            >
              <el-input
                v-model="formInline.openaiTimeout"
                placeholder="openai超時時間設置、默認300s 單位：秒（s）"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="全局頭部預設"
              prop="systemPreMessage"
              label-width="120px"
            >
              <el-input
                v-model="formInline.systemPreMessage"
                type="textarea"
                :rows="8"
                placeholder="請填寫模型全局頭部預設資訊！"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item
              label="是否自動降級"
              prop="openaiaAtoDowngrade"
              label-width="120"
            >
              <el-tooltip
                class="box-item"
                effect="dark"
                content="開啟自動降級後、如果用戶沒有4的權限、將會自動降級為基礎模型、並扣除3的餘額！"
                placement="right"
              >
                <el-switch
                  v-model="formInline.openaiaAtoDowngrade"
                  :active-value="1"
                  :inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row> -->
        <!-- <el-divider /> -->
      </el-form>
    </el-card>
  </div>
</template>
