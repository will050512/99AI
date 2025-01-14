<route lang="yaml">
meta:
  title: 基礎配置
</route>

<script lang="ts" setup>
import apiConfig from '@/api/modules/config';
import { Plus, Refresh } from '@element-plus/icons-vue';
import axios from 'axios';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

const formInline = reactive({
  siteName: '',
  robotAvatar: '',
  userDefautlAvatar: '',
  filingNumber: '',
  companyName: '',
  buyCramiAddress: '',
  siteUrl: '',
  isShowAppCatIcon: '',
  clientFavoIconPath: '',
  clientLogoPath: '',
});
const rules = ref<FormRules>({
  siteName: [{ required: true, trigger: 'blur', message: '請填寫網站名稱' }],
});
const formRef = ref<FormInstance>();
// const uploadUrl = ref(`${import.meta.env.VITE_APP_API_BASEURL}/upload/file`);
const uploadUrl = ref(
  `${import.meta.env.VITE_APP_API_BASEURL}/upload/file?dir=${encodeURIComponent(
    'system/others'
  )}`
);

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({
    keys: [
      'siteName',
      'robotAvatar',
      'userDefautlAvatar',
      'filingNumber',
      'companyName',
      'isShowAppCatIcon',
      'clientLogoPath',
      'clientFavoIconPath',
      'siteUrl',
    ],
  });
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

const handleLogoSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  console.log('response: ', response.data);
  formInline.clientLogoPath = response.data;
};

async function reuploadLogo() {
  if (formInline.clientLogoPath) {
    const file = await downloadFile(formInline.clientLogoPath);
    uploadFile(file, handleLogoSuccess);
  }
}

async function reuploadFavoIcon() {
  if (formInline.clientFavoIconPath) {
    const file = await downloadFile(formInline.clientFavoIconPath);
    uploadFile(file, handleFavoIconSuccess);
  }
}

async function reuploadRobotAvatar() {
  if (formInline.robotAvatar) {
    const file = await downloadFile(formInline.robotAvatar);
    uploadFile(file, handlerobotAvatarSuccess);
  }
}

async function reuploadUserDefautlAvatar() {
  if (formInline.userDefautlAvatar) {
    const file = await downloadFile(formInline.userDefautlAvatar);
    uploadFile(file, handleuserDefautlAvatarSuccess);
  }
}

const handleFavoIconSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log('response: ', response.data);
  formInline.clientFavoIconPath = response.data;
};

const handlerobotAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log('response: ', response.data);
  formInline.robotAvatar = response.data;
};

const handleuserDefautlAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log('response: ', response.data);
  formInline.userDefautlAvatar = response.data;
};

const beforeLogoUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('當前系統僅支持 PNG、JPEG、GIF、和 WebP 格式的圖片!');
    return false;
  } else if (rawFile.size / 1024 > 300) {
    ElMessage.error('當前限制文件最大不超過 300KB!');
    return false;
  }
};

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
        <div class="flex items-center gap-4">網站基礎配置</div>
      </template>
      <template #content>
        <div class="text-sm/6">
          <div>
            網站基礎配置支持即時更新網站的主要視覺與功能元素。配置內容包括網站名稱、備案號、版權資訊、LOGO與ICO、默認AI頭像與用戶頭像，以及首頁設置等。
          </div>
          <div>請認真填寫各項配置，確保提供給用戶的資訊準確無誤。</div>
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
            <el-form-item label="網站名稱" prop="siteName">
              <el-input
                v-model="formInline.siteName"
                placeholder="網站名稱"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="網站地址" prop="siteUrl">
              <el-input
                v-model="formInline.siteUrl"
                placeholder="網站地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="公司/組織名稱" prop="companyName">
              <el-input
                v-model="formInline.companyName"
                placeholder="填入具體的公司或組織名稱"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="網站備案號" prop="filingNumber">
              <el-input
                v-model="formInline.filingNumber"
                placeholder="填寫網站備案資訊的備案號"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="用戶端LOGO" prop="clientLogoPath">
              <el-input
                v-model="formInline.clientLogoPath"
                placeholder="請填寫或上傳網站 LOGO 圖片 URL"
                clearable
              >
                <template #append>
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-success="handleLogoSuccess"
                    :before-upload="beforeLogoUpload"
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    "
                  >
                    <img
                      v-if="formInline.clientLogoPath"
                      :src="formInline.clientLogoPath"
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
                    v-if="formInline.clientLogoPath"
                    @click="reuploadLogo"
                    style="margin-left: 35px; width: 1rem"
                  >
                    <Refresh />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="網站 ico" prop="clientFavoIconPath">
              <el-input
                v-model="formInline.clientFavoIconPath"
                placeholder="請填寫或上傳網站 ico URL"
                clearable
              >
                <template #append>
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-success="handleFavoIconSuccess"
                    :before-upload="beforeLogoUpload"
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    "
                  >
                    <img
                      v-if="formInline.clientFavoIconPath"
                      :src="formInline.clientFavoIconPath"
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
                    v-if="formInline.clientFavoIconPath"
                    @click="reuploadFavoIcon"
                    style="margin-left: 35px; width: 1rem"
                  >
                    <Refresh />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="AI頭像" prop="robotAvatar">
              <el-input
                v-model="formInline.robotAvatar"
                placeholder="請填寫或上傳網站 AI 頭像 URL、為空將根據模型自動顯示"
                clearable
              >
                <template #append>
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-success="handlerobotAvatarSuccess"
                    :before-upload="beforeLogoUpload"
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    "
                  >
                    <img
                      v-if="formInline.robotAvatar"
                      :src="formInline.robotAvatar"
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
                    v-if="formInline.robotAvatar"
                    @click="reuploadRobotAvatar"
                    style="margin-left: 35px; width: 1rem"
                  >
                    <Refresh />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="用戶默認頭像" prop="userDefautlAvatar">
              <el-input
                v-model="formInline.userDefautlAvatar"
                placeholder="請填寫或上傳網站新用戶默認的頭像 URL"
                clearable
              >
                <template #append>
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-success="handleuserDefautlAvatarSuccess"
                    :before-upload="beforeLogoUpload"
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    "
                  >
                    <img
                      v-if="formInline.userDefautlAvatar"
                      :src="formInline.userDefautlAvatar"
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
                    v-if="formInline.userDefautlAvatar"
                    @click="reuploadUserDefautlAvatar"
                    style="margin-left: 35px; width: 1rem"
                  >
                    <Refresh />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
