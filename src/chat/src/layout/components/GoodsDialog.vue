<script setup lang="ts">
import { fetchGetPackageAPI } from '@/api/crami';
import { fetchOrderBuyAPI } from '@/api/order';
import { fetchGetJsapiTicketAPI } from '@/api/user';
import { useBasicLayout } from '@/hooks/useBasicLayout';
import { t } from '@/locales';
import { CheckOne, Close } from '@icon-park/vue-next';
import { useDialog, useMessage } from 'naive-ui';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import type { ResData } from '@/api/types';
import { useAuthStore, useGlobalStoreWithOut } from '@/store';
defineProps<Props>();
declare let WeixinJSBridge: any;
declare let wx: any;
const authStore = useAuthStore();
const useGlobalStore = useGlobalStoreWithOut();
const loading = ref(true);
const packageList = ref<Pkg[]>([]);
const message = useMessage();
const dialog = useDialog();
const dialogLoading = ref(false);
const model3Name = computed(
  () => authStore.globalConfig.model3Name || t('goods.basicModelQuota')
);
const { isMobile } = useBasicLayout();
const model4Name =
  computed(() => authStore.globalConfig.model4Name) ||
  t('goods.advancedModelQuota');
const drawMjName =
  computed(() => authStore.globalConfig.drawMjName) || t('goods.drawingQuota');
const isHideModel3Point = computed(
  () => Number(authStore.globalConfig.isHideModel3Point) === 1
);
const isHideModel4Point = computed(
  () => Number(authStore.globalConfig.isHideModel4Point) === 1
);
const isHideDrawMjPoint = computed(
  () => Number(authStore.globalConfig.isHideDrawMjPoint) === 1
);
const isWxEnv = computed(() => {
  const ua = window.navigator.userAgent.toLowerCase();
  return (
    ua.match(/MicroMessenger/i) &&
    ua?.match(/MicroMessenger/i)?.[0] === 'micromessenger'
  );
});
const payPlatform = computed(() => {
  const {
    payHupiStatus,
    payEpayStatus,
    payMpayStatus,
    payWechatStatus,
    payLtzfStatus,
  } = authStore.globalConfig;
  if (Number(payWechatStatus) === 1) return 'wechat';

  if (Number(payMpayStatus) === 1) return 'mpay';

  if (Number(payHupiStatus) === 1) return 'hupi';

  if (Number(payEpayStatus) === 1) return 'epay';

  if (Number(payLtzfStatus) === 1) return 'ltzf';

  return null;
});

const payChannel = computed(() => {
  const { payEpayChannel, payMpayChannel } = authStore.globalConfig;
  if (payPlatform.value === 'mpay')
    return payMpayChannel ? JSON.parse(payMpayChannel) : [];

  if (payPlatform.value === 'epay')
    return payEpayChannel ? JSON.parse(payEpayChannel) : [];

  if (payPlatform.value === 'wechat') return ['wxpay'];

  if (payPlatform.value === 'hupi') return ['wxpay'];

  if (payPlatform.value === 'ltzf') return ['wxpay'];

  return [];
});

interface Props {
  visible: boolean;
}

interface Pkg {
  id: number;
  name: string;
  coverImg: string;
  des: string;
  price: number;
  model3Count: number;
  model4Count: number;
  drawMjCount: number;
  extraReward: number;
  extraPaintCount: number;
  createdAt: Date;
}

onMounted(() => {
  openDrawerAfter();
  if (isWxEnv.value) jsapiInitConfig();
});

onBeforeUnmount(() => {
  packageList.value = [];
  loading.value = true;
});

/* 微信環境jsapi註冊 */
async function jsapiInitConfig() {
  const url = window.location.href.replace(/#.*$/, '');
  const res: ResData = await fetchGetJsapiTicketAPI({ url });
  const { appId, nonceStr, timestamp, signature } = res.data;
  if (!appId) return;

  wx.config({
    debug: false, // 開啟調試模式,調用的所有api的返回值會在客戶端alert出來，若要查看傳入的參數，可以在pc端打開，參數資訊會通過log打出，僅在pc端時才會打印。
    appId, // 必填，公眾號的唯一標識
    timestamp, // 必填，生成簽名的時間戳
    nonceStr, // 必填，生成簽名的隨機串
    signature, // 必填，簽名
    jsApiList: ['chooseWXPay'], // 必填，需要使用的JS介面列表
  });
  wx.ready(() => {});
  wx.error(() => {});
}

function onBridgeReady(data: {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}) {
  const { appId, timeStamp, nonceStr, package: pkg, signType, paySign } = data;
  WeixinJSBridge.invoke(
    'getBrandWCPayRequest',
    {
      appId, // 公眾號ID，由商戶傳入
      timeStamp, // 時間戳，自1970年以來的秒數
      nonceStr, // 隨機串
      package: pkg,
      signType, // 微信簽名方式：
      paySign, // 微信簽名
    },
    (res: any) => {
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        message.success(t('goods.purchaseSuccess'));
        setTimeout(() => {
          authStore.getUserInfo();
          useGlobalStore.updateGoodsDialog(false);
        }, 500);
      } else {
        message.success(t('goods.paymentNotSuccessful'));
      }
    }
  );
}

