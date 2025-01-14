# 部署指南

## Node.js 部署

### 1. 安裝 Node.js 環境

推薦使用 `nvm` (Node Version Manager) 來安裝 Node.js。

- 首先，安裝 `nvm`，你可以從 [nvm GitHub 倉庫](https://github.com/nvm-sh/nvm) 找到安裝指南。

- 按照倉庫中的安裝說明進行操作，安裝完成後，可能需要添加環境變量或重啟終端。

- 安裝 Node.js 版本 18 或更高版本:

  ```shell
  nvm install 18
  nvm use 18
  ```

- 驗證 Node.js 是否安裝成功:

  ```shell
  node -v
  ```

### 2. 安裝 PM2 / PNPM（YARN）

- 使用 npm 安裝 PM2：

  ```shell
  npm install pm2 -g
  ```

- 使用 npm 安裝 pnpm：

  ```shell
  npm install -g pnpm
  ```

- 確認 `PM2` 和 `pnpm` 都已正確安裝並且可以運行：

  ```shell
  pm2 -v
  pnpm -v
  ```

### 3. 其他配置

- 需配置 Redis 數據庫以及新建一個 MySQL 數據庫。
- 配置環境變量：
  - 複製 `.env.example` 文件為 `.env`。
  - 根據需要修改 `.env` 文件中的配置項。

完成配置並啟動後，項目會自動在指定的 MySQL 數據庫中創建所需的表結構和初始數據，無需手動導入 SQL 文件。確保 `.env` 文件中的數據庫連接資訊正確即可。

### 4. 安裝啟動

- 安裝依賴：(若安裝緩慢可嘗試使用國內源)

  ```shell
  pnpm install
  ```

- 啟動進程：（默認使用 PM2 後臺運行）

  ```shell
  pnpm start
  ```

- 查看運行日誌：

  ```shell
  pnpm logs
  ```

- 項目默認在 `9520` 端口運行，也可在環境變量中自行修改。成功運行後可通過 `IP:端口` 訪問，或者配置 Nginx 反向代理，通過網域名稱訪問。

## 腳本部署

### 功能支持

- **Node.js 全新部署**  
  自動安裝環境、生成配置、安裝依賴並啟動服務。
- **Node.js 升級**  
  拉取最新代碼，更新依賴並重啟服務。
- **Docker-compose 部署**  
  創建 MySQL、Redis 容器及 99AI 服務，支持自定義端口。
- **Docker-compose 升級**  
  停止舊版本容器，重新構建鏡像並啟動。

請在項目的根目錄下執行以下命令：

```bash
./deploy.sh
```

## Docker 部署

### 1. 安裝 Docker 及 Docker-compose

- 使用 [Docker 官網](https://www.docker.com/) 提供的一鍵安裝鏈接安裝 Docker 及 Docker-compose。

```bash
curl -fsSL https://get.docker.com | bash -s docker
```

- 也可以使用其他方式自行安裝 Docker 及 Docker-compose。

### 2. 服務管理

- **後臺啟動服務**

  ```shell
  docker-compose up -d
  ```

- **查看日誌**

  ```shell
  docker-compose logs
  ```

- **停止服務**

  ```shell
  docker-compose down
  ```

- **重新構建並啟動服務**

  ```shell
  docker-compose up -d --build
  ```

## 項目管理

普通管理員，可以預覽後臺非敏感資訊，默認不激活。請使用超級管理員賬號登入後臺，並及時修改密碼。

- **管理端地址**：`項目鏈接/admin`

- **普通管理員賬號**：`admin`（默認不激活）

- **超級管理員賬號**：`super`

- **密碼**：`123456`
