<route lang="yaml">
meta:
  title: 卡券管理
</route>

<script lang="ts" setup>
import ApiPackage from '@/api/modules/package';
import { IS_OPTIONS, PACKAGE_TYPE_OPTIONS } from '@/constants/index';
import { utcToShanghaiTime } from '@/utils/utcformatTime';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';

// const uploadUrl = ref(`${import.meta.env.VITE_APP_API_BASEURL}/upload/file`);
const uploadUrl = ref(
  `${import.meta.env.VITE_APP_API_BASEURL}/upload/file?dir=${encodeURIComponent(
    'system/others'
  )}`
);

const formRef = ref<FormInstance>();
const total = ref(0);
const visible = ref(false);
const loading = ref(false);

const formInline = reactive({
  name: '',
  page: 1,
  size: 10,
  status: '',
});
const formPackageRef = ref<FormInstance>();
const activePackageId = ref(0);

interface Package {
  id?: number | null;
  name?: string | null;
  des?: string | null;
  coverImg?: string | null;
  price?: number | null;
  order?: number | null;
  status?: number | null;
  weight?: number | null;
  days?: number | null;
  model3Count: number | null;
  model4Count: number | null;
  drawMjCount: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

const formPackage: Package = reactive({
  name: null,
  des: null,
  coverImg: null,
  price: null,
  order: null,
  status: 0 as number, // 修改類型定義
  weight: null,
  days: null,
  model3Count: null,
  model4Count: null,
  drawMjCount: null,
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: '請填寫套餐名稱', trigger: 'blur' }],
  des: [{ required: true, message: '請填寫套餐的詳細描述', trigger: 'blur' }],
  deductionType: [
    { required: true, message: '請選擇扣費形式', trigger: 'change' },
  ],
  coverImg: [
    { required: true, message: '請填寫或上傳封面圖地址', trigger: 'blur' },
  ],
  price: [{ required: true, message: '請填寫套餐價格', trigger: 'blur' }],
  order: [{ required: true, message: '請填寫套餐排序', trigger: 'blur' }],
  status: [
    { required: true, message: '請選擇套餐開啟狀態', trigger: 'change' },
  ],
  days: [{ required: true, message: '請填寫套餐有效期天數', trigger: 'blur' }],
  model3Count: [
    {
      required: true,
      message: '請填寫套餐中基礎模型可使用次數',
      trigger: 'blur',
    },
  ],
  model4Count: [
    {
      required: true,
      message: '請填寫套餐中高級模型可使用次數',
      trigger: 'blur',
    },
  ],
  drawMjCount: [
    { required: true, message: '請填寫套餐中抽獎次數', trigger: 'blur' },
  ],
});

const tableData = ref([]);

async function queryAllUserList() {
  try {
    loading.value = true;

    const res = await ApiPackage.queryAllPackage(formInline);
    loading.value = false;

    const { rows, count } = res.data;
    total.value = count;
    tableData.value = rows;
  } catch (error) {
    loading.value = false;
  }
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  queryAllUserList();
}

type Status = keyof typeof IS_OPTIONS;

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('當前系統僅支持 PNG、JPEG、GIF、和 WebP 格式的圖片!');
    return false;
  } else if (rawFile.size / 1024 > 2000) {
    ElMessage.error('當前限制文件最大不超過 2000KB!');
    return false;
  }
  return true;
};

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  formPackage.coverImg = response.data;
};

async function handleDeletePackage(id: any) {
  await ApiPackage.delPackage({ id });
  ElMessage({ type: 'success', message: '刪除套餐成功！' });
  queryAllUserList();
}

function handleUpdatePackage(row: Package) {
  activePackageId.value = row.id as number;
  nextTick(() => {
    Object.assign(formPackage, row);
    delete formPackage?.createdAt;
    delete formPackage?.updatedAt;
    delete formPackage?.deletedAt;
    delete formPackage?.id;
  });
  visible.value = true;
}

const dialogTitle = computed(() => {
  return activePackageId.value ? '更新套餐' : '新增套餐';
});

const dialogButton = computed(() => {
  return activePackageId.value ? '確認更新' : '確認新增';
});

function handleCreatePkg() {
  activePackageId.value = 0;
  visible.value = true;
  formPackageRef.value?.resetFields();
}

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activePackageId.value = 0;
  formEl?.resetFields();
}

async function handlerSubmit(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (valid) {
      if (activePackageId.value) {
        await ApiPackage.updatePackage({
          id: activePackageId.value,
          ...formPackage,
        });
        ElMessage({ type: 'success', message: '更新套餐成功！' });
      } else {
        await ApiPackage.createPackage(formPackage);
        ElMessage({ type: 'success', message: '創建新的套餐成功！' });
      }
      visible.value = false;
      queryAllUserList();
    }
  });
}