// async function handleBuyGoods(pkg: Pkg) {
//   if (dialogLoading.value) return;

//   // 如果是微信環境判斷有沒有開啟微信支付,開啟了則直接調用jsapi支付即可
//   if (
//     isWxEnv.value &&
//     payPlatform.value === 'wechat' &&
//     Number(authStore.globalConfig.payWechatStatus) === 1
//   ) {
//     if (typeof WeixinJSBridge == 'undefined') {
//       if (document.addEventListener) {
//         document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
//       } else if (document.attachEvent) {
//         document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
//         document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
//       }
//     } else {
//       const res: ResData = await fetchOrderBuyAPI({
//         goodsId: pkg.id,
//         payType: 'jsapi',
//       });
//       const { success, data } = res;
//       success && onBridgeReady(data);
//     }
//     return;
//   }

//   /* 其他場景打開支付視窗 */
//   useGlobalStore.updateOrderInfo({ pkgInfo: pkg });
//   useGlobalStore.updateGoodsDialog(false);
//   useGlobalStore.updatePayDialog(true);
//   // dialogLoading.value = true
//   // const { id: goodsId, name, des } = pkg
//   // try {
//   //   /* 如果在微信環境 則微信官方支付渠道為jsapi支付 */
//   //   if (payPlatform.value === 'wechat')
//   //     payType = isWxEnv.value ? 'jsapi' : 'native'

//   //   const res: ResData = await fetchOrderBuyAPI({ goodsId, payType })
//   //   dialogLoading.value = false
//   //   const { success, data } = res
//   //   if (success) {
//   //     /* 如果是微信環境並且開啟了微信登錄則調用jsapi支付 */
//   //     if (isWxEnv.value && payPlatform.value === 'wechat') {
//   //       if (typeof WeixinJSBridge == 'undefined') {
//   //         if (document.addEventListener) {
//   //           document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
//   //         }
//   //         else if (document.attachEvent) {
//   //           document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
//   //           document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
//   //         }
//   //       }
//   //       else {
//   //         onBridgeReady(data)
//   //       }
//   //       return
//   //     }

//   //     useGlobalStore.updateOrderInfo({ ...data, pkgInfo: pkg })
//   //     useGlobalStore.updateGoodsDialog(false)
//   //     const { isRedirect, redirectUrl } = data
//   //     if (isRedirect)
//   //       window.open(redirectUrl)

//   //     else
//   //       useGlobalStore.updatePayDialog(true)
//   //   }
//   // }
//   // catch (error) {
//   //   dialogLoading.value = false
//   // }
// }

async function handleBuyGoods(pkg: Pkg) {
  if (dialogLoading.value) return;

  // 判斷是否是微信移動端環境
  function isWxMobileEnv() {
    const ua = window.navigator.userAgent.toLowerCase();
    // 微信環境
    const isWxEnv = ua.indexOf('micromessenger') !== -1;
    // 非PC端
    const isMobile =
      ua.indexOf('windows') === -1 && ua.indexOf('macintosh') === -1;
    return isWxEnv && isMobile;
  }

  // 如果是微信環境判斷有沒有開啟微信支付，開啟了則直接調用jsapi支付即可
  if (
    isWxMobileEnv() && // 使用新函數來判斷微信移動端環境
    payPlatform.value === 'wechat' &&
    Number(authStore.globalConfig.payWechatStatus) === 1
  ) {
    if (typeof WeixinJSBridge == 'undefined') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    } else {
      const res: ResData = await fetchOrderBuyAPI({
        goodsId: pkg.id,
        payType: 'jsapi',
      });
      const { success, data } = res;
      success && onBridgeReady(data);
    }
    return;
  }

  /* 其他場景打開支付視窗 */
  useGlobalStore.updateOrderInfo({ pkgInfo: pkg });
  useGlobalStore.updateGoodsDialog(false);
  useGlobalStore.updatePayDialog(true);
}

