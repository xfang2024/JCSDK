/**
 * 打印执行逻辑
 * @description 提供打印预览和打印任务执行的核心逻辑
 */

import JCAPI from '@/src/utils/print.js';
import { LabelImageData } from '@/src/utils/LabelImageData.js';
import { ERROR_CODE_MAP } from '@/src/constants/constants.js';

/**
 * 打印执行逻辑组合式函数
 * @returns {Object} 包含打印执行相关函数的对象
 */
export function usePrintExecution() {
  /**
   * 生成预览数据
   * @param {Object} printConfig - 打印配置对象
   * @returns {Promise<Array>} 预览数据列表
   */
  const generatePreviewData = async (printConfig) => {
    const previewDataList = [];

    for (let i = 0; i < printConfig.data.length; i++) {
      const pageConfig = printConfig.data[i];

      // 初始化画板
      await JCAPI.initDrawingBoard(pageConfig.InitDrawingBoardParam);

      // 执行绘制指令
      for (const element of pageConfig.elements) {
        const { type, params } = element;
        if (!type || !params) {
          console.warn('跳过无效的绘制指令:', element);
          continue;
        }

        await executeDrawElement(type, params);
      }

      // 生成预览图
      let imageJsonObj = await JCAPI.generateLabelJson();
      let previewResponse = await JCAPI.previewPrintData(imageJsonObj);

      previewDataList.push({
        imageData: previewResponse,
        labelWidth: pageConfig.InitDrawingBoardParam.width,
        labelHeight: pageConfig.InitDrawingBoardParam.height,
        printCopies: pageConfig.printCopies
      });
    }

    return previewDataList;
  };

  /**
   * 执行单个绘制指令
   * @param {string} type - 绘制类型
   * @param {Object} params - 绘制参数
   * @returns {Promise<void>}
   */
  const executeDrawElement = async (type, params) => {
    switch (type) {
      case 'text':
        await JCAPI.drawLabelText(params);
        break;
      case 'barcode':
        await JCAPI.drawLabelBarCode(params);
        break;
      case 'qrcode':
        await JCAPI.drawLabelQrCode(params);
        break;
      case 'line':
        await JCAPI.drawLabelLine(params);
        break;
      case 'graph':
        await JCAPI.drawLabelGraph(params);
        break;
      case 'image':
        if (params.imageData === LabelImageData.data) {
          params.imageData = await Promise.resolve(LabelImageData.data);
        }
        await JCAPI.drawLabelImage(params);
        break;
      default:
        console.warn('未知的绘制类型:', type);
    }
  };

  /**
   * 执行打印任务
   * @param {Object} config - 打印配置
   * @param {Object} callbacks - 回调函数集合
   * @param {Function} callbacks.onProgressUpdate - 进度更新回调
   * @param {Function} callbacks.onSuccess - 成功回调
   * @param {Function} callbacks.onError - 错误回调
   * @returns {Promise<void>}
   */
  const executePrintJob = async (config, callbacks = {}) => {
    const {
      onProgressUpdate = () => {},
      onSuccess = () => {},
      onError = () => {}
    } = callbacks;

    return new Promise(async (resolve, reject) => {
      let errorMessage = '';

      // 1. 检查设备连接
      try {
        await JCAPI.isConnected();
      } catch (err) {
        errorMessage = '设备未连接，请先连接设备';
        onError(errorMessage);
        reject(new Error(errorMessage));
        return;
      }

      // 2. 校验配置
      const validationError = validatePrintConfig(config);
      if (validationError) {
        onError(validationError);
        reject(new Error(validationError));
        return;
      }

      const { data, jobConfig } = config;

      // 3. 计算总打印份数
      const calculatedTotal = data.reduce((total, item) => {
        const validCopies = typeof item.printCopies === 'number' && item.printCopies >= 1 
          ? item.printCopies 
          : 0;
        return total + validCopies;
      }, 0);

      if (calculatedTotal <= 0) {
        errorMessage = '无有效打印份数，无法启动任务';
        onError(errorMessage);
        reject(new Error(errorMessage));
        return;
      }

      jobConfig.totalCount = calculatedTotal;
      let hasErrorOccurred = false;

      // 4. 初始化进度
      onProgressUpdate(0, calculatedTotal);

      // 5. 注册回调
      JCAPI.didReadPrintCountInfo((callbackResult) => {
        onProgressUpdate(callbackResult.count, calculatedTotal);
        if (callbackResult.count >= calculatedTotal) {
          onSuccess();
          resolve();
        }
      });

      JCAPI.didReadPrintErrorInfo((callbackResult) => {
        if (hasErrorOccurred) return;
        hasErrorOccurred = true;

        const errorCode = callbackResult.code;
        const errorMessage = ERROR_CODE_MAP[errorCode] || `未知错误（错误码${errorCode}）`;
        onError(errorMessage);
        reject(new Error(errorMessage));
      });

      // 6. 启动打印任务
      try {
        await JCAPI.startJob(jobConfig);

        // 7. 逐页提交数据
        for (let i = 0; i < data.length; i++) {
          const currentItem = data[i];
          const validCopies = typeof currentItem.printCopies === 'number' && currentItem.printCopies >= 1 
            ? currentItem.printCopies 
            : 0;

          if (validCopies === 0) {
            console.warn('[打印份数校验] 跳过无效份数：', currentItem.printCopies);
            continue;
          }

          // 初始化画板
          JCAPI.initDrawingBoard(currentItem.InitDrawingBoardParam);

          // 执行绘制
          for (const element of currentItem.elements) {
            const { type, params } = element;
            if (!type || !params) {
              console.warn('跳过无效的绘制指令:', element);
              continue;
            }

            // 同步绘制（不需要 await）
            switch (type) {
              case 'text':
                JCAPI.drawLabelText(params);
                break;
              case 'barcode':
                JCAPI.drawLabelBarCode(params);
                break;
              case 'qrcode':
                JCAPI.drawLabelQrCode(params);
                break;
              case 'line':
                JCAPI.drawLabelLine(params);
                break;
              case 'graph':
                JCAPI.drawLabelGraph(params);
                break;
              case 'image':
                JCAPI.drawLabelImage(params);
                break;
              default:
                console.warn('未知的绘制类型:', type);
            }
          }

          // 提交打印数据
          let imageJsonObj = await JCAPI.generateLabelJson();
          let commitResult = await JCAPI.commitPrintData(imageJsonObj, {
            printQuantity: validCopies
          });

          if (commitResult.code != 0) {
            errorMessage = `第${i + 1}页打印提交失败: ${commitResult.msg || '未知错误'}`;
            onError(errorMessage);
            reject(new Error(errorMessage));
            return;
          }
        }
      } catch (err) {
        errorMessage = `打印任务失败: ${err.msg || err.message || '未知错误'}`;
        onError(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  };

  /**
   * 校验打印配置
   * @param {Object} config - 打印配置对象
   * @returns {string|null} 错误信息，如果配置有效则返回null
   */
  const validatePrintConfig = (config) => {
    if (!config || typeof config !== 'object') {
      return '打印配置不能为空且必须为对象';
    }

    const { data } = config;

    if (!Array.isArray(data)) {
      return '打印配置数据必须为数组';
    }

    if (data.length === 0) {
      return '打印配置数据不能为空';
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.InitDrawingBoardParam || !item.InitDrawingBoardParam.width || !item.InitDrawingBoardParam.height) {
        return `第${i + 1}个子配置缺失 board 字段`;
      }
      if (!Array.isArray(item.elements)) {
        return `第${i + 1}个子配置的 elements 必须为数组`;
      }
      if (typeof item.printCopies !== 'number') {
        return `第${i + 1}个子配置的 printCopies 需为数字`;
      }
    }

    return null;
  };

  /**
   * 取消打印任务
   * @returns {Promise<boolean>} 取消是否成功
   */
  const cancelPrintJob = async () => {
    try {
      await JCAPI.cancelPrint();
      return true;
    } catch (error) {
      console.error('取消打印失败:', error);
      return false;
    }
  };

  return {
    generatePreviewData,
    executePrintJob,
    cancelPrintJob,
    validatePrintConfig
  };
}