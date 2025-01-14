import { t } from '@/locales'; // Ensure you have a function t for translation lookup

interface RechargeType {
  [key: number]: string
}

export const RechargeTypeMap: RechargeType = {
  1: t('rechargeTypes.1'),
  2: t('rechargeTypes.2'),
  3: t('rechargeTypes.3'),
  4: t('rechargeTypes.4'),
  5: t('rechargeTypes.5'),
  6: t('rechargeTypes.6'),
  7: t('rechargeTypes.7'),
  8: t('rechargeTypes.8'),
}

// 平臺列表
export const PAY_PLATFORM_LIST = [
  { value: 'wechat', label: '微信支付' },
  { value: 'ecpay', label: '綠界支付' },
  { value: 'epay', label: '易支付' },
  { value: 'mpay', label: '碼支付' },
  { value: 'hupi', label: '虎皮椒' },
  { value: 'ltzf', label: '藍兔支付' },
];

// 支付對應
export const PAY_PLATFORM_MAP = {
  wechat: '微信支付',
  ecpay: '綠界支付',
  epay: '易支付',
  mpay: '碼支付',
  hupi: '虎皮椒',
  ltzf: '藍兔支付',
};

export const OrderMap = {
  0: t('orderStatus.0'),
  1: t('orderStatus.1'),
  2: t('orderStatus.2'),
  3: t('orderStatus.3'),
}
