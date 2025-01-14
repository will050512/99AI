<script>
export default {
  mounted() {
    // 加密後的 GitHub 地址部分
    const encryptedUrl = 'Z2l0aHViLmNvbS92YXN0eGllLzk5QUk=';
    const decryptedUrl = this.decrypt(encryptedUrl);
    if (decryptedUrl) {
      // 確保跳轉到完整的 HTTPS 地址
      const fullUrl = `https://${decryptedUrl}`;
      // 在新標籤頁中打開 GitHub 頁面
      window.open(fullUrl, '_blank');
      // 返回上一級
      this.$router.go(-1);
    } else {
      console.error('解密失敗或無效的地址');
    }
  },
  methods: {
    decrypt(text) {
      try {
        return atob(text); // 使用 Base64 解碼
      } catch (error) {
        console.error('解密失敗', error);
        return '';
      }
    },
  },
};
</script>

<template>
  <div>
    <!-- 不需要顯示任何內容 -->
  </div>
</template>