onMounted(() => {
  queryAllUserList();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">套餐設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            套餐分為不限時套餐和限時套餐。不限時充值積分永不過期，限時套餐在規定時間未使用完畢將清空剩餘積分。
          </div>
          <div>
            如果充值的套餐等級高於或等於當前套餐等級，則疊加充值額度並延長會員到期時間。
          </div>
          <div>
            如果充值的套餐等級低於當前套餐等級，則只疊加充值額度，不延長會員到期時間也不改變會員等級。
          </div>
          請仔細閱讀以上內容併合理配置，套餐有效時間設為-1即為不限時套餐。
        </div>
      </template>
      <HButton outline @click="handleCreatePkg">
        <SvgIcon name="ic:baseline-plus" />
        創建套餐
      </HButton>
    </PageHeader>
    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="套餐狀態" prop="status">
          <el-select
            v-model="formInline.status"
            placeholder="請選擇套餐狀態"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in PACKAGE_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="queryAllUserList"> 查詢 </el-button>
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
        <el-table-column fixed prop="name" label="套餐名稱" width="150" />
        <el-table-column
          prop="order"
          label="排序ID"
          align="center"
          width="100"
        />
        <el-table-column
          prop="coverImg"
          label="套餐封面"
          width="150"
          align="center"
        >
          <template #default="scope">
            <el-image
              style="height: 50px"
              :src="scope.row.coverImg"
              fit="fill"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="套餐價格"
          width="100"
          align="center"
        />
        <el-table-column
          prop="weight"
          label="套餐等級"
          width="100"
          align="center"
        />
        <el-table-column prop="status" label="套餐狀態" width="100">
          <template #default="scope">
            <el-tag type="info">
              {{ IS_OPTIONS[scope.row.status as Status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="days" label="套餐有效期" width="120">
          <template #default="scope">
            {{ scope.row.days > 0 ? `${scope.row.days}天` : '永久' }}
          </template>
        </el-table-column>
        <el-table-column prop="model3Count" label="基礎模型額度" width="100" />
        <el-table-column prop="model4Count" label="高級模型額度" width="100" />
        <el-table-column prop="drawMjCount" label="繪畫額度" width="100" />
        <el-table-column prop="des" label="套餐描述" width="300" />
        <el-table-column prop="createdAt" label="創建時間" width="200">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleUpdatePackage(scope.row)"
            >
              修改套餐
            </el-button>
            <el-popconfirm
              title="確認刪除此套餐麼?"
              width="200"
              icon-color="red"
              @confirm="handleDeletePackage(scope.row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">
                  刪除套餐
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
          @size-change="queryAllUserList"
          @current-change="queryAllUserList"
        />
      </el-row>
    </page-main>

    <el-dialog
      v-model="visible"
      :close-on-click-modal="false"
      :title="dialogTitle"
      width="970"
      @close="handlerCloseDialog(formPackageRef)"
    >
      <el-form
        ref="formPackageRef"
        label-position="right"
        label-width="120px"
        :model="formPackage"
        :rules="rules"
      >
        <el-row>
          <el-col :span="11">
            <el-form-item label="套餐詳細名稱" prop="name">
              <el-input
                v-model="formPackage.name"
                placeholder="請填寫套餐名稱"
              />
            </el-form-item>
          </el-col>
          <el-col :span="3" :offset="2">
            <el-form-item label="套餐開啟狀態" prop="status">
              <el-switch
                v-model="formPackage.status"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="7" :offset="1">
            <el-form-item label="套餐等級" prop="status">
              <el-input
                v-model.number="formPackage.weight"
                type="number"
                placeholder="設置套餐等級"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="設置套餐價格" prop="price">
              <el-input
                v-model.number="formPackage.price"
                placeholder="請填寫套餐價格(NT$)"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="套餐有效時間" prop="days">
              <el-input
                v-model.number="formPackage.days"
                type="number"
                placeholder="自序號生成之日有效天數、-1為永久"
              />
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="設置套餐封面" prop="coverImg">
              <el-input
                v-model="formPackage.coverImg"
                class="flex-1"
                placeholder="填寫封面地址或點擊上傳"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button>
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </el-upload>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="設置套餐排序" prop="order">
              <el-input
                v-model.number="formPackage.order"
                type="number"
                placeholder="排序數字越大越靠前|套餐權重等級則反之"
              />
            </el-form-item>
          </el-col>

          <el-col :span="11">
            <el-form-item label="設置套餐描述" prop="des">
              <el-input
                v-model="formPackage.des"
                type="textarea"
                placeholder="請填寫套餐詳細介紹資訊、用於對外展示、建議控制套餐價格字數以便於用戶端對齊格式..."
                :rows="6"
              />
            </el-form-item>
          </el-col>

          <el-col :span="11" :offset="2">
            <el-form-item label="基礎模型積分" prop="model3Count">
              <el-input
                v-model.number="formPackage.model3Count"
                type="number"
                placeholder="基礎模型積分"
              />
            </el-form-item>
            <el-form-item label="高級模型積分" prop="model4Count">
              <el-input
                v-model.number="formPackage.model4Count"
                type="number"
                placeholder="高級模型積分"
              />
            </el-form-item>
            <el-form-item label="繪畫模型積分" prop="drawMjCount">
              <el-input
                v-model.number="formPackage.drawMjCount"
                type="number"
                placeholder="繪畫模型積分"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
