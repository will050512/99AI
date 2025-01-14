<route lang="yaml">
meta:
  title: 自定義回覆預設
</route>

<script lang="ts" setup>
import ApiAutoReply from '@/api/modules/autoReply';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { nextTick, onMounted, reactive } from 'vue';

import {
  QUESTION_STATUS_MAP,
  QUESTION_STATUS_OPTIONS,
} from '@/constants/index';

const formInline = reactive({
  prompt: '',
  status: undefined,
  page: 1,
  size: 10,
});
const visible = ref(false);
const loading = ref(false);

const activeId = ref(0);
const total = ref(0);
const formRef = ref<FormInstance>();
const formAutoReplyRef = ref<FormInstance>();
const formAutoReply = reactive({
  status: 1,
  prompt: '',
  answer: '',
  isAIReplyEnabled: 1,
});

const rules = reactive<FormRules>({
  status: [{ required: true, message: '請選擇開啟狀態', trigger: 'change' }],
  prompt: [{ required: true, message: '請填寫預設問題', trigger: 'blur' }],
  answer: [{ required: true, message: '請填寫回復答案', trigger: 'blur' }],
  isAIReplyEnabled: [
    { required: true, message: '請選擇是否開啟AI回覆', trigger: 'change' },
  ],
});

const tableData = ref([]);

async function queryAutoReplyList() {
  try {
    loading.value = true;
    const res = await ApiAutoReply.queryAutoReply(formInline);
    const { rows, count } = res.data;
    loading.value = false;
    total.value = count;
    tableData.value = rows;
  } catch (error) {
    loading.value = false;
  }
}

async function handleDelete(id: number) {
  await ApiAutoReply.delAutoReply({ id });
  ElMessage.success('刪除自定義知識庫成功');
  await queryAutoReplyList();
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  queryAutoReplyList();
}

function handleEdit(row: any) {
  activeId.value = row.id;
  const { status, prompt, answer, isAIReplyEnabled } = row;
  visible.value = true;
  nextTick(() => {
    Object.assign(formAutoReply, { status, prompt, answer, isAIReplyEnabled });
  });
}

const isUpdate = computed(() => activeId.value !== 0);

function handleClose(formEl: FormInstance | undefined) {
  formEl?.resetFields();
  activeId.value = 0;
}

async function handlerSubmit(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('請按規則填寫所有資訊！');
      return;
    }
    if (activeId.value === 0) {
      await ApiAutoReply.addAutoReply(formAutoReply);
      ElMessage.success('添加自定義知識庫成功');
    } else {
      await ApiAutoReply.updateAutoReply({
        id: activeId.value,
        ...formAutoReply,
      });
      ElMessage.success('更新自定義知識庫成功');
    }

    visible.value = false;
    queryAutoReplyList();
  });
}

onMounted(() => {
  queryAutoReplyList();
});
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">自定義知識庫說明</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            自定義知識庫會根據用戶提問中的關鍵詞匹配知識庫的內容作為預設。同一知識庫支持多個關鍵詞，多個關鍵詞用空格隔開。
          </div>
          <div>默認開啟 AI 回覆，關閉後將直接回復預設答案。</div>
        </div>
      </template>
      <HButton outline @click="visible = true">
        <SvgIcon name="i-ri:file-text-line" />
        添加知識庫
      </HButton>
    </PageHeader>

    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="關鍵詞" prop="prompt">
          <el-input
            v-model="formInline.prompt"
            placeholder="關鍵詞[模糊搜索]"
            @keydown.enter.prevent="queryAutoReplyList"
          />
        </el-form-item>
        <el-form-item label="啟用狀態" prop="status">
          <el-select
            v-model="formInline.status"
            placeholder="請選擇啟用狀態"
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
          <el-button type="primary" @click="queryAutoReplyList">
            查詢
          </el-button>
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
        <el-table-column prop="prompt" label="關鍵詞" />
        <el-table-column prop="answer" label="知識庫" />
        <el-table-column prop="status" label="狀態" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ QUESTION_STATUS_MAP[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="createdAt" label="創建時間" width="200">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最後修改時間" width="200">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column> -->
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
            >
              編輯
            </el-button>
            <el-popconfirm
              confirm-button-text="確認刪除"
              cancel-button-text="放棄"
              type="danger"
              width="230px"
              icon-color="red"
              title="確定刪除次條知識庫？"
              @confirm="handleDelete(scope.row.id)"
            >
              <template #reference>
                <el-button link type="danger" size="small"> 刪除 </el-button>
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
          @size-change="queryAutoReplyList"
          @current-change="queryAutoReplyList"
        />
      </el-row>
    </page-main>
    <el-dialog
      v-model="visible"
      :title="`${isUpdate ? '編輯' : '添加'}知識庫`"
      width="600px"
      @close="handleClose(formAutoReplyRef)"
    >
      <el-form
        ref="formAutoReplyRef"
        label-position="right"
        label-width="80px"
        :model="formAutoReply"
        :rules="rules"
      >
        <el-form-item label="開啟狀態" prop="status">
          <el-switch
            v-model="formAutoReply.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="AI回覆" prop="isAIReplyEnabled">
          <el-switch
            v-model="formAutoReply.isAIReplyEnabled"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>

        <el-form-item label="關鍵詞" prop="prompt">
          <el-input
            v-model="formAutoReply.prompt"
            type="textarea"
            :rows="5"
            placeholder="請填寫關鍵詞，多個關鍵詞用空格隔開"
          />
        </el-form-item>
        <el-form-item label="知識庫" prop="answer">
          <el-input
            v-model="formAutoReply.answer"
            type="textarea"
            :rows="5"
            placeholder="請填寫匹配的知識庫內容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handlerSubmit(formAutoReplyRef)">
            {{ `${isUpdate ? '更新' : '新增'}知識庫 ` }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
