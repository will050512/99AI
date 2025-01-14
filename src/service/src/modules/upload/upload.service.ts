import { formatUrl, removeSpecialCharacters } from '@/common/utils';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as ALIOSS from 'ali-oss';
import axios from 'axios';
import * as TENCENTCOS from 'cos-nodejs-sdk-v5';
import * as FormData from 'form-data';
// import * as fs from 'fs';
import { promises as fs } from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import * as streamToBuffer from 'stream-to-buffer';
import { GlobalConfigService } from '../globalConfig/globalConfig.service';
const blacklist = ['exe', 'sh', 'bat', 'js', 'php', 'py']; // 黑名單

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private readonly globalConfigService: GlobalConfigService) {}
  private tencentCos: any;

  onModuleInit() {}

  async uploadFile(file, dir = 'others') {
    const { buffer, mimetype } = file;

    if (process.env.ISDEV === 'TRUE') {
      dir = `dev/${dir}`;
    }
    // 使用 mime-types 庫獲取文件擴展名
    const fileExtension = mime.extension(mimetype) || '';
    if (!fileExtension) {
      Logger.error('無法識別文件類型，請檢查文件', 'UploadService');

      // throw new HttpException(
      //   '無法識別文件類型，請檢查文件',
      //   HttpStatus.UNSUPPORTED_MEDIA_TYPE
      // );
    }

    // 檢查文件擴展名是否在黑名單中
    if (blacklist.includes(fileExtension.toLowerCase())) {
      Logger.error('不允許上傳此類型的文件', 'UploadService');
      throw new Error('不允許上傳此類型的文件');
    }

    const now = new Date();
    const timestamp = now.getTime(); // 獲取當前時間的時間戳
    const randomString = Math.random().toString(36).substring(2, 6); // 生成4位隨機字串
    const filename = `${timestamp}_${randomString}.${fileExtension}`; // 生成新的文件名，並添加文件後綴

    const {
      tencentCosStatus = 0,
      aliOssStatus = 0,
      cheveretoStatus = 0,
      localStorageStatus = 0,
    } = await this.globalConfigService.getConfigs([
      'tencentCosStatus',
      'aliOssStatus',
      'cheveretoStatus',
      'localStorageStatus',
    ]);

    Logger.log(
      `上傳配置狀態 - 騰訊雲:本地儲存: ${localStorageStatus}, ${tencentCosStatus}, 阿里雲: ${aliOssStatus}, Chevereto: ${cheveretoStatus}`,
      'UploadService'
    );

    if (
      !Number(tencentCosStatus) &&
      !Number(aliOssStatus) &&
      !Number(cheveretoStatus) &&
      !Number(localStorageStatus)
    ) {
      Logger.error('未配置任何上傳方式', 'UploadService');
      throw new HttpException(
        '請先前往後臺配置上傳圖片的方式',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      if (Number(localStorageStatus)) {
        Logger.log('使用本地儲存上傳文件', 'UploadService');
        const result = await this.uploadFileToLocal({ filename, buffer, dir });
        Logger.log(
          `文件已上傳到本地儲存。訪問 URL: ${result}`,
          'UploadService'
        );
        return result;
      }
      if (Number(tencentCosStatus)) {
        Logger.log('使用騰訊雲 COS 上傳文件', 'UploadService');
        const result = await this.uploadFileByTencentCos({
          filename,
          buffer,
          dir,
        });
        Logger.log(
          `文件已上傳到騰訊雲 COS。訪問 URL: ${result}`,
          'UploadService'
        );
        return result;
      }
      if (Number(aliOssStatus)) {
        Logger.log('使用阿里雲 OSS 上傳文件', 'UploadService');
        const result = await this.uploadFileByAliOss({
          filename,
          buffer,
          dir,
        });
        Logger.log(
          `文件已上傳到阿里雲 OSS。訪問 URL: ${result}`,
          'UploadService'
        );
        return result;
      }
      if (Number(cheveretoStatus)) {
        Logger.log('使用 Chevereto 上傳文件', 'UploadService');
        const result = await this.uploadFileByChevereto({
          filename,
          buffer: buffer.toString('base64'),
        });
        Logger.log(
          `文件已上傳到 Chevereto。訪問 URL: ${result}`,
          'UploadService'
        );
        return result;
      }
    } catch (error) {
      Logger.error(`上傳失敗: ${error.message}`, 'UploadService');
      throw error; // 重新拋出異常，以便調用方可以處理
    }
  }

  async getUploadType() {
    const {
      tencentCosStatus = 0,
      aliOssStatus = 0,
      cheveretoStatus = 0,
    } = await this.globalConfigService.getConfigs([
      'tencentCosStatus',
      'aliOssStatus',
      'cheveretoStatus',
    ]);
    if (Number(tencentCosStatus)) {
      return 'tencent';
    }
    if (Number(aliOssStatus)) {
      return 'ali';
    }
    if (Number(cheveretoStatus)) {
      return 'chevereto';
    }
  }

  async uploadFileFromUrl({ url, dir = 'others' }) {
    if (process.env.ISDEV === 'TRUE') {
      dir = `dev/${dir}`;
    }

    const { buffer, mimeType } = await this.getBufferFromUrl(url);

    return await this.uploadFile({ buffer, mimetype: mimeType }, dir);
  }

  /* 通過騰訊雲上傳圖片 */
  async uploadFileByTencentCos({ filename, buffer, dir }) {
    const { Bucket, Region, SecretId, SecretKey } = await this.getUploadConfig(
      'tencent'
    );
    this.tencentCos = new TENCENTCOS({
      SecretId,
      SecretKey,
      FileParallelLimit: 10,
    });
    try {
      return new Promise(async (resolve, reject) => {
        this.tencentCos.putObject(
          {
            Bucket: removeSpecialCharacters(Bucket),
            Region: removeSpecialCharacters(Region),
            Key: `${dir}/${filename}`,
            StorageClass: 'STANDARD',
            Body: buffer,
          },
          async (err, data) => {
            if (err) {
              console.log('cos -> err: ', err);
              return reject(err);
            }
            let locationUrl = data.Location.replace(
              /^(http:\/\/|https:\/\/|\/\/|)(.*)/,
              'https://$2'
            );
            const { acceleratedDomain } = await this.getUploadConfig('tencent');
            if (acceleratedDomain) {
              locationUrl = locationUrl.replace(
                /^(https:\/\/[^/]+)(\/.*)$/,
                `https://${acceleratedDomain}$2`
              );
              console.log('當前已開啟全球加速----------------->', locationUrl);
            }
            return resolve(locationUrl);
          }
        );
      });
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException('上傳圖片失敗[ten]', HttpStatus.BAD_REQUEST);
    }
  }

  /* 通過阿里雲上傳圖片 */
  async uploadFileByAliOss({ filename, buffer, dir }) {
    const { region, bucket, accessKeyId, accessKeySecret } =
      await this.getUploadConfig('ali');
    const client = new ALIOSS({
      region: removeSpecialCharacters(region),
      accessKeyId,
      accessKeySecret,
      bucket: removeSpecialCharacters(bucket),
    });
    try {
      console.log('ali 開始上傳');
      return new Promise((resolve, reject) => {
        client
          .put(`${dir}/${filename}`, buffer)
          .then(async (result) => {
            const { acceleratedDomain } = await this.getUploadConfig('ali');
            if (acceleratedDomain) {
              result.url = result.url.replace(
                /^(https:\/\/[^/]+)(\/.*)$/,
                `https://${acceleratedDomain}$2`
              );
              console.log('當前已開啟全球加速----------------->', result.url);
            }
            resolve(result.url);
          })
          .catch((err) => {
            reject(err);
          });
      });
    } catch (error) {
      throw new HttpException('上傳圖片失敗[ali]', HttpStatus.BAD_REQUEST);
    }
  }

  // 假設 uploadFileToLocal 是類的一個方法
  async uploadFileToLocal({ filename, buffer, dir = 'others' }) {
    // 確保目錄和文件名沒有非法字符
    const normalizedDir = path.normalize(dir).replace(/^(\.\.(\/|\\|$))+/, '');
    const normalizedFilename = path.basename(filename);

    const projectRoot = process.cwd(); // 獲取項目根目錄
    const uploadDir = path.join(projectRoot, 'public', 'file', normalizedDir);
    const filePath = path.join(uploadDir, normalizedFilename);

    // 確保最終路徑在預期的目錄內
    if (!filePath.startsWith(path.join(projectRoot, 'public', 'file'))) {
      throw new Error('非法路徑，禁止訪問目錄之外的位置');
    }

    // 確保目錄存在
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      Logger.error(`創建目錄失敗: ${uploadDir}`, err);
      throw err;
    }

    // // 將文件buffer寫入到指定路徑
    // try {
    //   await fs.writeFile(filePath, buffer);
    // } catch (err) {
    //   Logger.error(`文件保存失敗: ${filePath}`, err);
    //   throw err;
    // }

    // 將文件buffer寫入到指定路徑並設置為只讀
    try {
      await fs.writeFile(filePath, buffer, { mode: 0o444 }); // 設置文件為只讀
    } catch (err) {
      Logger.error(`文件保存失敗: ${filePath}`, err);
      throw err;
    }

    // 使用環境變量中定義的基礎URL來構建完整的文件訪問URL
    let fileUrl = `file/${normalizedDir}/${normalizedFilename}`;
    const siteUrl = await this.globalConfigService.getConfigs(['siteUrl']);
    if (siteUrl) {
      const url = formatUrl(siteUrl);
      fileUrl = `${url}/${fileUrl}`;
    }
    // 返回文件訪問的URL
    return fileUrl;
  }

  /* 通過三方圖床上傳圖片 */
  async uploadFileByChevereto({ filename = '', buffer }) {
    const { key, uploadPath } = await this.getUploadConfig('chevereto');
    let url = uploadPath.endsWith('/') ? uploadPath.slice(0, -1) : uploadPath;
    const formData = new FormData();
    const fromBuffer = buffer.toString('base64');
    formData.append('source', fromBuffer);
    formData.append('key', key);
    formData.append('title', filename);
    try {
      const res = await axios.post(url, formData, {
        headers: { 'X-API-Key': key },
      });
      if (res?.status === 200) {
        return res.data.image.url;
      } else {
        console.log(
          'Chevereto ---> res',
          res?.data.code,
          res?.data.error.message
        );
        Logger.error('上傳圖片失敗[Chevereto]', JSON.stringify(res.data));
      }
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        `上傳圖片失敗[Chevereto|buffer] --> ${error.response?.data.error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /* 獲取cos上傳配置 */
  async getUploadConfig(type) {
    if (type === 'ali') {
      const {
        aliOssRegion: region,
        aliOssBucket: bucket,
        aliOssAccessKeyId: accessKeyId,
        aliOssAccessKeySecret: accessKeySecret,
        aliOssAcceleratedDomain: acceleratedDomain,
      } = await this.globalConfigService.getConfigs([
        'aliOssRegion',
        'aliOssBucket',
        'aliOssAccessKeyId',
        'aliOssAccessKeySecret',
        'acceleratedDomain',
      ]);

      return {
        region,
        bucket,
        accessKeyId,
        accessKeySecret,
        acceleratedDomain,
      };
    }
    if (type === 'tencent') {
      const {
        cosBucket: Bucket,
        cosRegion: Region,
        cosSecretId: SecretId,
        cosSecretKey: SecretKey,
        tencentCosAcceleratedDomain: acceleratedDomain,
      } = await this.globalConfigService.getConfigs([
        'cosBucket',
        'cosRegion',
        'cosSecretId',
        'cosSecretKey',
        'tencentCosAcceleratedDomain',
      ]);
      return { Bucket, Region, SecretId, SecretKey, acceleratedDomain };
    }
    if (type === 'chevereto') {
      const { cheveretoKey: key, cheveretoUploadPath: uploadPath } =
        await this.globalConfigService.getConfigs([
          'cheveretoKey',
          'cheveretoUploadPath',
        ]);
      return { key, uploadPath };
    }
  }

  async getBufferFromUrl(
    url: string
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    const response = await axios.get(url, { responseType: 'stream' });

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      streamToBuffer(response.data, (err, buffer) => {
        if (err) {
          reject(
            new HttpException(
              '獲取圖片資源失敗，請重新試試吧！',
              HttpStatus.BAD_REQUEST
            )
          );
        } else {
          resolve(buffer);
        }
      });
    });

    const mimeType = response.headers['content-type'];
    return { buffer, mimeType };
  }
}
