<route lang="yaml">
meta:
  title: 對話管理
</route>

<script lang="ts" setup>
import ApiOrder from '@/api/modules/order';
import ApiUsre from '@/api/modules/user';
import {
  PAY_PLATFORM_LIST,
  PAY_PLATFORM_MAP,
  PAY_STATUS_MAP,
  PAY_STATUS_OPTIONS,
} from '@/constants';
import { utcToShanghaiTime } from '@/utils/utcformatTime';
import { ElMessage, type FormInstance } from 'element-plus';
import { onMounted, reactive } from 'vue';

interface GoodsInfo {
  coverImg: string;
  id: number;
  des: string;
  name: string;
}

type PayPlatform = keyof typeof PAY_PLATFORM_MAP;

interface UserInfo {
  username: string;
  id: number;
  email: string;
}

interface OrderItem {
  count: number;
  createdAt: Date;
  updatedAt: Date;
  goodsId: number;
  id: number;
  orderId: string;
  paydAt: Date;
  price: number;
  status: number;
  total: number;
  tradeId: string;
  userId: number;
  goodsInfo: GoodsInfo;
  userInfo: UserInfo;
}

const loading = ref(false);
const delLoading = ref(false);
const userList = ref<UserInfo[]>([]);

const formRef = ref<FormInstance>();
const total = ref(0);
const totalPrice = ref(0);

const formInline = reactive({
  userId: '',
  platform: '',
  status: '',
  page: 1,
  size: 15,
});

const tableData = ref<OrderItem[]>([]);

async function queryAllOrder() {
  loading.value = true;
  try {
    const res = await ApiOrder.queryAllOrder(formInline);
    loading.value = false;
    const { rows, count, total_price } = res.data;
    total.value = count;
    tableData.value = rows;
    totalPrice.value = total_price;
  } catch (error) {
    loading.value = false;
  }
}

async function handlerSearchUser(val: string) {
  const res = await ApiUsre.queryAllUser({ size: 30, username: val });
  userList.value = res.data.rows;
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  queryAllOrder();
}

async function handleDeleteOrder(row: OrderItem) {
  const { orderId } = row;
  await ApiOrder.deleteOrder({ orderId });
  ElMessage.success('刪除訂單完成!');
  queryAllOrder();
}

async function handleDelNotPayOrder() {
  delLoading.value = true;
  try {
    await ApiOrder.deleteNotPay();
    ElMessage.success('刪除未支付訂單完成!');
    await queryAllOrder();
    delLoading.value = false;
  } catch (error) {
    ElMessage.error('刪除未支付訂單失敗!');
    delLoading.value = false;
  }
}

onMounted(() => {
  queryAllOrder();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">訂單列表</div>
      </template>
    </PageHeader>
    <page-main class="flex items-start justify-between">
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="用戶名稱" prop="userId">
          <el-select
            v-model="formInline.userId"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="用戶姓名[模糊搜索]"
            remote-show-suffix
            :remote-method="handlerSearchUser"
            style="width: 180px"
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付平臺" prop="platform">
          <el-select
            v-model="formInline.platform"
            clearable
            placeholder="請選擇支付平臺"
            remote-show-suffix
            style="width: 160px"
          >
            <el-option
              v-for="item in PAY_PLATFORM_LIST"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付狀態" prop="status">
          <el-select
            v-model="formInline.status"
            clearable
            placeholder="請選擇支付狀態"
            remote-show-suffix
            style="width: 160px"
          >
            <el-option
              v-for="item in PAY_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryAllOrder"> 查詢 </el-button>
          <el-button @click="handlerReset(formRef)"> 重置 </el-button>
          <el-popconfirm
            title="確認刪除所有未支付訂單麼?"
            @confirm="handleDelNotPayOrder"
          >
            <template #reference>
              <el-button type="danger"> 刪除所有未支付訂單 </el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
      </el-form>
      <el-statistic title="累計已支付訂單金額" :value="totalPrice" />
    </page-main>

    <page-main style="width: 100%">
      <el-table
        v-loading="loading"
        border
        :data="tableData"
        style="width: 100%"
        size="large"
        :tooltip-options="{}"
      >
        <el-table-column fixed prop="orderId" label="訂單ID" width="315" />
        <el-table-column
          prop="userInfo.username"
          label="用戶名稱"
          width="180"
        />
        <el-table-column prop="userInfo.email" label="用戶郵箱" width="200" />
        <el-table-column prop="goodsInfo.name" label="套餐名稱" width="140" />
        <el-table-column prop="price" label="商品單價" width="110" />
        <el-table-column
          prop="count"
          label="購買數量"
          width="90"
          align="center"
        />
        <el-table-column
          prop="total"
          label="訂單總價"
          width="90"
          align="center"
        />
        <el-table-column
          prop="total"
          label="支付平臺"
          width="90"
          align="center"
        >
          <template #default="scope">
            {{ PAY_PLATFORM_MAP[scope.row.payPlatform as PayPlatform] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="支付狀態"
          width="90"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
              {{ PAY_STATUS_MAP[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="訂單時間"
          width="200"
          fixed="right"
        >
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-popconfirm
              title="確認刪除此訂單麼、刪除訂單不可恢復?"
              width="400"
              icon-color="red"
              @confirm="handleDeleteOrder(scope.row)"
            >
              <template #reference>
                <el-button
                  link
                  type="danger"
                  size="small"
                  :loading="delLoading"
                >
                  刪除訂單
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
          :page-sizes="[15, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="queryAllOrder"
          @current-change="queryAllOrder"
        />
      </el-row>
    </page-main>
  </div>
</template>

<style>
.prompt,
.answer {
  width: 100%;
  max-height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  cursor: pointer;
}

.answer_container {
  max-height: 500px;
  overflow: overlay;
}
</style>
