import { createRandomNonceStr, importDynamic } from '@/common/utils';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { CramiPackageEntity } from '../crami/cramiPackage.entity';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
import { OrderEntity } from '../order/order.entity';
import { UserService } from '../user/user.service';
import { UserBalanceService } from '../userBalance/userBalance.service';

@Injectable()
export class PayService {
  constructor(
    @InjectRepository(CramiPackageEntity)
    private readonly cramiPackageEntity: Repository<CramiPackageEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderEntity: Repository<OrderEntity>,
    private readonly userBalanceService: UserBalanceService,
    private readonly globalConfigService: GlobalConfigService,
    private readonly userService: UserService
  ) {}

  private WxPay;

  async onModuleInit() {
    const wpay = await importDynamic('wechatpay-node-v3');
    this.WxPay = wpay?.default ? wpay.default : wpay;
  }

  /* 支付通知 */
  async notify(params: object) {
    if (params['param'] == 'epay') {
      return this.notifyEpay(params);
    }
    if (params['attach'] == 'hupi') {
      return this.notifyHupi(params);
    }
    if (params['attach'] == 'ltzf') {
      return this.notifyLtzf(params);
    }
    if (typeof params['resource'] == 'object') {
      return this.notifyWeChat(params);
    }
    return this.notifyMpay(params);
  }

  /* 分平臺支付請求 */
  async pay(userId: number, orderId: string, payType = 'wxpay') {
    // query order
    const order = await this.orderEntity.findOne({
      where: { userId, orderId },
    });
    if (!order) throw new HttpException('訂單不存在!', HttpStatus.BAD_REQUEST);
    // query goods
    const goods = await this.cramiPackageEntity.findOne({
      where: { id: order.goodsId },
    });
    if (!goods) throw new HttpException('套餐不存在!', HttpStatus.BAD_REQUEST);
    Logger.log('本次支付類型: ', order.payPlatform);
    try {
      if (order.payPlatform == 'wechat') {
        return this.payWeChat(userId, orderId, payType);
      }
      if (order.payPlatform == 'epay') {
        return this.payEpay(userId, orderId, payType);
      }
      if (order.payPlatform == 'mpay') {
        return this.payMpay(userId, orderId, payType);
      }
      if (order.payPlatform == 'hupi') {
        return this.payHupi(userId, orderId, payType);
      }
      if (order.payPlatform == 'ltzf') {
        return this.payLtzf(userId, orderId, payType);
      }
    } catch (error) {
      Logger.log('支付請求失敗: ', error);
      throw new HttpException('支付請求失敗!', HttpStatus.BAD_REQUEST);
    }
  }

  /* 支付訂單狀態查詢 */
  async query(orderId: string) {
    const order = await this.orderEntity.findOne({ where: { orderId } });
    if (!order) throw new HttpException('訂單不存在!', HttpStatus.BAD_REQUEST);
    return order;
  }

  /* 虎皮椒支付通知 */
  async notifyHupi(params: object) {
    const payHupiSecret = await this.globalConfigService.getConfigs([
      'payHupiSecret',
    ]);
    const hash = params['hash'];
    delete params['hash'];
    if (this.sign(params, payHupiSecret) != hash) return 'failed';
    const order = await this.orderEntity.findOne({
      where: { orderId: params['trade_order_id'], status: 0 },
    });
    if (!order) return 'failed';
    /* add balance  log */
    await this.userBalanceService.addBalanceToOrder(order);
    const result = await this.orderEntity.update(
      { orderId: params['trade_order_id'] },
      { status: 1, paydAt: new Date() }
    );
    if (result.affected != 1) return 'failed';
    return 'success';
  }

