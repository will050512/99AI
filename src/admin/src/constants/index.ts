export const USER_STATUS_OPTIONS = [
  { value: 0, label: '待激活' },
  { value: 1, label: '正常' },
  { value: 2, label: '已封禁' },
  { value: 3, label: '黑名單' },
];

export const USER_STATUS_MAP = {
  0: '待激活',
  1: '正常',
  2: '已封禁',
  3: '黑名單',
};

export const USER_STATUS_TYPE_MAP = {
  0: 'info',
  1: 'success',
  2: 'danger',
  3: 'danger',
} as const;

export type UserStatus = keyof typeof USER_STATUS_TYPE_MAP;

// 充值類型map 1: 註冊贈送  2: 受邀請贈送  3: 邀請人贈送  4: 購買套餐贈送  5: 管理員贈送 6：掃碼支付 7: 繪畫失敗退款 8: 簽到獎勵
export const RECHARGE_TYPE_MAP = {
  1: '註冊贈送',
  2: '受邀請贈送',
  3: '邀請人贈送',
  4: '購買套餐贈送',
  5: '管理員贈送',
  6: '掃碼支付',
  7: '繪畫失敗退款',
  8: '簽到獎勵',
};

// 充值數組
export const RECHARGE_TYPE_OPTIONS = [
  { value: 1, label: '註冊贈送' },
  { value: 2, label: '受邀請贈送' },
  { value: 3, label: '邀請人贈送' },
  { value: 4, label: '購買套餐贈送' },
  { value: 5, label: '管理員贈送' },
  { value: 6, label: '掃碼支付' },
  { value: 7, label: '繪畫失敗退款' },
  { value: 8, label: '簽到獎勵' },
];

// 是否開啟額外贈送
export const IS_OPTIONS = {
  0: '關閉',
  1: '開啟',
};

// 是否開啟額外贈送類型
export const IS_TYPE_MAP = {
  0: 'danger',
  1: 'success',
};

export const PACKAGE_TYPE_OPTIONS = [
  { value: 0, label: '禁用' },
  { value: 1, label: '啟動' },
];

// 扣費形式 1： 按次數扣費 2：按Token扣費
export const DEDUCTION_TYPE_OPTIONS = [
  { value: 1, label: '按次數扣費' },
  { value: 2, label: '按Token扣費' },
];

// 扣費形式 map
export const DEDUCTION_TYPE_MAP = {
  1: '按次數扣費',
  2: '按Token扣費',
};

export const CRAMI_STATUS_OPTIONS = [
  { value: 0, label: '未使用' },
  { value: 1, label: '已使用' },
];

//  圖片推薦狀態0未推薦1已推薦
export const RECOMMEND_STATUS_OPTIONS = [
  { value: 0, label: '未推薦' },
  { value: 1, label: '已推薦' },
];

// 0 禁用  1 啟用
export const ENABLE_STATUS_OPTIONS = [
  { value: 0, label: '禁用' },
  { value: 1, label: '啟用' },
  { value: 3, label: '待審核' },
  { value: 4, label: '拒絕共享' },
  { value: 5, label: '通過共享' },
];

// 問題狀態 0 未解決 1 已解決
export const QUESTION_STATUS_OPTIONS = [
  { value: '0', label: '未啟用' },
  { value: '1', label: '已啟用' },
];

// 問題狀態 0 未解決 1 已解決
export const ORDER_STATUS_OPTIONS = [
  { value: 0, label: '待審核' },
  { value: 1, label: '已通過' },
  { value: -1, label: '已拒絕' },
];

//  0：未推薦   1：已推薦  數組
export const RECOMMEND_STATUS = [
  { value: 0, label: '未推薦' },
  { value: 1, label: '已推薦' },
];

// 提現渠道 支付寶 微信
export const WITHDRAW_CHANNEL_OPTIONS = [
  { value: 1, label: '支付寶' },
  { value: 2, label: '微信' },
];

// 1 排隊中 2 處理中 3 已完成 4 失敗 5 超時
export const WITHDRAW_STATUS_OPTIONS = [
  { value: 1, label: '正在排隊' },
  { value: 2, label: '正在繪製' },
  { value: 3, label: '繪製完成' },
  { value: 4, label: '繪製失敗' },
  { value: 5, label: '繪製超時' },
];

