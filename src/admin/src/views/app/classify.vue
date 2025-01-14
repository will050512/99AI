<route lang="yaml">
meta:
  title: App分類管理
</route>

<script lang="ts" setup>
import ApiApp from '@/api/modules/app';
import { utcToShanghaiTime } from '@/utils/utcformatTime';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive } from 'vue';

import { ENABLE_STATUS_OPTIONS, QUESTION_STATUS_MAP } from '@/constants/index';

const formRef = ref<FormInstance>();
const total = ref(0);
const visible = ref(false);
const loading = ref(false);
const uploadUrl = ref(`${import.meta.env.VITE_APP_API_BASEURL}/upload/file`);

const formInline = reactive({
  name: '',
  status: '',
  page: 1,
  size: 10,
});

const formPackageRef = ref<FormInstance>();
const activeAppCatId = ref(0);
const formPackage = reactive({
  name: '',
  des: '',
  coverImg: '',
  order: 100,
  status: 0,
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: '請填寫分類名稱', trigger: 'blur' }],
  des: [{ required: false, message: '請填寫分類描述', trigger: 'blur' }],
  coverImg: [
    { required: false, message: '請填寫分類封面圖片地址', trigger: 'blur' },
  ],
  order: [{ required: false, message: '請填寫排序ID', trigger: 'blur' }],
  status: [{ required: true, message: '請選擇分類狀態', trigger: 'change' }],
});

const tableData = ref([]);

const dialogTitle = computed(() => {
  return activeAppCatId.value ? '更新分類' : '新增分類';
});

const dialogButton = computed(() => {
  return activeAppCatId.value ? '確認更新' : '確認新增';
});

async function queryCatList() {
  try {
    loading.value = true;
    const res = await ApiApp.queryCats(formInline);
    const { rows, count } = res.data;
    loading.value = false;

    total.value = count;
    tableData.value = rows;
  } catch (error) {
    loading.value = false;
  }
}

function handleUpdatePackage(row: any) {
  activeAppCatId.value = row.id;
  const { name, status, des, order, coverImg } = row;
  nextTick(() => {
    Object.assign(formPackage, { name, status, des, order, coverImg });
  });
  visible.value = true;
}

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activeAppCatId.value = 0;
  formEl?.resetFields();
}

async function handleDeletePackage(row: any) {
  await ApiApp.deleteCats({ id: row.id });
  ElMessage.success('刪除分類成功');
  queryCatList();
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  queryCatList();
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
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
  return true;
};

function handlerSubmit(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (valid) {
      if (activeAppCatId.value) {
        await ApiApp.updateCats({ id: activeAppCatId.value, ...formPackage });
        ElMessage({ type: 'success', message: '更新分類成功！' });
      } else {
        await ApiApp.createCats(formPackage);
        ElMessage({ type: 'success', message: '創建新的分類成功！' });
      }
      visible.value = false;
      queryCatList();
    }
  });
}
onMounted(() => {
  queryCatList();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">應用分類配置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>應用分類可能會被多個用戶收藏，一旦創建，不建議刪除。</div>
        </div>
      </template>
      <HButton outline @click="visible = true">
        <SvgIcon name="ic:baseline-plus" />
        新增分類
      </HButton>
    </PageHeader>

    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="分類名稱" prop="name">
          <el-input
            v-model="formInline.name"
            placeholder="分類名稱[模糊搜索]"
            @keydown.enter.prevent="queryCatList"
          />
        </el-form-item>
        <el-form-item label="分類狀態" prop="status">
          <el-select
            v-model="formInline.status"
            placeholder="請選擇分類狀態"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in ENABLE_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryCatList"> 查詢 </el-button>
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
        <!-- <el-table-column prop="coverImg" label="分類封面" width="120">
          <template #default="scope">
            <el-image
              style="height: 50px"
              :src="scope.row.coverImg"
              fit="fill"
            />
          </template>
        </el-table-column> -->
        <el-table-column prop="name" label="分類名稱" />
        <el-table-column prop="appCount" label="應用數量" />
        <el-table-column prop="order" label="排序ID" />
        <el-table-column prop="status" label="分類狀態">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ QUESTION_STATUS_MAP[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="des" label="描述資訊" width="300" /> -->
        <el-table-column prop="createdAt" label="創建時間" width="200">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleUpdatePackage(scope.row)"
            >
              編輯
            </el-button>
            <el-popconfirm
              title="確認刪除此分類麼?"
              width="200"
              icon-color="red"
              @confirm="handleDeletePackage(scope.row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">
                  刪除分類
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
          @size-change="queryCatList"
          @current-change="queryCatList"
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
        <el-form-item label="分類名稱" prop="name">
          <el-input v-model="formPackage.name" placeholder="請填寫分類名稱" />
        </el-form-item>
        <el-form-item label="分類狀態" prop="status">
          <el-switch
            v-model="formPackage.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
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
