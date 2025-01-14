<route lang="yaml">
meta:
  title: 模型列表
</route>

<script lang="ts" setup>
import ApiModels from '@/api/modules/models';
import { utcToShanghaiTime } from '@/utils/utcformatTime';
import { Plus, QuestionFilled, Refresh } from '@element-plus/icons-vue';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive } from 'vue';

import {
  DEDUCTTYPELIST,
  MODEL_LIST,
  MODELSMAPLIST,
  MODELTYPELIST,
  MODELTYPEMAP,
  // ModelTypeLabelMap,
  QUESTION_STATUS_OPTIONS,
} from '@/constants/index';
import axios from 'axios';

const formBlukRef = ref<FormInstance>();
const formRef = ref<FormInstance>();
const total = ref(0);
const visible = ref(false);
const loading = ref(false);
const modelLoading = ref(false);
const bulkVisible = ref(false);

const formInline = reactive({
  keyType: '',
  model: '',
  status: null,
  page: 1,
  size: 10,
});

const formPackageRef = ref<FormInstance>();
const activeModelKeyId = ref(0);
const formPackage = reactive({
  keyType: 1,
  modelName: '',
  key: '',
  modelAvatar: '',
  // secret: null,
  status: true,
  model: '',
  // isDraw: false,
  isTokenBased: false,
  tokenFeeRatio: 1000,
  // keyWeight: 1,
  modelOrder: 0,
  maxModelTokens: 8000,
  // maxResponseTokens: 2000,
  proxyUrl: '',
  timeout: 300,
  deduct: 1,
  deductType: 1,
  maxRounds: 12,
  isFileUpload: 0,
  modelLimits: 50,
  modelDescription: '',
});

// const uploadUrl = ref(`${import.meta.env.VITE_APP_API_BASEURL}/upload/file`);
const uploadUrl = ref(
  `${import.meta.env.VITE_APP_API_BASEURL}/upload/file?dir=${encodeURIComponent(
    'system/models'
  )}`
);

const rules = reactive<FormRules>({
  keyType: [{ required: true, message: '請選擇調用模型類型', trigger: 'blur' }],
  modelName: [
    { required: true, message: '請填寫您的模型名稱', trigger: 'blur' },
  ],
  key: [{ required: false, message: '請填寫您的調用模型key', trigger: 'blur' }],
  // secret: [
  //   { required: true, message: '請填寫您的調用模型的secret', trigger: 'blur' },
  // ],
  status: [
    { required: true, message: '請選擇key的啟用狀態', trigger: 'change' },
  ],
  // isDraw: [
  //   {
  //     required: true,
  //     message: '請選擇當前key是否作為基礎繪畫key',
  //     trigger: 'change',
  //   },
  // ],
  isFileUpload: [
    {
      required: false,
      message: '請選擇當前模型是否開啟文件上傳及支持種類',
      trigger: 'change',
    },
  ],
  isTokenBased: [
    {
      required: true,
      message: '請選擇當前key是否基於token計費',
      trigger: 'change',
    },
  ],
  tokenFeeRatio: [
    { required: false, message: 'token計費比例', trigger: 'change' },
  ],
  model: [
    {
      required: true,
      message: '請選擇當前key需要綁定的模型',
      trigger: 'change',
    },
  ],
  modelOrder: [
    { required: true, message: '請填寫當前模型排序', trigger: 'blur' },
  ],

  // keyWeight: [
  //   { required: true, message: '請填寫key的權重值', trigger: 'blur' },
  // ],
  maxModelTokens: [
    { required: true, message: '請填寫模型最大token數', trigger: 'blur' },
  ],
  // maxResponseTokens: [
  //   {
  //     required: true,
  //     message: '請填寫允許用戶使用的最大回復token數',
  //     trigger: 'blur',
  //   },
  // ],
  proxyUrl: [
    { required: false, message: '請填寫指定代理地址', trigger: 'blur' },
  ],
  modelAvatar: [
    {
      required: false,
      message: '請填寫AI模型使用的頭像, 不填寫使用系統默認',
      trigger: 'blur',
    },
  ],
  timeout: [
    {
      required: true,
      message: '請填寫超時時間 默認 60 單位（秒）',
      trigger: 'blur',
    },
  ],
  deductType: [
    { required: true, message: '請選擇當前模型扣費類型', trigger: 'change' },
  ],
  deduct: [
    {
      required: true,
      message: '請填寫當前模型扣費金額（需要是正整數）',
      trigger: 'blur',
    },
  ],
  maxRounds: [
    {
      required: true,
      message: '請填寫允許用戶選擇的最大上下文輪次',
      trigger: 'blur',
    },
  ],
  modelLimits: [
    {
      required: true,
      message: '請填寫模型調用頻率限制',
      trigger: 'blur',
    },
  ],
  modelDescription: [
    {
      required: false,
      message: '請填寫模型描述',
      trigger: 'blur',
    },
  ],
});

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activeModelKeyId.value = 0;
  formEl?.resetFields();
}