// 0 禁用 warning 1啟用 狀態 success
export const ENABLE_STATUS_TYPE_MAP: QuestionStatusMap = {
  0: 'danger',
  1: 'success',
};

interface QuestionStatusMap {
  [key: number]: string;
}

// 問題狀態 0 未解決 1 已解決 映射
export const QUESTION_STATUS_MAP: QuestionStatusMap = {
  '-1': '欠費鎖定',
  '0': '未啟用',
  '1': '已啟用',
  '3': '待審核',
  '4': '拒絕共享',
  '5': '通過共享',
};

// 問題狀態 0 被封號 1 正常 映射
export const KEY_STATUS_MAP: QuestionStatusMap = {
  0: '被封禁',
  1: '工作中',
};

// 模型列表
export const MODEL_LIST = [
  // GPT-3.5
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo-instruct',
  'o1-mini',
  'o1-preview',
  // GPT-4
  'gpt-4',
  'gpt-4o',
  'gpt-4o-2024-05-13',
  'gpt-4o-2024-08-06',
  'gpt-4o-mini',
  'gpt-4o-mini-2024-07-18',
  'gpt-4o-mini-2024-07-18',
  'gpt-4-turbo',
  'gpt-4-turbo-2024-04-09',
  'gpt-4-all',
  // claude
  'claude-2',
  'claude-3-sonnet-20240229',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
  'claude-3-5-sonnet-20240620',
  // gemini
  'gemini-pro',
  'gemini-pro-vision',
  'gemini-pro-1.5',
  // 百度文心
  'ERNIE-Bot',
  'ERNIE-Bot-4',
  'ERNIE-3.5-8K',
  'ERNIE-Bot-turbo',
  // 阿里通義
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
  'qwen-max-1201',
  'qwen-max-longcontext',
  // 騰訊混元
  'hunyuan',
  // 清華智譜
  'chatglm_turbo',
  'chatglm_pro',
  'chatglm_std',
  'chatglm_lite',
  'glm-3-turbo',
  'glm-4',
  'glm-4v',
  // 百川智能
  'Baichuan2-53B',
  'Baichuan2-Turbo',
  'Baichuan2-Turbo-192k',
  // 零一萬物
  'yi-34b-chat-0205',
  'yi-34b-chat-200k',
  'yi-vl-plus',
  // 360 智腦
  '360GPT_S2_V9',
  // 訊飛星火
  'SparkDesk',
  'SparkDesk-v1.1',
  'SparkDesk-v2.1',
  'SparkDesk-v3.1',
  'SparkDesk-v3.5',
  // deepseek
  'deepseek-chat',
  'deepseek-coder',
  // moonshot
  'moonshot-v1-8k',
  'moonshot-v1-32k',
  'moonshot-v1-128k',
  // DALL-E
  'dall-e-3',
  // Midjourney
  'midjourney',
  // 特殊模型
  'luma-video',
  'flux-draw',
  'cog-video',
  'tts-1',
  'gpts',
  'stable-diffusion',
  'suno-music',
];

// 模型列表 0 mj   1 Dall-e
export const DRAW_MODEL_LIST = [
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'stable-diffusion', label: 'Stable-Diffusion' },
  { value: 'dall-e-3', label: 'Dall-e-3' },
];
// 支付狀態列表  status 0：未支付、1：已支付、2、支付失敗、3：支付超時
export const PAY_STATUS_OPTIONS = [
  { value: 0, label: '未支付' },
  { value: 1, label: '已支付' },
  { value: 2, label: '支付失敗' },
  { value: 3, label: '支付超時' },
];

//  支付狀態  status 0：未支付、1：已支付、2、支付失敗、3：支付超時
export const PAY_STATUS_MAP: QuestionStatusMap = {
  0: '未支付',
  1: '已支付',
  2: '支付失敗',
  3: '支付超時',
};

// 平臺列表 epay: 易支付  hupi：虎皮椒 ltzf：藍兔支付
export const PAY_PLATFORM_LIST = [
  { value: 'epay', label: '易支付' },
  { value: 'hupi', label: '虎皮椒' },
  { value: 'wechat', label: '微信支付' },
  { value: 'mpay', label: '碼支付' },
  { value: 'ltzf', label: '藍兔支付' },
];

