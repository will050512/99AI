<route lang="yaml">
meta:
  title: 應用管理
</route>

<script lang="ts" setup>
import ApiApp from '@/api/modules/app';
import { utcToShanghaiTime } from '@/utils/utcformatTime';
import { Plus, Refresh } from '@element-plus/icons-vue';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive } from 'vue';

import { MODEL_LIST, QUESTION_STATUS_MAP } from '@/constants/index';
import axios from 'axios';

const formRef = ref<FormInstance>();
const total = ref(0);
const visible = ref(false);
const loading = ref(false);

const formInline = reactive({
  catId: '',
  name: '',
  status: '',
  role: '',
  page: 1,
  size: 10,
  isGPTs: 0,
  gizmoID: '',
  isFixedModel: 0,
  appModel: '',
});
// const uploadUrl = ref(`${import.meta.env.VITE_APP_API_BASEURL}/upload/file`);
const uploadUrl = ref(
  `${import.meta.env.VITE_APP_API_BASEURL}/upload/file?dir=${encodeURIComponent(
    'system/app'
  )}`
);

const formPackageRef = ref<FormInstance>();
const activeAppCatId = ref(0);
const isUserApp = ref(false);
const userAppStatus = ref(0);
const formPackage = reactive({
  catId: '',
  name: '',
  preset: '',
  des: '',
  coverImg: '',
  demoData: '',
  order: 100,
  status: 0,
  isGPTs: 0,
  gizmoID: '',
  isFixedModel: 0,
  appModel: '',
});

const rules = reactive<FormRules>({
  catId: [{ required: true, message: '請選擇App分類', trigger: 'change' }],
  name: [{ required: true, message: '請填寫App名稱', trigger: 'blur' }],
  preset: [{ required: false, message: '請填寫App預設資訊', trigger: 'blur' }],
  des: [{ required: true, message: '請填寫App描述', trigger: 'blur' }],
  coverImg: [
    { required: false, message: '請填寫App封面圖片地址', trigger: 'blur' },
  ],
  demoData: [
    { required: false, message: '請填寫App演示數據', trigger: 'blur' },
  ],
  isGPTs: [{ required: true, message: '是否GPTs', trigger: 'blur' }],
  gizmoID: [{ required: false, message: 'GPTs 的ID', trigger: 'blur' }],
  order: [{ required: false, message: '請填寫排序ID', trigger: 'blur' }],
  status: [{ required: true, message: '請選擇App狀態', trigger: 'change' }],
  isFixedModel: [
    { required: true, message: '請選擇App是否固定模型', trigger: 'blur' },
  ],
  appModel: [
    { required: false, message: '請選擇App使用的模型', trigger: 'change' },
  ],
});

const tableData = ref([]);

interface CatItem {
  id: number;
  name: string;
}
const catList: Ref<CatItem[]> = ref([]);

const dialogTitle = computed(() => {
  return activeAppCatId.value ? '更新應用' : '新增應用';
});

const dialogButton = computed(() => {
  return activeAppCatId.value ? '確認更新' : '確認新增';
});

async function queryAppList() {
  try {
    loading.value = true;
    const res = await ApiApp.queryApp(formInline);
    const { rows, count } = res.data;
    loading.value = false;
    total.value = count;
    tableData.value = rows.sort(
      (a: { order: number }, b: { order: number }) => b.order - a.order
    );
  } catch (error) {
    loading.value = false;
  }
}

async function queryCatList() {
  const res = await ApiApp.queryCats({ size: 100 });
  const { rows } = res.data;
  catList.value = rows;
}

function handleUpdatePackage(row: any) {
  activeAppCatId.value = row.id;
  isUserApp.value = row.role === 'user';
  userAppStatus.value = row.status;
  const {
    name,
    status,
    des,
    order,
    coverImg,
    catId,
    preset,
    demoData,
    isGPTs,
    gizmoID,
    isFixedModel,
    appModel,
  } = row;
  nextTick(() => {
    Object.assign(formPackage, {
      name,
      status,
      des,
      order,
      coverImg,
      catId,
      preset,
      demoData,
      isGPTs,
      gizmoID,
      isFixedModel,
      appModel,
    });
  });
  visible.value = true;
}

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activeAppCatId.value = 0;
  formEl?.resetFields();
}