const modelList = computed(
  () => MODELSMAPLIST[formPackage.keyType as keyof typeof MODELSMAPLIST]
);

const dialogTitle = computed(() => {
  return activeModelKeyId.value ? '修改模型' : '新增模型';
});

// const labelKeyName = computed(() => ModelTypeLabelMap[formPackage.keyType]);

const dialogButton = computed(() => {
  return activeModelKeyId.value ? '確認更新' : '確認新增';
});

const tableData = ref([]);

async function queryModelsList() {
  try {
    loading.value = true;
    const res = await ApiModels.queryModels(formInline);
    loading.value = false;
    const { rows, count } = res.data;
    total.value = count;
    tableData.value = rows;
  } catch (error) {
    loading.value = false;
  }
}

async function handleDeleteKey(row: any) {
  const { id } = row;
  await ApiModels.delModels({ id });
  ElMessage({ type: 'success', message: '操作完成！' });
  queryModelsList();
}

function handleEditKey(row: any) {
  activeModelKeyId.value = row.id;
  const {
    keyType,
    modelName,
    key,
    // secret,
    status,
    model,
    // keyWeight,
    modelOrder,
    maxModelTokens,
    // maxResponseTokens,
    proxyUrl,
    timeout,
    deductType,
    deduct,
    maxRounds,
    modelAvatar,
    // isDraw,
    isTokenBased,
    tokenFeeRatio,
    isFileUpload,
    modelLimits,
    modelDescription,
  } = row;
  nextTick(() => {
    Object.assign(formPackage, {
      keyType,
      modelName,
      key,
      // secret,
      status,
      model,
      // keyWeight,
      modelOrder,
      maxModelTokens,
      // maxResponseTokens,
      proxyUrl,
      timeout,
      deductType,
      deduct,
      maxRounds,
      modelAvatar,
      // isDraw,
      isTokenBased,
      tokenFeeRatio,
      isFileUpload,
      modelLimits,
      modelDescription,
    });
  });
  visible.value = true;
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  queryModelsList();
}

async function reuploadModelAvatar() {
  if (formPackage.modelAvatar) {
    const file = await downloadFile(formPackage.modelAvatar);
    uploadFile(file, handleAvatarSuccess);
  }
}

function uploadFile(file: any, successHandler: any) {
  const form = new FormData();
  form.append('file', file);

  axios
    .post(uploadUrl.value, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => {
      successHandler(response.data);
    })
    .catch((error) => {
      console.error('上傳失敗', error);
    });
}

async function downloadFile(url: string) {
  const response = await axios.get(url, { responseType: 'blob' });
  let fileName = 'downloaded_file';

  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const matches = /filename="([^"]+)"/.exec(contentDisposition);
    if (matches != null && matches[1]) {
      fileName = matches[1];
    }
  } else {
    fileName = getFileNameFromUrl(url);
  }

  return new File([response.data], fileName, { type: response.data.type });
}

function getFileNameFromUrl(url: string | URL) {
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname;
  return pathname.substring(pathname.lastIndexOf('/') + 1);
}

async function handlerSubmit(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (valid) {
      const params: any = JSON.parse(JSON.stringify(formPackage));
      delete params.id;
      activeModelKeyId.value && (params.id = activeModelKeyId.value);
      if (Number(formPackage.keyType) === 1) {
        const key = JSON.parse(JSON.stringify(formPackage.key));
        const formatKeyArr = key.split('\n');
        params.key = formatKeyArr;
      }
      await ApiModels.setModels(params);
      ElMessage({ type: 'success', message: '操作成功！' });
      activeModelKeyId.value = 0;
      visible.value = false;
      queryModelsList();
    }
  });
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log('response: ', response.data);
  formPackage.modelAvatar = response.data;
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('當前系統僅支持 PNG、JPEG、GIF 和 WebP 格式的圖片!');
    return false;
  } else if (rawFile.size / 1024 > 300) {
    ElMessage.error('當前限制文件最大不超過 300KB!');
    return false;
  }
};