// 支付對應
export const PAY_PLATFORM_MAP = {
  epay: '易支付',
  hupi: '虎皮椒',
  wechat: '微信支付',
  mpay: '碼支付',
  ltzf: '藍兔支付',
};

//  繪畫狀態  1: 等待中 2: 繪製中 3: 繪製完成 4: 繪製失敗 5: 繪製超時
export const DRAW_MJ_STATUS_LIST = [
  { value: 1, label: '等待中' },
  { value: 2, label: '繪製中' },
  { value: 3, label: '繪製完成' },
  { value: 4, label: '繪製失敗' },
  { value: 5, label: '繪製超時' },
];

// App角色 系統 system  用戶 user
export const APP_ROLE_LIST = [
  { value: 'system', label: '系統' },
  { value: 'user', label: '用戶' },
];

// 繪畫狀態 1：排隊中 2：繪製中 3：繪製完成 4：繪製失敗 5：繪製超時
export const DRAW_STATUS_MAP = {
  1: '排隊中',
  2: '繪製中',
  3: '繪製完成',
  4: '繪製失敗',
  5: '繪製超時',
};

export const TYPEORIGINLIST = [
  { value: '百度雲檢測', label: '百度雲檢測' },
  { value: '自定義檢測', label: '自定義檢測' },
];

export const MODELTYPELIST = [
  { value: 1, label: '基礎對話' },
  { value: 2, label: '創意模型' },
  { value: 3, label: '特殊模型' },
];

export const MODELTYPEMAP = {
  1: '基礎對話',
  2: '創意模型',
  3: '特殊模型',
};

export const MODELSMAPLIST = {
  1: [
    // GPT-3.5
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-instruct',
    'o1-mini',
    'o1-preview',
    // GPT-4
    'gpt-4',
    'gpt-4o',
    'gpt-4o-2024-05-13',
    'gpt-4o-2024-08-06',
    'gpt-4o-mini',
    'gpt-4o-mini-2024-07-18',
    'gpt-4o-mini-2024-07-18',
    'gpt-4-turbo',
    'gpt-4-turbo-2024-04-09',
    'gpt-4-all',
    // claude
    'claude-2',
    'claude-3-sonnet-20240229',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
    'claude-3-5-sonnet-20240620',
    // gemini
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-pro-1.5',
    // 百度文心
    'ERNIE-Bot',
    'ERNIE-Bot-4',
    'ERNIE-3.5-8K',
    'ERNIE-Bot-turbo',
    // 阿里通義
    'qwen-turbo',
    'qwen-plus',
    'qwen-max',
    'qwen-max-1201',
    'qwen-max-longcontext',
    // 騰訊混元
    'hunyuan',
    // 清華智譜
    'chatglm_turbo',
    'chatglm_pro',
    'chatglm_std',
    'chatglm_lite',
    'glm-3-turbo',
    'glm-4',
    'glm-4v',
    // 百川智能
    'Baichuan2-53B',
    'Baichuan2-Turbo',
    'Baichuan2-Turbo-192k',
    // 零一萬物
    'yi-34b-chat-0205',
    'yi-34b-chat-200k',
    'yi-vl-plus',
    // 360 智腦
    '360GPT_S2_V9',
    // 訊飛星火
    'SparkDesk',
    'SparkDesk-v1.1',
    'SparkDesk-v2.1',
    'SparkDesk-v3.1',
    'SparkDesk-v3.5',
    // deepseek
    'deepseek-chat',
    'deepseek-coder',
    // moonshot
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k',
  ],
  2: [
    'dall-e-3',
    'midjourney',
    'stable-diffusion',
    'suno-music',
    'luma-video',
    'flux-draw',
    'cog-video',
  ],
  3: ['tts-1', 'gpts'],
};

/* 扣費類型  普通餘額還是高級餘額 */
export const DEDUCTTYPELIST = [
  { value: 1, label: '普通積分' },
  { value: 2, label: '高級積分' },
  { value: 3, label: '繪畫積分' },
];
