import {
  fetchCreateGroupAPI,
  fetchDelAllGroupAPI,
  fetchDelGroupAPI,
  fetchQueryGroupAPI,
  fetchUpdateGroupAPI,
} from '@/api/group';
import { defineStore } from 'pinia';
import { getLocalState, setLocalState } from './helper';

import {
  fetchDelChatLogAPI,
  fetchDelChatLogByGroupIdAPI,
  fetchDeleteGroupChatsAfterIdAPI,
  fetchQueryChatLogListAPI,
} from '@/api/chatLog';
import { fetchModelBaseConfigAPI } from '@/api/models';
import { fetchQueryPluginsAPI } from '@/api/plugin';

export const useChatStore = defineStore('chat-store', {
  state: (): Chat.ChatState => getLocalState(),

  getters: {
    /* 當前選用模型的配置 */
    activeConfig: (state) => {
      const uuid = state.active;
      if (!uuid) return {};
      const config = state.groupList.find((item) => item.uuid === uuid)?.config;
      const parsedConfig = config ? JSON.parse(config) : state.baseConfig;

      return parsedConfig;
    },

    activeGroupAppId: (state) => {
      const uuid = state.active;
      if (!uuid) return null;
      return state.groupList.find((item) => item.uuid === uuid)?.appId;
    },

    activeGroupFileUrl: (state) => {
      const uuid = state.active;
      if (!uuid) return null;
      return state.groupList.find((item) => item.uuid === uuid)?.fileUrl;
    },

    /* 當前選用模型的名稱 */
    activeModel(state) {
      return this.activeConfig?.modelInfo?.model;
    },

    /* 當前選用模型的名稱 */
    activeModelName(state) {
      return this.activeConfig?.modelInfo?.modelName;
    },

    /* 當前選用模型的名稱 */
    activeModelAvatar(state) {
      return this.activeConfig?.modelInfo?.modelAvatar;
    },

    /* 當前選用模型的扣費類型 */
    activeModelDeductType(state) {
      return this.activeConfig?.modelInfo?.deductType;
    },

    /* 當前選用模型的模型類型 */
    activeModelKeyType(state) {
      return this.activeConfig?.modelInfo?.keyType;
    },

    /* 當前選用模型支持上傳文件的格式 */
    activeModelFileUpload(state) {
      return this.activeConfig?.modelInfo?.isFileUpload;
    },

    /* 當前選用模型的調用價格 */
    activeModelPrice(state) {
      return this.activeConfig?.modelInfo?.deduct;
    },
  },

  actions: {
    /* 查詢外掛列表 */
    async queryPlugins() {
      try {
        const res: any = await fetchQueryPluginsAPI();
        if (res.success && res.code === 200) {
          // 過濾掉不啟用的外掛並只保留需要的字段
          this.pluginList = res.data.rows
            .filter((plugin: any) => plugin.isEnabled === 1)
            .map((plugin: any) => ({
              pluginId: plugin.id,
              pluginName: plugin.name,
              description: plugin.description,
              pluginImg: plugin.pluginImg,
              parameters: plugin.parameters,
              deductType: plugin.deductType,
            }));
        } else {
        }
      } catch (error) {}
    },

    /* 對話組過濾 */
    setGroupKeyWord(keyWord: string) {
      this.groupKeyWord = keyWord;
    },

    /* 計算拿到當前選擇的對話組資訊 */
    getChatByGroupInfo() {
      if (this.active)
        return this.groupList.find((item) => item.uuid === this.active);
    },

    /*  */
    getConfigFromUuid(uuid: any) {
      return this.groupList.find((item) => item.uuid === uuid)?.config;
    },

    /* 新增新的對話組 */
    async addNewChatGroup(appId = 0, modelConfig?: any, params?: string) {
      try {
        const res: any = await fetchCreateGroupAPI({
          appId,
          modelConfig,
          params,
        });
        this.active = res.data.id;
        await this.queryMyGroup();
        await this.setActiveGroup(res.data.id);
      } catch (error) {
        console.error('新增對話組時出錯:', error);
      }
    },

    /* 查詢基礎模型配置  */
    async getBaseModelConfig() {
      const res = await fetchModelBaseConfigAPI();
      this.baseConfig = res?.data;
    },

    /* 查詢我的對話組 */
    async queryMyGroup() {
      const res: any = await fetchQueryGroupAPI();
      this.groupList = [
        ...res.data.map((item: any) => {
          const {
            id: uuid,
            title,
            isSticky,
            createdAt,
            updatedAt,
            appId,
            config,
            appLogo,
            isFixedModel,
            isGpts,
            params,
            fileUrl,
          } = item;
          return {
            uuid,
            title,
            isEdit: false,
            appId,
            config,
            isSticky,
            appLogo,
            createdAt,
            isFixedModel,
            isGpts,
            params,
            fileUrl,
            updatedAt: new Date(updatedAt).getTime(),
          };
        }),
      ];

      const isHasActive = this.groupList.some(
        (item: { uuid: any }) => Number(item.uuid) === Number(this.active)
      );
      if (!this.active || !isHasActive) {
        this.groupList.length && this.setActiveGroup(this.groupList[0].uuid);
      }
      // 如果 groupList 為空，新建一個對話組
      if (this.groupList.length === 0) {
        await this.addNewChatGroup();
      }
      this.recordState();
    },

    /* 修改對話組資訊 */
    async updateGroupInfo(params: {
      groupId: number;
      title?: string;
      isSticky?: boolean;
      fileUrl?: string;
    }) {
      await fetchUpdateGroupAPI(params);
      await this.queryMyGroup();
    },

    /* 變更對話組 */
    // 設置當前激活的對話組
    async setActiveGroup(uuid: number) {
      // this.chatList = [];
      // 將當前激活的對話組ID設置為傳入的uuid
      this.active = uuid;

      // 如果當前有激活的對話組，則查詢該對話組的聊天記錄列表

      // 將所有對話組的編輯狀態設置為false
      this.groupList.forEach((item) => (item.isEdit = false));

      if (this.active) {
        await this.queryActiveChatLogList();
      } else {
        this.chatList = [];
      }
      // 記錄當前狀態
      this.recordState();
    },

    /* 刪除對話組 */
    async deleteGroup(params: Chat.History) {
      const curIndex = this.groupList.findIndex(
        (item) => item.uuid === params.uuid
      );
      const { uuid: groupId } = params;
      await fetchDelGroupAPI({ groupId });
      await this.queryMyGroup();
      if (this.groupList.length === 0) await this.setActiveGroup(0);

      if (curIndex > 0 && curIndex < this.groupList.length)
        await this.setActiveGroup(this.groupList[curIndex].uuid);

      if (curIndex === 0 && this.groupList.length > 0)
        await this.setActiveGroup(this.groupList[0].uuid);

      if (
        curIndex > this.groupList.length ||
        (curIndex === 0 && this.groupList.length === 0)
      )
        await this.setActiveGroup(0);

      if (curIndex > 0 && curIndex === this.groupList.length)
        await this.setActiveGroup(this.groupList[curIndex - 1].uuid);

      this.recordState();
    },

    /* 刪除全部非置頂對話組 */
    async delAllGroup() {
      if (!this.active || !this.groupList.length) return;
      await fetchDelAllGroupAPI();
      await this.queryMyGroup();
      if (this.groupList.length === 0) await this.setActiveGroup(0);
      else await this.setActiveGroup(this.groupList[0].uuid);
    },

    // /* 查詢當前對話組的聊天記錄 */
    // async queryActiveChatLogList() {
    //   if (!this.active || Number(this.active) === 0) return;
    //   const res: any = await fetchQueryChatLogListAPI({ groupId: this.active });
    //   this.chatList = res.data;
    //   this.recordState();
    // },

    /* 查詢當前對話組的聊天記錄 */
    async queryActiveChatLogList() {
      if (!this.active || Number(this.active) === 0) return;
      try {
        const res: any = await fetchQueryChatLogListAPI({
          groupId: this.active,
        });
        if (res && res.data) {
          this.chatList = res.data;
        } else {
          this.chatList = [];
        }
      } catch (error) {
        console.error('Error fetching chat log list:', error);
        this.chatList = [];
      }
      this.recordState();
    },

    /* 添加一條虛擬的對話記錄 */
    addGroupChat(data: Chat.Chat) {
      this.chatList = [...this.chatList, data];
    },

    /* 動態修改對話記錄 */
    updateGroupChat(index: number, data: Chat.Chat) {
      this.chatList[index] = { ...this.chatList[index], ...data };
    },

    /* 修改其中部分內容 */
    updateGroupChatSome(index: number, data: Partial<Chat.Chat>) {
      this.chatList[index] = { ...this.chatList[index], ...data };
    },

    /* 刪除一條對話記錄 */
    async deleteChatById(chatId: number | undefined) {
      if (!chatId) return;
      await fetchDelChatLogAPI({ id: chatId });
      await this.queryActiveChatLogList();
    },

    /* 刪除一條對話記錄 */
    async deleteChatsAfterId(chatId: number | undefined) {
      if (!chatId) return;
      await fetchDeleteGroupChatsAfterIdAPI({ id: chatId });
      await this.queryActiveChatLogList();
    },

    /* 設置使用上下文 */
    setUsingContext(context: boolean) {
      this.usingContext = context;
      this.recordState();
    },

    /* 設置使用聯網 */
    setUsingNetwork(context: boolean) {
      this.usingNetwork = context;
      this.recordState();
    },

    setUsingPlugin(plugin: any) {
      // Set the current plugin to the new plugin if provided, else clear it
      this.currentPlugin = plugin || undefined;
      this.recordState(); // Record the state change
    },

    async setPrompt(prompt: string) {
      console.log('setPrompt:', prompt);
      this.prompt = prompt;
      this.recordState();
    },

    setStreamIn(isStreamIn: boolean) {
      this.isStreamIn = isStreamIn;
      this.recordState();
    },

    /* 刪除當前對話組的全部內容 */
    async clearChatByGroupId() {
      if (!this.active) return;

      await fetchDelChatLogByGroupIdAPI({ groupId: this.active });
      await this.queryActiveChatLogList();
    },

    recordState() {
      setLocalState(this.$state);
    },

    clearChat() {
      this.chatList = [];
      this.groupList = [];
      this.active = 0;
      this.recordState();
    },
  },
});