async function openDrawerAfter() {
  loading.value = true;
  try {
    const res: ResData = await fetchGetPackageAPI({ status: 1, size: 30 });
    packageList.value = res.data.rows;
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}

const selectName = ref('');
const handleSelect = (item) => {
  selectName.value = item.name;
};

// function handleSuccess(pkg: Pkg) {
//   const { name } = pkg;
//   dialog.success({
//     title: t('goods.orderConfirmationTitle'),
//     content: t('goods.orderConfirmationContent') + name,
//     negativeText: t('goods.thinkAgain'),
//     positiveText: t('goods.confirmPurchase'),
//     onPositiveClick: () => {
//       if (!payChannel.value.length)
//         message.warning(t('goods.paymentNotEnabled'));

//       handleBuyGoods(pkg);
//     },
//   });
// }

function handleSuccess(pkg: Pkg) {
  // 檢查支付渠道是否啟用
  if (!payChannel.value.length) {
    message.warning(t('goods.paymentNotEnabled'));
    return;
  }

  // 直接處理購買邏輯
  handleBuyGoods(pkg);
}

function splitDescription(description: string) {
  return description.split('\n');
}
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white dark:bg-gray-900 flex flex-col relative"
        :class="
          isMobile
            ? ' w-full h-full'
            : 'max-h-[80vh] rounded-lg shadow-lg w-full max-w-7xl p-4 mx-2 '
        "
      >
        <div class="flex justify-between items-center p-3">
          <span class="text-xl font-bold">{{ t('goods.selectProducts') }}</span>
          <Close
            size="18"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            @click="useGlobalStore.updateGoodsDialog(false)"
          />
        </div>
        <div
          class="w-full overflow-y-auto p-4 mx-auto m-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <div
            v-for="(item, index) in packageList"
            :key="index"
            :class="[
              item.name == selectName
                ? 'ring-2 ring-indigo-500 shadow-md'
                : 'ring-2 ring-gray-200 dark:ring-gray-800 ',
              'rounded-lg p-8 hover:shadow-md',
            ]"
            @click="handleSelect(item)"
          >
            <div class="relative">
              <b class="text-lg font-semibold leading-8">{{ item.name }}</b>
            </div>
            <div
              v-if="!isHideModel3Point"
              class="flex justify-between items-end min-h-28"
            >
              <span class="text-sm font-bold mr-1 w-[120px]">{{
                model3Name
              }}</span>
              <span class="font-bold">
                <!-- 條件判斷：當 model3Count > 99999 時顯示 "無限額度"，否則顯示實際值 -->
                {{ item.model3Count > 99999 ? '無限額度' : item.model3Count }}
              </span>
            </div>
            <div
              v-if="!isHideModel4Point"
              class="flex justify-between items-end min-h-28"
            >
              <span class="text-sm font-bold mr-1 w-[120px]">{{
                model4Name
              }}</span>
              <span class="font-bold">
                <!-- 條件判斷：當 model4Count > 99999 時顯示 "無限額度"，否則顯示實際值 -->
                {{ item.model4Count > 99999 ? '無限額度' : item.model4Count }}
              </span>
            </div>
            <div
              v-if="!isHideDrawMjPoint"
              class="flex justify-between items-end min-h-28"
            >
              <span class="text-sm font-bold mr-1 w-[120px]">{{
                drawMjName
              }}</span>
              <span class="font-bold">
                <!-- 條件判斷：當 drawMjCount > 99999 時顯示 "無限額度"，否則顯示實際值 -->
                {{ item.drawMjCount > 99999 ? '無限額度' : item.drawMjCount }}
              </span>
            </div>
            <div class="mt-6 flex items-baseline gap-x-1">
              <span class="text-4xl font-bold tracking-tight">{{
                `NT$${item.price}`
              }}</span>
            </div>
            <div class="mt-6 flex flex-col gap-4">
              <button
                @click="handleSuccess(item)"
                class="block w-full rounded-md shadow-sm px-3 py-2 text-center text-sm font-semibold leading-6"
                :class="[
                  item.name == selectName
                    ? 'text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 focus-visible:outline focus-visible:outline-2'
                    : 'ring-1 ring-primary-200 dark:ring-gray-800 dark:bg-gray-800 text-primary-500 hover:ring-primary-300 dark:hover:bg-gray-700',
                ]"
              >
                {{ t('goods.buyPackage') }}
              </button>
            </div>
            <ul
              role="list"
              class="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400"
            >
              <li
                v-for="(line, index) in splitDescription(item.des)"
                :key="index"
                class="flex gap-x-3"
              >
                <CheckOne theme="filled" size="24" class="text-gray-500" />
                {{ line }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div></transition
  >
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
