<route lang="yaml">
meta:
  title: 積分顯示
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const drawingStyleList = ref(); // 繪畫風格關鍵詞列表
const inputVisible = ref(false); // 控制輸入框的顯示
const inputValue = ref(''); // 輸入框的值
const inputRef = ref(); // 輸入框的引用

const formInline = reactive({
  isHideModel3Point: '',
  isHideModel4Point: '',
  isHideDrawMjPoint: '',
  isHideDefaultPreset: '',
  model3Name: '',
  model4Name: '',
  drawMjName: '',
  drawingStyles: '',
  showWatermark: '',
  isHideTts: '',
});
const rules = ref<FormRules>({
  model3Name: [
    { required: true, message: '請輸入普通積分名稱', trigger: 'blur' },
  ],
  model4Name: [
    { required: true, message: '請輸入高級積分名稱', trigger: 'blur' },
  ],
  drawMjName: [
    { required: true, message: '請輸入繪畫積分名稱', trigger: 'blur' },
  ],
});
const formRef = ref<FormInstance>();

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'isHideModel3Point',
      'isHideModel4Point',
      'isHideDrawMjPoint',
      'isHideDefaultPreset',
      'model3Name',
      'model4Name',
      'drawMjName',
      'drawingStyles',
      'showWatermark',
      'isHideTts',
    ],
  });
  Object.assign(formInline, res.data);
  if (res.data.drawingStyles) {
    drawingStyleList.value = res.data.drawingStyles.split(',');
  } else {
    drawingStyleList.value = []; // 確保drawingStyleList是一個空數組，如果沒有drawingStyles數據
  }
}

// 顯示輸入框
function showInput() {
  inputVisible.value = true;
  // 等待下次 DOM 更新後聚焦輸入框
  nextTick(() => {
    inputRef.value.focus();
  });
}

// 確認輸入
function handleInputConfirm() {
  const value = inputValue.value.trim();
  if (value) {
    drawingStyleList.value.push(value);
  }
  inputVisible.value = false;
  inputValue.value = '';
}

// 移除關鍵詞
function handleStyleRemove(index: any) {
  drawingStyleList.value.splice(index, 1);
}

// 初始化時從字串解析關鍵詞列表
function initDrawingStyles() {
  if (formInline.drawingStyles) {
    drawingStyleList.value = formInline.drawingStyles.split(',');
  }
}

function handlerUpdateConfig() {
  formInline.drawingStyles = drawingStyleList.value.join(',');
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
        <div class="flex items-center gap-4">網站顯示配置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>網站顯示配置用於控制，積分、側邊菜單、朗讀按鈕等顯示設置。</div>
          <div>同時可以按需添加繪圖風格標籤。</div>
        </div>
      </template>
      <HButton outline @click="handlerUpdateConfig">
        <SvgIcon name="i-ri:file-text-line" />
        保存設置
      </HButton>
    </PageHeader>
    <el-card style="margin: 20px">
      <el-form
        ref="formRef"
        :rules="rules"
        :model="formInline"
        label-width="150px"
      >
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="隱藏普通積分" prop="isHideModel3Point">
              <el-tooltip
                content="隱藏後用戶端將不顯示普通積分，用戶仍可以通過地址欄訪問頁面！"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.isHideModel3Point"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="普通積分名稱" prop="model3Name">
              <el-input
                v-model="formInline.model3Name"
                placeholder="普通積分名稱"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="隱藏高級積分" prop="isHideModel4Point">
              <el-tooltip
                content="隱藏後用戶端將不顯示高級積分，用戶仍可以通過地址欄訪問頁面！"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.isHideModel4Point"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="高級積分名稱" prop="model4Name">
              <el-input
                v-model="formInline.model4Name"
                placeholder="高級積分名稱"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="隱藏繪畫積分" prop="isHideDrawMjPoint">
              <el-tooltip
                content="隱藏後用戶端將不顯示繪畫積分，用戶仍可以通過地址欄訪問頁面！"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.isHideDrawMjPoint"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="繪畫積分名稱" prop="drawMjName">
              <el-input
                v-model="formInline.drawMjName"
                placeholder="繪畫積分名稱"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="顯示全局水印" prop="showWatermark">
              <el-tooltip
                content="開啟後將在對話頁顯示用戶名水印"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.showWatermark"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="隱藏首頁默認預設" prop="isHideDefaultPreset">
              <el-tooltip
                content="隱藏後首頁將不顯示默認預設"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.isHideDefaultPreset"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="隱藏朗讀按鈕" prop="isHideTts">
              <el-tooltip
                content="隱藏後用戶端將不顯示朗讀按鈕"
                placement="top"
                :show-after="500"
              >
                <el-switch
                  v-model="formInline.isHideTts"
                  active-value="1"
                  inactive-value="0"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row class="mt-2">
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="繪圖風格顯示" prop="drawingStyles">
              <div style="display: flex; flex-wrap: wrap; gap: 10px">
                <el-tag
                  v-for="(item, index) in drawingStyleList"
                  :key="index"
                  closable
                  style="margin-bottom: 10px"
                  @close="handleStyleRemove(index)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  v-if="inputVisible"
                  ref="inputRef"
                  v-model="inputValue"
                  size="small"
                  style="margin-left: 10px; width: auto; min-width: 80px"
                  @keyup.enter="handleInputConfirm"
                  @blur="handleInputConfirm"
                />
                <el-button
                  v-else
                  size="small"
                  style="margin-left: 10px"
                  @click="showInput"
                >
                  + 添加風格
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
