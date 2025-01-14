<script setup lang="ts">
import type { UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'FileUpload',
})

const props = withDefaults(
  defineProps<{
    action: UploadProps['action']
    headers?: UploadProps['headers']
    data?: UploadProps['data']
    name?: UploadProps['name']
    size?: number
    max?: number
    files?: UploadUserFile[]
    notip?: boolean
    ext?: string[]
  }>(),
  {
    name: 'file',
    size: 2,
    max: 3,
    files: () => [],
    notip: false,
    ext: () => ['zip', 'rar'],
  },
)

const emits = defineEmits<{
  onSuccess: [
    res: any,
    file: UploadUserFile,
    fileList: UploadUserFile[],
  ]
}>()

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const fileName = file.name.split('.')
  const fileExt = fileName.at(-1) ?? ''
  const isTypeOk = props.ext.includes(fileExt)
  const isSizeOk = file.size / 1024 / 1024 < props.size
  if (!isTypeOk) {
    ElMessage.error(`上傳文件只支持 ${props.ext.join(' / ')} 格式！`)
  }
  if (!isSizeOk) {
    ElMessage.error(`上傳文件大小不能超過 ${props.size}MB！`)
  }
  return isTypeOk && isSizeOk
}

const onExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('文件上傳超過限制')
}

const onSuccess: UploadProps['onSuccess'] = (res, file, fileList) => {
  emits('onSuccess', res, file, fileList)
}
</script>

<template>
  <ElUpload
    :headers="headers"
    :action="action"
    :data="data"
    :name="name"
    :before-upload="beforeUpload"
    :on-exceed="onExceed"
    :on-success="onSuccess"
    :file-list="files"
    :limit="max"
    drag
  >
    <div class="slot">
      <SvgIcon name="i-ep:upload-filled" class="el-icon--upload" />
      <div class="el-upload__text">
        將文件拖到此處，或<em>點擊上傳</em>
      </div>
    </div>
    <template #tip>
      <div v-if="!notip" class="el-upload__tip">
        <div style="display: inline-block;">
          <ElAlert :title="`上傳文件支持 ${ext.join(' / ')} 格式，單個文件大小不超過 ${size}MB，且文件數量不超過 ${max} 個`" type="info" show-icon :closable="false" />
        </div>
      </div>
    </template>
  </ElUpload>
</template>

<style lang="scss" scoped>
:deep(.el-upload.is-drag) {
  display: inline-block;

  .el-upload-dragger {
    padding: 0;
  }

  &.is-dragover {
    border-width: 1px;
  }

  .slot {
    width: 300px;
    padding: 40px 0;
  }
}
</style>
