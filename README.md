# 99 AI 穩定版

可商業化的 AI Web 應用，旨在提供一個易部署、低門檻的集成化人工智能服務站點，支持多種部署方式。

為了方便用戶部署，項目已經 **打包完成**，可直接運行部署。源碼支持商用、二次開發及分發，但請保留[出處](https://github.com/vastxie/99AI)，共同維護社區生態。

**二次開發源碼** 存放於 `src` 目錄下，開發者可以根據需要自由修改和擴展。

## 項目介紹

### 主要功能

- [x] **AI 對話**：支持 OpenAI Chat 格式，後臺可自定義模型名稱、頭像、介紹、代理、key、積分扣除方式、文件上傳模式等參數。

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/dd373bec-674e-4a6c-8304-f6abd1a65e1e">

- [x] **多模態模型**：使用`gpt-4o`、`claude-3`等視覺模型，或`gpt-4-all`等逆向模型，完成圖像、文件的識別分析。

<img width="1443" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/e1f1ed62-97e5-4412-9b72-5916d2337fdc">

- [x] **全模型文件分析**

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/eedfd9fd-f3f3-4a37-8a82-b73e135e8dfe">

- [x] **代碼預覽**： `HTML` 代碼的預覽與編輯。

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/d7860dbf-0897-4f26-9d70-d304a270c05a">

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/13e558fa-62a8-4fff-9e2b-c4820acefbc4">

- [x] **聯網搜索**：對接[外掛系統](https://github.com/vastxie/99AIPlugin)，拓展 AI 功能邊界。

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/6ad1bcbb-ac6b-4478-9d91-9ae8b71afa64">

- [x] **思維導圖**

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/d6eb861d-2e26-415a-acf6-e2d44fc29620">

<img width="1445" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/61f1b059-1eab-428a-91a7-3015ffdac970">

- [x] **AI 繪畫**：對接 `midjourney` 、`dall-e`、`stable-diffusion` 等繪畫模型。

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/39728c39-ed98-4d77-bee8-f7548c5f4a28">

<img width="1444" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/4a70785d-bf66-49e2-a822-5c91a68bd667">

- [x] **AI 音樂**：對接 `suno-music` 完成音樂創作。

<img width="1445" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/a2e42201-fad7-4498-9fb0-c107fcc2f683">

<img width="1446" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/62e466d0-7866-4efb-b28e-03f6b088d043">

- [x] **AI 視頻**：對接 `luma-video` 文生視頻。

<img width="1446" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/365cc93e-6fc0-4107-ac4c-6b25f31f0f12">

<img width="1443" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/734013e1-273b-4655-b18e-a8f138165130">

- [x] **知識庫預設**

<img width="1446" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/abe7fe07-535f-43cc-8bc5-5e49eb6271cf">

<img width="1442" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/330be2fc-db83-446c-8518-d97f85ef0ec4">

<img width="1443" alt="image" src="https://github.com/vastxie/99AI/assets/24899308/a341dc07-cd83-4594-bff7-c5b784f41eb1">

- [x] 更多功能持續開發中 ··· ···

## 版本說明

| 特性         | 穩定版               | 開發版                                                         |
| :----------- | :------------------- | :------------------------------------------------------------- |
| **商用許可** | 支持商用             | 支持商用                                                       |
| **源碼狀態** | 未編譯，支持自由修改 | 已編譯，代碼不可二次開發                                       |
| **獲取方式** | 公開項目             | 私有庫，需贊助後獲取                                           |
| **頁面特性** | 單對話頁面           | 包含更多功能頁面（如獨立的繪畫頁面、思維導圖頁面、分銷頁面等） |

## 部署指南

請參考完整的 [部署文檔](./DEPLOYMENT.md) 瞭解詳細資訊。

部署文檔可能不是非常詳細，但絕對夠用。如果在安裝或配置中遇到任何問題，可詢問 AI、通過 [issue](https://github.com/vastxie/99AI/issues) 反饋或交流群內提問題。

## 項目開發

請參考完整的 [開發文檔](./src/DEVELOPMENT.md) 瞭解詳細的開發流程和指引。

### 目錄結構

```plaintext
99AI/
├── DEPLOYMENT.md          # 部署文檔
├── Dockerfile             # Docker 配置文件
├── deploy.sh              # 一鍵部署腳本
├── docker-compose.yml     # Docker Compose 配置文件
├── dist/                  # 打包後的靜態資源與後端代碼
├── logs/                  # 日誌儲存目錄
├── public/                # 前端公共靜態資源
└── src/                   # 源碼目錄
    ├── admin/             # 管理端（基於 Fantastic Admin Basic 構建）
    ├── chat/              # 用戶端（用戶對話頁面）
    ├── service/           # 後端服務（基於 NestJS 構建的核心 API 服務）
    └── build.sh           # 一鍵打包腳本
```

## 學習交流

掃碼添加微信備註 `99`，拉交流群。（不接受私聊技術諮詢，有問題優先群內交流）

<img src="https://github.com/vastxie/99AI/assets/24899308/ee20578f-063d-48d8-bff6-85ac3e38fe60"
     width="300" alt="WeChat QR code for joining the group">

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=vastxie/99AI&type=Date)](https://star-history.com/#vastxie/99AI&Date)
