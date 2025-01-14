#!/bin/bash

set -e

# 配置
pnpm config set save-exact true

# 清理函数
clean_build() {
  echo "清理旧的构建文件..."
  rm -rf admin/dist chat/dist service/dist
}

# 构建函数
build_project() {
  local project=$1
  echo "开始构建 $project..."
  cd $project/
  pnpm install || { echo "$project 安装依赖失败"; exit 1; }
  pnpm build || { echo "$project 构建失败"; exit 1; }
  cd ..
  echo "$project 构建完成"
}

# 主流程
clean_build

build_project admin
build_project chat
build_project service

# 准备目标目录
echo "准备目标目录..."
rm -rf ../dist/* ../public/admin/* ../public/chat/*
mkdir -p ../dist ../public/admin ../public/chat

# 复制构建产物
echo "复制构建产物..."
cp service/package.json ../package.json
cp -r service/dist/* ../dist
cp -r admin/dist/* ../public/admin
cp -r chat/dist/* ../public/chat

echo "打包完成!"