async function handleDeletePackage(row: any) {
  await ApiApp.deleteApp({ id: row.id });
  ElMessage.success('刪除分類成功');
  queryAppList();
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  queryAppList();
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log('response: ', response.data);
  formPackage.coverImg = response.data;
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('當前系統僅支持 PNG、JPEG、GIF、和 WebP 格式的圖片!');
    return false;
  } else if (rawFile.size / 1024 > 300) {
    ElMessage.error('當前限制文件最大不超過 300KB!');
    return false;
  }
};

async function reuploadAppAvatar() {
  if (formPackage.coverImg) {
    const file = await downloadFile(formPackage.coverImg);
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

function handlerSubmit(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (valid) {
      if (activeAppCatId.value) {
        const params = { id: activeAppCatId.value, ...formPackage };
        /* 如果是用戶的app 不能修改狀態 保持原樣返回 */
        isUserApp.value &&
          Object.assign(params, { status: userAppStatus.value });
        await ApiApp.updateApp(params);
        ElMessage({ type: 'success', message: '更新應用成功！' });
      } else {
        await ApiApp.createApp(formPackage);
        ElMessage({ type: 'success', message: '創建新的應用成功！' });
      }
      visible.value = false;
      queryAppList();
    }
  });
}

onMounted(() => {
  queryAppList();
  queryCatList();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">應用配置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            應用一旦創建，可能會被多處使用，請保持規範命名分類，後續儘量變更而不是刪除。
          </div>
          <div>
            可自行選擇應用是否固定模型。GPTs 需單獨在特殊模型中配置 gpts
            模型，並自行搜索填寫 gizmoID（例如：g-alKfVrz9K）。
          </div>
        </div>
      </template>
      <HButton outline @click="visible = true">
        <SvgIcon name="ic:baseline-plus" />
        新增應用
      </HButton>
    </PageHeader>

    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="App分類" prop="catId">
          <el-select
            v-model="formInline.catId"
            placeholder="請選擇App分類"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in catList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="App名稱" prop="name">
          <el-input
            v-model="formInline.name"
            placeholder="App名稱[模糊搜索]"
            clearable
            @keydown.enter.prevent="queryAppList"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="queryAppList"> 查詢 </el-button>
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
        <el-table-column prop="coverImg" label="應用封面" width="100">
          <template #default="scope">
            <el-image
              style="height: 50px"
              :src="scope.row.coverImg"
              fit="fill"
            />
          </template>
        </el-table-column>
        <el-table-column prop="catName" label="應用分類" width="100" />
        <el-table-column prop="name" label="應用名稱" width="120" />
        <el-table-column prop="status" label="應用狀態" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ QUESTION_STATUS_MAP[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="public" label="是否共享" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.public ? 'success' : 'info'">
              {{ scope.row.public ? '共享' : '私有' }}
            </el-tag>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="public" label="應用創建角色" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'system' ? 'success' : 'info'">
              {{ scope.row.role === 'system' ? '系統' : '用戶' }}
            </el-tag>
          </template>
        </el-table-column> -->
        <el-table-column prop="order" label="排序ID" /> />
        <el-table-column prop="preset" label="預設資訊" width="400">
          <template #default="scope">
            <el-tooltip class="box-item" effect="dark" placement="top-start">
              <template #content>
                <div :style="{ maxWidth: '350px' }">
                  {{ scope.row.preset }}
                </div>
              </template>
              <div :style="{ maxHeight: '50px', cursor: 'pointer' }">
                {{ scope.row.preset }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="des" label="描述資訊" width="300">
          <template #default="scope">
            <el-tooltip class="box-item" effect="dark" placement="top-start">
              <template #content>
                <div :style="{ maxWidth: '350px' }">
                  {{ scope.row.des }}
                </div>
              </template>
              <div :style="{ maxHeight: '50px', cursor: 'pointer' }">
                {{ scope.row.des }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="創建時間" width="120">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              v-if="scope.row.role === 'system' || scope.row.public"
              link
              type="primary"
              size="small"
              @click="handleUpdatePackage(scope.row)"
            >
              編輯
            </el-button>
            <el-popconfirm
              v-if="scope.row.role === 'system'"
              title="確認刪除此應用麼?"
              width="200"
              icon-color="red"
              @confirm="handleDeletePackage(scope.row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">
                  刪除應用
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
          @size-change="queryAppList"
          @current-change="queryAppList"
        />
      </el-row>
    </page-main>
    <el-dialog
      v-model="visible"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="570"
      @close="handlerCloseDialog(formPackageRef)"
    >
      <el-form
        ref="formPackageRef"
        label-position="right"
        label-width="100px"
        :model="formPackage"
        :rules="rules"
      >
        <el-form-item label="App分類" prop="catId">
          <el-select
            v-model="formPackage.catId"
            placeholder="請選擇App分類"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in catList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="App名稱" prop="name">
          <el-input v-model="formPackage.name" placeholder="請填寫App名稱" />
        </el-form-item>
        <el-form-item v-if="!isUserApp" label="App狀態" prop="status">
          <el-switch
            v-model="formPackage.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="App描述" prop="des">
          <el-input
            v-model="formPackage.des"
            type="textarea"
            placeholder="請填寫App介紹資訊、用於對外展示..."
            :rows="4"
          />
        </el-form-item>
        <el-form-item v-if="!isUserApp" label="啟用GPTs" prop="isGPTs">
          <el-switch
            v-model="formPackage.isGPTs"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item
          v-if="Number(formPackage.isGPTs) === 1"
          label="gizmoID"
          prop="gizmoID"
        >
          <el-input
            v-model="formPackage.gizmoID"
            placeholder="請填寫 GPTs 使用的 gizmoID"
          />
        </el-form-item>
        <el-form-item
          v-if="Number(formPackage.isGPTs) !== 1"
          label="App預設"
          prop="preset"
        >
          <el-input
            v-model="formPackage.preset"
            type="textarea"
            placeholder="請填寫App預設資訊、用於給AI預設身份..."
            :rows="4"
          />
        </el-form-item>
        <el-form-item
          v-if="!isUserApp && Number(formPackage.isGPTs) !== 1"
          label="固定模型"
          prop="isFixedModel"
        >
          <el-switch
            v-model="formPackage.isFixedModel"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item
          v-if="
            Number(formPackage.isFixedModel) === 1 &&
            Number(formPackage.isGPTs) !== 1
          "
          label="使用模型"
          prop="appModel"
        >
          <el-select
            v-model="formPackage.appModel"
            filterable
            allow-create
            placeholder="請選擇應用使用的模型"
            clearable
          >
            <el-option
              v-for="item in MODEL_LIST"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="示例內容" prop="demoData">
          <el-input
            v-model="formPackage.demoData"
            type="textarea"
            placeholder="請填寫App的demo示例數據、每換行一次表示一個新的示例..."
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="應用圖標" prop="coverImg">
          <el-input
            v-model="formPackage.coverImg"
            placeholder="請填寫或上傳應用圖標"
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
                  v-if="formPackage.coverImg"
                  :src="formPackage.coverImg"
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
                v-if="formPackage.coverImg"
                @click="reuploadAppAvatar"
                style="margin-left: 35px; width: 1rem"
              >
                <Refresh />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="Logo地址" prop="coverImg">
          <el-input
            v-model="formPackage.coverImg"
            placeholder="請填寫應用Logo 或點擊 上傳按鈕/圖片預覽 上傳圖片"
          />
        </el-form-item>
        <el-icon>
          <i class="el-icon-refresh" />
        </el-icon>

        <el-form-item label="應用Logo" prop="coverImg">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="formPackage.coverImg"
              :src="formPackage.coverImg"
              style="width: 100px"
              class="avatar"
            />
            <el-icon v-else class="avatar-uploader-icon ml-3">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item> -->

        <el-form-item label="排序ID" prop="order">
          <el-input
            v-model.number="formPackage.order"
            placeholder="請填寫排序ID[數字越大越靠前]"
          />
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