  /* 虎皮椒支付 */
  async payHupi(userId: number, orderId: string, payType = 'wxpay') {
    const order = await this.orderEntity.findOne({
      where: { userId, orderId },
    });
    if (!order) throw new HttpException('訂單不存在!', HttpStatus.BAD_REQUEST);
    const goods = await this.cramiPackageEntity.findOne({
      where: { id: order.goodsId },
    });
    if (!goods) throw new HttpException('套餐不存在!', HttpStatus.BAD_REQUEST);
    const {
      payHupiAppId,
      payHupiSecret,
      payHupiNotifyUrl,
      payHupiReturnUrl,
      payHupiGatewayUrl,
    } = await this.globalConfigService.getConfigs([
      'payHupiAppId',
      'payHupiSecret',
      'payHupiNotifyUrl',
      'payHupiReturnUrl',
      'payHupiGatewayUrl',
    ]);
    const params = {};
    params['version'] = '1.1';
    params['appid'] = payHupiAppId;
    params['time'] = (Date.now() / 1000).toFixed(0);
    params['nonce_str'] = createRandomNonceStr(32);
    params['trade_order_id'] = orderId;
    params['title'] = goods.name;
    params['total_fee'] = order.total;
    params['notify_url'] = payHupiNotifyUrl;
    params['return_url'] = payHupiReturnUrl;
    params['attach'] = 'hupi';
    params['hash'] = this.sign(params, payHupiSecret);
    const {
      data: { errcode, errmsg, url_qrcode, url },
    } = await axios.post(
      payHupiGatewayUrl || 'https://api.xunhupay.com/payment/do.html',
      params
    );
    if (errcode != 0) throw new HttpException(errmsg, HttpStatus.BAD_REQUEST);
    return { url_qrcode, url };
  }

  /* 虎皮椒商戶查詢 */
  async queryHupi(orderId: string) {
    const { payHupiAppId, payHupiSecret } =
      await this.globalConfigService.getConfigs([
        'payHupiAppId',
        'payHupiSecret',
      ]);
    const params = {};
    params['version'] = '1.1';
    params['appid'] = payHupiAppId;
    params['time'] = (Date.now() / 1000).toFixed(0);
    params['nonce_str'] = createRandomNonceStr(32);
    params['out_trade_order'] = orderId;
    params['hash'] = this.sign(params, payHupiSecret);
    const {
      data: { errcode, errmsg, data: result },
    } = await axios.post('https://api.xunhupay.com/payment/query.html', params);
    if (errcode != 0) throw new HttpException(errmsg, HttpStatus.BAD_REQUEST);
    return result;
  }

  /* 易支付支付結果通知 */
  async notifyEpay(params: object) {
    const sign = params['sign'];
    delete params['sign'];
    delete params['sign_type'];
    const payEpaySecret = await this.globalConfigService.getConfigs([
      'payEpaySecret',
    ]);
    if (this.sign(params, payEpaySecret) != sign) return 'failed';
    Logger.log('校驗簽名通過');
    const order = await this.orderEntity.findOne({
      where: { orderId: params['out_trade_no'], status: 0 },
    });
    if (!order) return 'failed';
    // update order status
    const status = params['trade_status'] == 'TRADE_SUCCESS' ? 1 : 2;
    const result = await this.orderEntity.update(
      { orderId: params['out_trade_no'] },
      { status, paydAt: new Date() }
    );
    if (status === 1) {
      await this.userBalanceService.addBalanceToOrder(order);
    }
    if (result.affected != 1) return 'failed';
    return 'success';
  }

  /* 易支付支付 */
  async payEpay(userId: number, orderId: string, payType = 'alipay') {
    // query order
    const order = await this.orderEntity.findOne({
      where: { userId, orderId },
    });
    if (!order) throw new HttpException('訂單不存在!', HttpStatus.BAD_REQUEST);
    // query goods
    const goods = await this.cramiPackageEntity.findOne({
      where: { id: order.goodsId },
    });
    if (!goods) throw new HttpException('套餐不存在!', HttpStatus.BAD_REQUEST);
    // assemble params
    const {
      payEpayPid,
      payEpaySecret,
      payEpayNotifyUrl,
      payEpayReturnUrl,
      payEpayApiPayUrl,
    } = await this.globalConfigService.getConfigs([
      'payEpayPid',
      'payEpaySecret',
      'payEpayNotifyUrl',
      'payEpayReturnUrl',
      'payEpayApiPayUrl',
    ]);

    let convertedNumber;

    if (payEpayPid.length <= 16) {
      convertedNumber = Number(payEpayPid);
    } else {
      convertedNumber = BigInt(payEpayPid);
    }
    const params = {};
    params['pid'] = convertedNumber;
    params['type'] = payType;
    params['out_trade_no'] = orderId;
    params['name'] = goods.name;
    params['money'] = order.total;
    params['clientip'] = '192.168.1.100';
    params['device'] = 'pc';
    params['notify_url'] = payEpayNotifyUrl;
    params['return_url'] = payEpayReturnUrl;
    params['param'] = 'epay';
    params['sign'] = this.sign(params, payEpaySecret);
    params['sign_type'] = 'MD5';
    const queryParams = new URLSearchParams(params).toString();
    const apiUrl = `${payEpayApiPayUrl}?${queryParams}`;
    if (payEpayApiPayUrl.includes('submit.php')) {
      return {
        url_qrcode: null,
        redirectUrl: apiUrl,
        channel: payType,
        isRedirect: true,
      };
    } else {
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const res = await axios.post(payEpayApiPayUrl, params, config);

      Logger.log('epay ---> res: ', res.data);
      const {
        data: { code, msg, qrcode: url_qrcode },
      } = res;
      if (code != 1) throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      return {
        url_qrcode,
        redirectUrl: null,
        channel: payType,
        isRedirect: false,
      };
    }
  }

