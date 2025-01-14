<route lang="yaml">
name: personalSetting
meta:
  title: 個人設置
  cache: personal-edit.password
</route>

<script lang="ts" setup name="PersonalSetting">
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = ref({
  headimg: '',
  mobile: '',
  name: '',
  qq: '',
  wechat: '',
})

const handleSuccess: UploadProps['onSuccess'] = (res) => {
  if (res.error === '') {
    form.value.headimg = res.data.path
  }
  else {
    ElMessage.warning(res.error)
  }
}
function editPassword() {
  router.push({
    name: 'personalEditPassword',
  })
}
</script>

<template>
  <div>
    <page-main>
      <el-tabs tab-position="left" style="height: 600px;">
        <!-- <el-tab-pane label="基本設置" class="basic">
          <h2>基本設置</h2>
          <el-row :gutter="20">
            <el-col :span="16">
              <el-form :model="form" label-width="120px" label-suffix="：">
                <el-form-item label="名 稱">
                  <el-input v-model="form.name" placeholder="請輸入你的名稱" />
                </el-form-item>
                <el-form-item label="手機號">
                  <el-input v-model="form.mobile" placeholder="請輸入你的手機號" />
                </el-form-item>
                <el-form-item label="QQ 號">
                  <el-input v-model="form.qq" placeholder="請輸入你的 QQ 號" />
                </el-form-item>
                <el-form-item label="微信號">
                  <el-input v-model="form.wechat" placeholder="請輸入你的微信號" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary">
                    保存
                  </el-button>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="8">
              <image-upload v-model:url="form.headimg" action="http://scrm.1daas.com/api/upload/upload" name="image" :data="{ token: 'TKD628431923530324' }" notip class="headimg-upload" @on-success="handleSuccess" />
            </el-col>
          </el-row>
        </el-tab-pane> -->
        <el-tab-pane label="安全設置" class="security">
          <h2>安全設置</h2>
          <div class="setting-list">
            <div class="item">
              <div class="content">
                <div class="title">
                  賬戶密碼
                </div>
                <div class="desc">
                  當前密碼強度：強
                </div>
              </div>
              <div class="action">
                <el-button type="primary" text @click="editPassword">
                  修改
                </el-button>
              </div>
            </div>
            <!-- <div class="item">
              <div class="content">
                <div class="title">
                  密保手機
                </div>
                <div class="desc">
                  已綁定手機：187****3441
                </div>
              </div>
              <div class="action">
                <el-button type="primary" text>
                  修改
                </el-button>
              </div>
            </div>
            <div class="item">
              <div class="content">
                <div class="title">
                  備用郵箱
                </div>
                <div class="desc">
                  當前未綁定備用郵箱
                </div>
              </div>
              <div class="action">
                <el-button type="primary" text>
                  綁定
                </el-button>
              </div>
            </div> -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </page-main>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-tabs) {
  .el-tabs__header .el-tabs__nav {
    .el-tabs__active-bar {
      z-index: 0;
      width: 100%;
      background-color: var(--el-color-primary-light-9);
      border-right: 2px solid var(--el-color-primary);
      transition: transform 0.3s, background-color 0.3s, var(--el-transition-border);
    }

    .el-tabs__item {
      text-align: left;
      padding-right: 100px;
    }
  }

  .el-tab-pane {
    padding: 0 20px 0 30px;
  }
}

h2 {
  margin: 0;
  margin-bottom: 30px;
  font-weight: normal;
}

.basic {
  :deep(.headimg-upload) {
    text-align: center;

    .el-upload-dragger {
      border-radius: 50%;
    }
  }
}

.security {
  .setting-list {
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      transition: var(--el-transition-border);

      .content {
        .title {
          margin-bottom: 5px;
          color: var(--el-text-color-primary);
          transition: var(--el-transition-color);
        }

        .desc {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          transition: var(--el-transition-color);
        }
      }

      &:last-child {
        border-bottom: 0;
      }
    }
  }
}
</style>