onMounted(() => {
  queryModelsList();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">模型配置說明</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>模型分為（基礎對話｜創意模型｜特殊模型三類）。</div>
          <div>
            基礎對話：用戶可以在用戶端選擇的模型，用於對話、問答、聊天等功能，僅支持
            OpenAI Chat 格式，其他模型需自行使用分發程式適配。
          </div>
          <div>
            創意模型：用戶端不展示，包含【Midjourney 繪圖】【Dalle 繪圖】【SDXL
            繪圖】【Suno音樂】，用於外掛調用。
          </div>
          <div>
            其中，其中 Midjourney 對接 Midjourney-Proxy-Plus
            格式，SDXL、LumaVideo 及 SunoMusic 適配
            <a href="https://api.openai.com" target="_blank">LightAi API</a>
            格式。
          </div>
          <div>特殊模型：用戶端不展示，包含【TTS朗讀】【GPTs】。</div>
        </div>
      </template>
      <HButton outline type="success" @click="visible = true">
        <SvgIcon name="i-ri:file-text-line" />
        添加模型
      </HButton>
    </PageHeader>
    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="模型類型" prop="model">
          <el-select
            v-model="formInline.keyType"
            filterable
            allow-create
            placeholder="請選擇或填寫綁定的模型"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in MODELTYPELIST"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="使用模型" prop="model">
          <el-select
            v-model="formInline.model"
            filterable
            allow-create
            placeholder="請選擇或填寫綁定的模型"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in MODEL_LIST"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="啟用狀態" prop="status">
          <el-select
            v-model="formInline.status"
            placeholder="請選擇key啟用狀態"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in QUESTION_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryModelsList"> 查詢 </el-button>
          <el-button @click="handlerReset(formRef)"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </page-main>
    <page-main style="width: 100%">
      <el-table
        v-loading="loading"
        border
        :data="tableData"
        style="width: 100%"
        size="large"
      >
        <el-table-column prop="keyType" label="模型類型" width="120">
          <template #default="scope">
            <el-tag type="success">
              {{ MODELTYPEMAP[scope.row.keyType as keyof typeof MODELTYPEMAP] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="modelOrder"
          label="模型排序"
          width="90"
          align="center"
        />
        <el-table-column
          prop="modelLimits"
          label="頻率限制"
          width="90"
          align="center"
        />
        <el-table-column prop="modelName" label="模型名稱" width="180" />
        <el-table-column
          prop="status"
          align="center"
          label="啟用狀態"
          width="90"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '使用中' : '已暫停' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="模型KEY" width="460">
          <template #default="scope">
            <div class="w-full overflow-y-scroll whitespace-nowrap">
              {{ scope.row.key }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="model"
          align="center"
          label="綁定模型"
          width="180"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.model.includes('gpt-4') ? 'success' : 'info'"
            >
              {{ scope.row.model }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="isTokenBased"
          align="center"
          label="Token計費"
          width="120"
        >
          <template #default="scope">
            <el-tag :type="scope.row.isTokenBased ? 'success' : 'danger'">
              {{ scope.row.isTokenBased ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="deductType"
          align="center"
          label="扣費類型"
          width="90"
        >
          <template #default="scope">
            <el-tag
              :type="
                scope.row.deductType === 1
                  ? 'success'
                  : scope.row.deductType === 2
                  ? 'warning'
                  : 'info'
              "
            >
              {{
                scope.row.deductType === 1
                  ? '普通積分'
                  : scope.row.deductType === 2
                  ? '高級積分'
                  : '繪畫積分'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="deduct"
          align="center"
          label="單次扣除"
          width="90"
        >
          <template #default="scope">
            <el-tag :type="scope.row.deductType === 1 ? 'success' : 'warning'">
              {{ `${scope.row.deduct} 積分` }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="useCount"
          align="center"
          label="調用次數"
          width="90"
        />
        <el-table-column
          prop="useToken"
          align="center"
          label="已使用Token"
          width="120"
        />
        <el-table-column
          prop="keyStatus"
          align="center"
          label="key狀態"
          width="110"
        >
          <template #default="scope">
            <el-tag :type="scope.row.keyStatus === 1 ? 'success' : 'danger'">
              {{
                scope.row.keyStatus === 1
                  ? '正常工作'
                  : scope.row.keyStatus === -1
                  ? '已被封禁'
                  : '餘額耗盡 '
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="maxModelTokens"
          align="center"
          label="模型最大上下文"
          width="140"
        >
          <template #default="scope">
            <el-button type="info" text>
              {{ scope.row.maxModelTokens || '-' }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          prop="proxyUrl"
          align="center"
          label="綁定的代理地址"
          width="140"
        >
          <template #default="scope">
            <el-button type="info" text>
              {{ scope.row.proxyUrl || '-' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="proxyUrl"
          align="center"
          label="變更提示資訊"
          width="180"
        >
          <template #default="scope">
            {{ scope.row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          align="center"
          label="添加時間"
          width="120"
        >
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEditKey(scope.row)"
            >
              變更
            </el-button>
            <el-popconfirm
              title="確認刪除此秘鑰麼?"
              width="180"
              icon-color="red"
              @confirm="handleDeleteKey(scope.row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">
                  刪除秘鑰
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-row class="mt-5 flex justify-end">
        <el-pagination
          v-model:current-page="formInline.page"
          v-model:page-size="formInline.size"
          class="mr-5"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="queryModelsList"
          @current-change="queryModelsList"
        />
      </el-row>
    </page-main>

    <el-dialog
      v-model="visible"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="770"
      class="max-h-[90vh] overflow-y-auto rounded-md p-4"
      @close="handlerCloseDialog(formPackageRef)"
    >
      <el-form
        ref="formPackageRef"
        v-loading="modelLoading"
        label-position="right"
        label-width="120px"
        :model="formPackage"
        :rules="rules"
      >
        <el-form-item label="模型類型選擇" prop="keyType">
          <el-select
            v-model="formPackage.keyType"
            placeholder="請選擇模型類型"
            style="width: 100%"
          >
            <el-option
              v-for="item in MODELTYPELIST"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="[1].includes(Number(formPackage.keyType))"
          label="用戶端顯示"
          prop="status"
        >
          <el-switch v-model="formPackage.status" />
          <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                關閉將在用戶端隱藏此模型、但不會影響後臺的調用
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="模型顯示名稱" prop="modelName">
          <el-input
            v-model="formPackage.modelName"
            placeholder="請填寫模型顯示名稱（用戶端看到的）"
          />
        </el-form-item>
        <el-form-item
          v-if="[1].includes(Number(formPackage.keyType))"
          label="模型簡介"
          prop="key"
        >
          <el-input
            v-model="formPackage.modelDescription"
            type="text"
            placeholder="請填寫模型簡介"
          />
        </el-form-item>
        <el-form-item
          v-if="[1].includes(Number(formPackage.keyType))"
          label="模型圖標"
          prop="modelAvatar"
        >
          <el-input
            v-model="formPackage.modelAvatar"
            placeholder="請填寫或上傳網站模型圖標"
            clearable
          >
            <template #append>
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <img
                  v-if="formPackage.modelAvatar"
                  :src="formPackage.modelAvatar"
                  style="
                    max-width: 1.5rem;
                    max-height: 1.5rem;
                    margin: 5px 0;
                    object-fit: contain;
                  "
                />
                <el-icon v-else style="width: 1rem">
                  <Plus />
                </el-icon>
              </el-upload>
              <el-icon
                v-if="formPackage.modelAvatar"
                @click="reuploadModelAvatar"
                style="margin-left: 35px; width: 1rem"
              >
                <Refresh />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="模型排序" prop="modelOrder">
          <div class="input-with-text">
            <el-input-number
              v-model="formPackage.modelOrder"
              :max="999"
              :min="0"
              :step="10"
              class="input-number"
              style="margin-right: 10px"
            />
            <el-tooltip class="box-item" effect="dark" placement="right">
              <template #content>
                <div style="width: 250px">模型排序，越小越靠前。</div>
              </template>
              <el-icon class="ml-3 cursor-pointer">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </el-form-item>

        <el-form-item label="模型調用頻率" prop="modelLimits">
          <div class="input-with-text">
            <el-input-number
              v-model="formPackage.modelLimits"
              :max="999"
              :min="0"
              :step="5"
              class="input-number"
              style="margin-right: 10px"
            />
            <span class="unit-text">次/小時</span>
          </div>
        </el-form-item>

        <el-form-item label="指定代理地址" prop="proxyUrl">
          <el-input
            v-model.number="formPackage.proxyUrl"
            placeholder="如需使用代理請填寫、不填寫默認使用全局配置！"
          />
        </el-form-item>
        <el-form-item label="模型密鑰" prop="key">
          <el-input
            v-model="formPackage.key"
            type="text"
            placeholder="請填寫模型Key"
          />
        </el-form-item>

        <el-form-item label="賬號關聯模型" prop="model">
          <el-select
            v-model="formPackage.model"
            filterable
            clearable
            placeholder="請選用或填寫綁定的模型"
            allow-create
          >
            <el-option
              v-for="item in modelList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <!-- <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                給定了部分可選的模型列表、你可以可以手動填寫您需要調用的模型、請確保填寫的模型是當前key支持的類型、否則可能會在調用中出現不可預知錯誤！
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip> -->
        </el-form-item>
        <el-form-item label="模型扣費類型" prop="deductType">
          <el-select
            v-model="formPackage.deductType"
            filterable
            allow-create
            clearable
            placeholder="請選用模型扣費類型"
          >
            <el-option
              v-for="item in DEDUCTTYPELIST"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                設置當前key的扣費類型、扣除普通積分或是高級積分。
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip> -->
        </el-form-item>

        <el-form-item label="單次扣除金額" prop="deduct">
          <el-input
            v-model.number="formPackage.deduct"
            placeholder="請填寫單次調用此key的扣費金額！"
          />
          <!-- <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                設置當前key的單次調用扣除積分、建議同模型或名稱key設置相同的金額、避免扣費發生異常！
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip> -->
        </el-form-item>
        <el-form-item
          v-if="[1].includes(Number(formPackage.keyType))"
          label="上下文限制"
          prop="maxRounds"
        >
          <el-input
            v-model.number="formPackage.maxRounds"
            placeholder="請填寫允許用戶選擇的最高上下文條數！"
          />
          <!-- <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                填寫此配置可以限制用戶在選擇模型時候的高級配置中的最大上下文輪次、可以通過限制此數量減少token的損耗、減低上下文的損耗量、
                如果設置了模型的最大token和返回量、那麼兩個限制會同時生效！
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip> -->
        </el-form-item>
        <!-- <el-form-item
          v-if="[1].includes(Number(formPackage.keyType))"
          label="調用輪詢權重"
          prop="keyWeight"
        >
          <el-input
            v-model.number="formPackage.keyWeight"
            placeholder="請填寫key的權重、數字越大使用評率越高！"
            style="width: 80%"
          />
          <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                當前輪詢是根據模型下的列表按順序調用、如果權重為2則表示輪到此key的時候會調用兩次之後再輪詢下一個key
                保證每個key的調用順序以及限制每次調用的準確次數
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-form-item> -->
        <el-form-item
          v-if="[1 || 3].includes(Number(formPackage.keyType))"
          label="模型最大Token"
          prop="maxModelTokens"
        >
          <el-input
            v-model.number="formPackage.maxModelTokens"
            placeholder="請填寫模型最大Token、不填寫默認使用默認！"
          />
        </el-form-item>

        <el-form-item label="調用超時時間" prop="timeout">
          <el-input
            v-model.number="formPackage.timeout"
            placeholder="請填寫key的超時時間單位（秒）！"
          />
        </el-form-item>

        <el-form-item
          v-if="[1, 3].includes(Number(formPackage.keyType))"
          label="文件上傳"
          prop="isFileUpload"
        >
          <el-radio-group v-model="formPackage.isFileUpload">
            <el-radio :label="0"> 不使用 </el-radio>
            <el-radio :label="1"> 逆向格式 </el-radio>
            <el-radio :label="2"> 4o格式 </el-radio>
            <el-radio :label="3"> 文件分析 </el-radio>
          </el-radio-group>
          <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                選擇是否開啟文件上傳及其格式，逆向格式【直接附帶鏈接，僅支持逆向渠道】，4o格式【OpenAI
                Chat
                的識圖格式，僅支持圖片】，文件分析【內置方式的文件分析，支持全模型分析帶文字的文件】
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-form-item>
        <el-form-item
          v-if="[1, 3].includes(Number(formPackage.keyType))"
          label="token 關聯計費"
          prop="isTokenBased"
        >
          <el-switch v-model="formPackage.isTokenBased" />
          <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                關聯 token 的梯度計費模型，每次扣除的積分 = 單次扣除金額
                *（token 消耗 / token 計費比例）結果向上取整【例如單次扣除金額為
                3 積分，token 計費比例為 1000，用戶調用消耗 2500
                token，那麼扣除的積分為 3 *（2500 / 1000）向上取整 9 積分】
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-form-item>

        <el-form-item
          v-if="[1, 3].includes(Number(formPackage.keyType))"
          label="token計費比例"
          prop="tokenFeeRatio"
        >
          <el-input
            v-model.number="formPackage.tokenFeeRatio"
            placeholder="請填寫token計費比例"
            style="width: 80%"
          />
          <!-- <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="width: 250px">
                開啟 Token 計費後生效，每積分等價於多少 Token
              </div>
            </template>
            <el-icon class="ml-3 cursor-pointer"><QuestionFilled /></el-icon>
          </el-tooltip> -->
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="mr-5 flex justify-end">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handlerSubmit(formPackageRef)">
            {{ dialogButton }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