  /* 易支付商戶資訊查詢 */
  async queryEpay(orderId: string) {
    const { payEpayPid, payEpaySecret, payEpayApiQueryUrl } =
      await this.globalConfigService.getConfigs([
        'payEpayPid',
        'payEpaySecret',
        'payEpayApiQueryUrl',
      ]);
    const params = {};
    params['act'] = 'order';
    params['out_trade_no'] = orderId;
    params['pid'] = payEpayPid;
    params['key'] = payEpaySecret;
    const {
      data: { code, msg, data: result },
    } = await axios.get(payEpayApiQueryUrl, { params });
    if (code != 1) throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    return result;
  }

  /* 碼支付支付結果通知 */
  async notifyMpay(params: object) {
    const sign = params['sign'];
    delete params['sign'];
    delete params['sign_type'];
    const payMpaySecret = await this.globalConfigService.getConfigs([
      'payMpaySecret',
    ]);
    Logger.log('校驗簽名');
    if (this.sign(params, payMpaySecret) != sign) return 'failed';
    Logger.log('校驗簽名通過');
    const order = await this.orderEntity.findOne({
      where: { orderId: params['out_trade_no'], status: 0 },
    });
    if (!order) return 'failed';
    // update order status
    const status = params['trade_status'] == 'TRADE_SUCCESS' ? 1 : 2;
    Logger.log('status: ', status);
    const result = await this.orderEntity.update(
      { orderId: params['out_trade_no'] },
      { status, paydAt: new Date() }
    );
    if (status === 1) {
      await this.userBalanceService.addBalanceToOrder(order);
    }
    if (result.affected != 1) return 'failed';
    return 'success';
  }

  /* 碼支付支付 */
  async payMpay(userId: number, orderId: string, payType = 'wxpay') {
    // query order
    const order = await this.orderEntity.findOne({
      where: { userId, orderId },
    });
    if (!order) throw new HttpException('訂單不存在!', HttpStatus.BAD_REQUEST);
    // query goods
    const goods = await this.cramiPackageEntity.findOne({
      where: { id: order.goodsId },
    });
    if (!goods) throw new HttpException('套餐不存在!', HttpStatus.BAD_REQUEST);
    // assemble params
    const {
      payMpayPid,
      payMpaySecret,
      payMpayNotifyUrl,
      payMpayReturnUrl,
      payMpayApiPayUrl,
    } = await this.globalConfigService.getConfigs([
      'payMpayPid',
      'payMpaySecret',
      'payMpayNotifyUrl',
      'payMpayReturnUrl',
      'payMpayApiPayUrl',
    ]);
    const params = {};
    params['pid'] = Number(payMpayPid);
    params['type'] = payType;
    params['out_trade_no'] = orderId;
    params['name'] = goods.name;
    params['money'] = order.total;
    params['notify_url'] = payMpayNotifyUrl;
    params['return_url'] = payMpayReturnUrl;
    // params['param'] = 'Mpay';
    params['sign'] = this.sign(params, payMpaySecret);
    params['sign_type'] = 'MD5';
    const queryParams = new URLSearchParams(params).toString();
    const apiUrl = `${payMpayApiPayUrl}?${queryParams}`;
    return {
      url_qrcode: null,
      redirectUrl: apiUrl,
      channel: payType,
      isRedirect: true,
    };
    const res = await axios.get(payMpayApiPayUrl, { params });
  }

  /* 碼支付商戶資訊查詢 */
  async queryMpay(orderId: string) {
    const { payMpayApiQueryUrl } = await this.globalConfigService.getConfigs([
      'payMpayPid',
      'payMpaySecret',
      'payMpayApiQueryUrl',
    ]);
    const params = {};
    params['type'] = 2;
    params['order_no'] = orderId;
    const {
      data: { code, msg, data: result },
    } = await axios.get(payMpayApiQueryUrl, { params });
    if (code != 1) throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    return result;
  }

