<route lang="yaml">
meta:
  title: 序號管理
</route>

<script lang="ts" setup>
import ApiPackage from '@/api/modules/package';
import ApiUsre from '@/api/modules/user';
import { CRAMI_STATUS_OPTIONS } from '@/constants/index';
import { utcToShanghaiTime } from '@/utils/utcformatTime';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive } from 'vue';

interface UserItem {
  id: number;
  username: string;
}

interface PkgItem {
  id: number;
  name: string;
}

const formRef = ref<FormInstance>();
const total = ref(0);
const visible = ref(false);
const cramiDialog = ref(false);
const formCramiRef = ref<FormInstance>();
const customCrami = ref(0);
const packageList = ref<PkgItem[]>([]);
const userList = ref<UserItem[]>([]);
const loading = ref(false);
const selects = ref([]);
const selectCramiList = ref<any[]>([]);

const form = reactive({
  packageId: null,
  count: 1,
  drawMjCount: 0,
  model3Count: 0,
  model4Count: 0,
});

const formInline = reactive({
  useId: '',
  status: '',
  page: 1,
  size: 15,
});

const rules = reactive<FormRules>({
  packageId: [{ required: true, message: '請選擇套餐類型', trigger: 'change' }],
  days: [{ required: true, message: '請填寫有效期天數', trigger: 'blur' }],
  count: [{ required: true, message: '請填寫想要生成的數量', trigger: 'blur' }],
  drawMjCount: [
    { required: true, message: '序號攜帶繪畫數量', trigger: 'blur' },
  ],
  model3Count: [
    { required: true, message: '序號攜帶基礎模型對話數量', trigger: 'blur' },
  ],
  model4Count: [
    { required: true, message: '序號攜帶高級模型金額', trigger: 'blur' },
  ],
});

const tableData = ref([]);

async function queryAllCramiList() {
  try {
    loading.value = true;
    const res = await ApiPackage.queryAllCrami(formInline);
    const { rows, count } = res.data;
    loading.value = false;

    total.value = count;
    tableData.value = rows;
  } catch (error) {
    loading.value = false;
  }
}

async function handlerSearchUser(val: UserItem) {
  const res = await ApiUsre.queryAllUser({ size: 30, username: val });
  userList.value = res.data.rows;
}

async function queryAllPackageList() {
  const res = await ApiPackage.queryAllPackage({ size: 100 });
  packageList.value = res.data.rows;
}

function openCreateCramiDialog() {
  queryAllPackageList();
  visible.value = true;
}

async function handlerCreateCrami(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (valid) {
      await ApiPackage.createCrami(form);
      ElMessage({ type: 'success', message: '生成序號成功！' });
      visible.value = false;
      queryAllCramiList();
    }
  });
}

function handleClose(formEl: FormInstance | undefined) {
  formEl?.resetFields();
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  queryAllCramiList();
}

async function handleDeleteCrami(row: any) {
  await ApiPackage.delCrami({ id: row.id });
  ElMessage({ type: 'success', message: '刪除序號成功！' });
  queryAllCramiList();
}

async function handleSelectionChange(val: any) {
  selects.value = val;
}

async function batchDelCrami() {
  try {
    loading.value = true;
    await ApiPackage.batchDelCrami({
      ids: selects.value.map((t: any) => t.id),
    });
    loading.value = false;
    ElMessage({ type: 'success', message: '刪除序號成功！' });
    queryAllCramiList();
  } catch (error) {
    loading.value = false;
  }
}

function handleShowCrami() {
  cramiDialog.value = true;
  const data = selects.value.map((t: any) => {
    return `${t.code}<---->${t.packageName || '自定義套餐'}`;
  });
  selectCramiList.value = data;
}

function arrayToText(array: string[]) {
  return array.join('\n');
}

