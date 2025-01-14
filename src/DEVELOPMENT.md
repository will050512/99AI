# 99AI 項目開發指引

## 項目結構

```plaintext
src/
├── admin/                 # 管理端
├── chat/                  # 用戶端（對話頁）
├── service/               # 後端服務
└── build.sh               # 一鍵打包腳本
```

---

## 模塊說明

### 1. 用戶端（chat）

- **位置：** `src/chat`
- **功能：**
  - 使用 Vue.js 構建。
  - 支持 AI 對話、多模態分析、文件上傳與解析等用戶功能。

---

### 2. 管理端（admin）

- **位置：** `src/admin`
- **功能：**
  - 基於 [Fantastic Admin Basic](https://github.com/fantastic-admin/basic) 開源框架構建。
  - 超級管理員和普通管理員的後臺管理頁面。
  - 支持積分系統管理、模型配置、用戶管理等功能。

---

### 3. 後端服務（service）

- **位置：** `src/service`
- **功能：**
  - 提供 API 介面，負責模型調用、業務邏輯處理與數據庫交互。
  - 支持多模態模型、文件分析、用戶積分系統等功能。
  - 使用 NestJS 構建，默認運行在 `http://localhost:9520`。

---

## 一鍵打包腳本

項目提供了 `build.sh` 腳本，用於快速打包整個項目：

```bash
bash build.sh
```

執行後，所有模塊將自動構建，構建後的文件存放在項目根目錄的文件夾中。

---

如有其他問題，請查看項目根目錄的文檔或通過 [issue](https://github.com/vastxie/99AI/issues) 遞交反饋。