  /* 微信支付結果通知 */
  async notifyWeChat(params: object) {
    Logger.log('微信支付通知params: ', params);
    // assemble params
    const {
      payWeChatAppId,
      payWeChatMchId,
      payWeChatSecret,
      payWeChatPublicKey,
      payWeChatPrivateKey,
    } = await this.globalConfigService.getConfigs([
      'payWeChatAppId',
      'payWeChatMchId',
      'payWeChatSecret',
      'payWeChatPublicKey',
      'payWeChatPrivateKey',
    ]);
    const pay = new this.WxPay({
      appid: payWeChatAppId,
      mchid: payWeChatMchId,
      publicKey: payWeChatPublicKey,
      privateKey: payWeChatPrivateKey,
    });
    try {
      if (params['event_type'] == 'TRANSACTION.SUCCESS') {
        const { ciphertext, associated_data, nonce } = params['resource'];
        const resource = pay.decipher_gcm(
          ciphertext,
          associated_data,
          nonce,
          payWeChatSecret
        );
        const order = await this.orderEntity.findOne({
          where: { orderId: resource['out_trade_no'], status: 0 },
        });
        if (!order) return 'failed';
        // update order status
        const status = resource['trade_state'] == 'SUCCESS' ? 1 : 2;
        const result = await this.orderEntity.update(
          { orderId: resource['out_trade_no'] },
          { status, paydAt: new Date() }
        );
        if (status === 1) {
          await this.userBalanceService.addBalanceToOrder(order);
        }
        if (result.affected != 1) return 'failed';
      }
      return 'success';
    } catch (error) {
      Logger.log('error: ', error);
      Logger.log('支付通知驗證失敗: ', error);
      return 'failed';
    }
  }