function exportToFile(array: string[], filename: string) {
  const text = arrayToText(array);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportCrami() {
  const data = selects.value.map((t: any) => {
    return `${t.code}<---->${t.packageName || '自定義套餐'}`;
  });
  exportToFile(data, '序號資訊');
}

const hasEmail = computed(() => {
  return tableData.value.some((item: any) => item.email);
});

onMounted(() => {
  queryAllCramiList();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">序號設置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>可生成套餐類序號與自定義序號，套餐類序號的設置項更多。</div>
          <div>
            過期時間表示序號的過期時間，不是用戶充值後的有效期，設置為0表示永不過期。
          </div>
        </div>
      </template>

      <HButton
        outline
        v-if="selects.length"
        type="danger"
        @click="handleShowCrami"
      >
        顯示選中序號
      </HButton>
      <HButton
        outline
        v-if="selects.length"
        type="danger"
        @click="batchDelCrami"
      >
        批量刪除序號
      </HButton>
      <HButton
        outline
        v-if="selects.length"
        type="primary"
        @click="exportCrami"
      >
        批量導出序號
      </HButton>
      <HButton outline type="success" @click="openCreateCramiDialog">
        <SvgIcon name="ic:baseline-plus" />
        批量生成序號
      </HButton>
    </PageHeader>
    <!-- <page-main>
      <el-alert :closable="false" show-icon title="序號說明" description="" type="success" />
    </page-main> -->
    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="用戶名稱" prop="useId">
          <el-select
            v-model="formInline.useId"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="用戶姓名[模糊搜索]"
            remote-show-suffix
            :remote-method="handlerSearchUser"
            style="width: 160px"
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="序號狀態" prop="status">
          <el-select
            v-model="formInline.status"
            placeholder="請選擇序號狀態"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in CRAMI_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryAllCramiList">
            查詢
          </el-button>
          <el-button @click="handlerReset(formRef)"> 重置 </el-button>
        </el-form-item>
        <div style="float: right"></div>
      </el-form>
    </page-main>

    <page-main style="width: 100%">
      <el-table
        v-loading="loading"
        border
        :data="tableData"
        style="width: 100%"
        size="large"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="序號賬號" width="180" />
        <el-table-column prop="packageName" label="套餐類型" width="180">
          <template #default="scope">
            <el-tag :type="scope.row.packageName ? 'success' : 'danger'">
              {{ scope.row.packageName || '自定義序號' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="序號狀態" width="180">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'danger' : 'success'">
              {{ scope.row.status ? '已使用' : '未使用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="useId" label="使用人ID" width="90" />
        <el-table-column
          v-if="hasEmail"
          prop="email"
          label="使用人郵箱"
          width="180"
        />
        <el-table-column prop="model3Count" label="基礎模型額度" />
        <el-table-column prop="model4Count" label="高級模型額度" />
        <el-table-column prop="drawMjCount" label="繪畫模型額度" />
        <el-table-column prop="days" label="有效天數">
          <template #default="scope">
            {{ scope.row.days > 0 ? `${scope.row.days}天` : '永久' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="註冊時間" width="200">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-popconfirm
              title="確認刪除此序號麼?"
              width="200"
              icon-color="red"
              @confirm="handleDeleteCrami(scope.row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">
                  刪除序號
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
          :page-sizes="[15, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="queryAllCramiList"
          @current-change="queryAllCramiList"
        />
      </el-row>
    </page-main>
    <el-dialog
      v-model="visible"
      title="生成序號"
      width="450"
      @close="handleClose(formCramiRef)"
    >
      <el-form
        ref="formCramiRef"
        label-position="right"
        label-width="100px"
        :model="form"
        :rules="rules"
      >
        <el-row>
          <el-form-item label="是否生成自定義序號" label-width="170px">
            <el-switch
              v-model="customCrami"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </el-row>
        <el-form-item v-if="!customCrami" label="套餐類型" prop="packageId">
          <el-select
            v-model.number="form.packageId"
            placeholder="請選擇套餐類型"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in packageList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <div v-if="customCrami">
          <el-form-item label="基礎模型額度" prop="model3Count">
            <el-input
              v-model.number="form.model3Count"
              type="number"
              placeholder="序號攜帶基礎模型額度"
            />
          </el-form-item>
          <el-form-item label="高級模型額度" prop="model4Count">
            <el-input
              v-model.number="form.model4Count"
              type="number"
              placeholder="序號攜帶高級模型額度"
            />
          </el-form-item>
          <el-form-item label="繪畫模型額度" prop="drawMjCount">
            <el-input
              v-model.number="form.drawMjCount"
              type="number"
              placeholder="序號攜帶繪畫積分額度"
            />
          </el-form-item>
        </div>
        <el-form-item label="生成數量" prop="count">
          <el-input
            v-model.number="form.count"
            type="number"
            placeholder="本次生成的張數"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visible = false">放棄生成</el-button>
          <el-button type="primary" @click="handlerCreateCrami(formCramiRef)">
            確定生成
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="cramiDialog" title="序號列表">
      <div style="max-height: 200px; overflow: scroll">
        <div v-for="(item, index) in selectCramiList" :key="index">
          {{ item }}
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cramiDialog = false">關閉彈窗</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