  /* 微信支付支付 */
  async payWeChat(userId: number, orderId: string, payType = 'native') {
    Logger.log('payType: ', payType);
    const order = await this.orderEntity.findOne({
      where: { userId, orderId },
    });
    if (!order) throw new HttpException('訂單不存在!', HttpStatus.BAD_REQUEST);
    const goods = await this.cramiPackageEntity.findOne({
      where: { id: order.goodsId },
    });
    if (!goods) throw new HttpException('套餐不存在!', HttpStatus.BAD_REQUEST);
    const {
      payWeChatAppId,
      payWeChatMchId,
      payWeChatPublicKey,
      payWeChatPrivateKey,
      payWeChatNotifyUrl,
    } = await this.globalConfigService.getConfigs([
      'payWeChatAppId',
      'payWeChatMchId',
      'payWeChatPublicKey',
      'payWeChatPrivateKey',
      'payWeChatNotifyUrl',
    ]);
    const pay = new this.WxPay({
      appid: payWeChatAppId,
      mchid: payWeChatMchId,
      publicKey: payWeChatPublicKey,
      privateKey: payWeChatPrivateKey,
    });
    const params: any = {
      appid: payWeChatAppId,
      mchid: payWeChatMchId,
      description: goods.name,
      out_trade_no: orderId,
      notify_url: payWeChatNotifyUrl,
      // amount: {
      //   total: Number(order.total * 100),
      // },
      amount: {
        total: Math.round(order.total * 100),
        // total: round(Number(order.total * 100)), // 確保總金額是一個整數
      },
      // payer: null,
      // scene_info: {
      //   payer_client_ip: '192.168.1.100',

      //   // h5_info: {
      //   //   type: 'Wap',
      //   //   app_name: payWeChatH5Name,
      //   //   app_url: payWeChatH5Url,
      //   // },
      // },
    };
    Logger.log('wechat-pay: ', params);

    // if (payType == 'h5') {
    //   params.scene_info.h5_info = {
    //     type: 'Wap',
    //     app_name: payWeChatH5Name,
    //     app_url: payWeChatH5Url,
    //   };
    //   const res = await pay.transactions_h5(params);
    //   if (res.status === 403) {
    //     const errmsg = res?.errRaw?.response?.text?.message;
    //     throw new HttpException(res?.message || '微信H5支付失敗！', HttpStatus.BAD_REQUEST);
    //   }
    //   const { h5_url } = res;
    //   return { url: h5_url };
    // }
    // if (payType == 'jsapi') {
    //   // query openid
    //   const openid = await this.userService.getOpenIdByUserId(userId);
    //   Logger.log('用戶openId: ', openid);
    //   params['payer'] = {
    //     openid: openid,
    //   };
    //   const result = await pay.transactions_jsapi(params);
    //   Logger.log('jsapi支付結果返回值: ', result);
    //   return result;
    // }
    if (payType == 'jsapi') {
      Logger.log(
        `[WeChat Pay JSAPI] 開始JSAPI支付流程，用戶ID: ${userId}, 訂單ID: ${orderId}`
      );
      // 查詢用戶的openid
      const openid = await this.userService.getOpenIdByUserId(userId);
      Logger.log(`[WeChat Pay JSAPI] 用戶OpenID: ${openid}`);

      // 構建支付請求參數
      params['payer'] = { openid: openid };
      Logger.log(
        `[WeChat Pay JSAPI] 發送支付請求參數: `,
        JSON.stringify(params, null, 2)
      );

      try {
        // 發送支付請求
        const response = await pay.transactions_jsapi(params);
        // 檢查響應結構中是否有 data 字段，如果有，則直接使用 data 字段的內容；否則，使用整個響應內容
        const result = response.data ? response.data : response;
        Logger.log(
          `[WeChat Pay JSAPI] 支付請求成功，返回結果: `,
          JSON.stringify(result, null, 2)
        );

        // 直接返回 result，確保不含 data 字段，幷包含 status
        return {
          status: response.status || 'unknown', // 如果原始響應中有 status 字段，使用之；否則默認為 'unknown'
          appId: result.appId || result.data?.appId,
          timeStamp: result.timeStamp || result.data?.timeStamp,
          nonceStr: result.nonceStr || result.data?.nonceStr,
          package: result.package || result.data?.package,
          signType: result.signType || result.data?.signType,
          paySign: result.paySign || result.data?.paySign,
        };
      } catch (error) {
        console.error(
          `[WeChat Pay JSAPI] 支付請求過程中發生錯誤: ${error.message}`,
          error
        );
        // 記錄完整的錯誤對象
        console.error('[WeChat Pay JSAPI] 完整的錯誤對象：', error);
        throw new HttpException('JSAPI支付失敗', HttpStatus.BAD_REQUEST);
      }
    }

    if (payType == 'native') {
      Logger.log(
        `開始進行微信Native支付流程，訂單ID: ${orderId}, 用戶ID: ${userId}`
      );

      try {
        const res = await pay.transactions_native(params);
        Logger.log(`微信Native支付響應數據: `, JSON.stringify(res, null, 2));

        let url_qrcode = res.code_url || res.data?.code_url;

        if (!url_qrcode) {
          console.error(
            `微信Native支付請求成功，但未返回code_url，響應數據: `,
            JSON.stringify(res, null, 2)
          );
        } else {
          Logger.log(`微信Native支付請求成功，code_url: ${url_qrcode}`);
        }

        return { url_qrcode, isRedirect: false };
      } catch (error) {
        console.error(
          `微信Native支付過程中發生錯誤，錯誤資訊: ${error.message}`,
          error
        );
        console.error('完整的錯誤對象：', error);
        throw new HttpException('微信Native支付失敗', HttpStatus.BAD_REQUEST);
      }
    } else {
      console.warn(`支付請求使用了不支持的支付類型: ${payType}`);
      throw new HttpException('unsupported pay type', HttpStatus.BAD_REQUEST);
    }
  }

  //   if (payType == 'native') {
  //     const res = await pay.transactions_native(params);
  //     const { code_url: url_qrcode } = res;
  //     if (!url_qrcode) {
  //       Logger.log('wx-native', res);
  //     }

  //     return { url_qrcode, isRedirect: false };
  //   }
  //   throw new HttpException('unsupported pay type', HttpStatus.BAD_REQUEST);
  // }

  /* 微信支付商戶資訊查詢 */
  async queryWeChat(orderId: string) {
    // assemble params
    const {
      payWeChatAppId,
      payWeChatMchId,
      payWeChatPublicKey,
      payWeChatPrivateKey,
      payWeChatNotifyUrl,
    } = await this.globalConfigService.getConfigs([
      'payWeChatAppId',
      'payWeChatMchId',
      'payWeChatPublicKey',
      'payWeChatPrivateKey',
    ]);
    const pay = new this.WxPay({
      appid: payWeChatAppId,
      mchid: payWeChatMchId,
      publicKey: payWeChatPublicKey,
      privateKey: payWeChatPrivateKey,
    });
    const result = await pay.query({ out_trade_no: orderId });
    return result;
  }

  /* 加密簽名 */
  sign(params: object, secret: string) {
    const str =
      Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&') + secret;
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /* 藍兔支付簽名 */
  ltzfSign(params: object, secret: string) {
    const paramsArr = Object.keys(params);
    paramsArr.sort();
    const stringArr = [];
    paramsArr.map((key) => {
      stringArr.push(key + '=' + params[key]);
    });
    // 最後加上商戶Key
    stringArr.push('key=' + secret);
    const str = stringArr.join('&');
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  }

  /* 藍兔支付 */
  async payLtzf(userId: number, orderId: string, payType = 'wxpay') {
    const order = await this.orderEntity.findOne({
      where: { userId, orderId },
    });
    if (!order) throw new HttpException('訂單不存在!', HttpStatus.BAD_REQUEST);
    const goods = await this.cramiPackageEntity.findOne({
      where: { id: order.goodsId },
    });
    if (!goods) throw new HttpException('套餐不存在!', HttpStatus.BAD_REQUEST);
    const { payLtzfMchId, payLtzfSecret, payLtzfNotifyUrl, payLtzfReturnUrl } =
      await this.globalConfigService.getConfigs([
        'payLtzfMchId',
        'payLtzfSecret',
        'payLtzfNotifyUrl',
        'payLtzfReturnUrl',
      ]);
    const params = {};
    params['mch_id'] = payLtzfMchId; //商戶號
    params['timestamp'] = (Date.now() / 1000).toFixed(0); //時間
    params['out_trade_no'] = orderId; //商戶訂單號
    params['body'] = goods.name; //訂單標題
    params['total_fee'] = order.total; //訂單金額
    params['notify_url'] = payLtzfNotifyUrl; //通知回調地址
    params['sign'] = this.ltzfSign(params, payLtzfSecret); //簽名
    params['attach'] = 'ltzf'; //備註
    params['return_url'] = payLtzfReturnUrl; //回調
    const formBody = Object.keys(params)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
      )
      .join('&');
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const response = await axios.post(
      'https://api.ltzf.cn/api/wxpay/jsapi_convenient',
      formBody,
      config
    );
    //const response = await axios.post(payLtzfGatewayUrl || 'https://api.ltzf.cn/api/wxpay/jsapi_convenient', params);
    const { code, data, msg } = response.data;
    if (code != 0) throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    const url_qrcode = data.QRcode_url;
    const url = data.order_url;
    return { url_qrcode, url };
  }

  /* 藍兔支付商戶查詢 */
  async queryLtzf(orderId: string) {
    const { payLtzfMchId, payLtzfSecret } =
      await this.globalConfigService.getConfigs([
        'payLtzfMchId',
        'payLtzfSecret',
      ]);
    const params = {};
    params['mch_id'] = payLtzfMchId;
    params['timestamp'] = (Date.now() / 1000).toFixed(0);
    params['out_trade_no'] = orderId;
    params['sign'] = this.ltzfSign(params, payLtzfSecret);
    const formBody = Object.keys(params)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
      )
      .join('&');
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const {
      data: { code, msg, data: result },
    } = await axios.post(
      'https://api.ltzf.cn/api/wxpay/get_pay_order',
      formBody,
      config
    );
    if (code != 0)
      throw new HttpException(
        msg + JSON.stringify(params),
        HttpStatus.BAD_REQUEST
      );
    return result;
  }

  /* 藍兔支付通知 */
  async notifyLtzf(params: object) {
    const payLtzfSecret = await this.globalConfigService.getConfigs([
      'payLtzfSecret',
    ]);
    const hash = params['sign'];
    delete params['sign'];
    delete params['pay_channel'];
    delete params['trade_type'];
    delete params['success_time'];
    delete params['attach'];
    delete params['openid'];
    if (this.ltzfSign(params, payLtzfSecret) != hash) return 'FAIL';
    const order = await this.orderEntity.findOne({
      where: { orderId: params['out_trade_no'], status: 0 },
    });
    if (!order) return 'FAIL';
    /* add balance  log */
    await this.userBalanceService.addBalanceToOrder(order);
    const result = await this.orderEntity.update(
      { orderId: params['out_trade_no'] },
      { status: 1, paydAt: new Date() }
    );
    if (result.affected != 1) return 'FAIL';
    return 'SUCCESS';
  }
}
