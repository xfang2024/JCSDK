/**
 * 打印配置生成逻辑
 * @description 提供各种打印类型的配置生成器，用于生成打印任务所需的配置数据
 */

import {
  LINE_MODE_TYPE,
  BAR_CODE_TYPE,
  QR_CODE_TYPE,
  LINE_TYPE,
  GRAPH_TYPE
} from '@/src/constants/constants.js';
import { LabelImageData } from '@/src/utils/LabelImageData.js';

/**
 * 打印配置生成器组合式函数
 * @returns {Object} 包含各种打印配置生成函数的对象
 */
export function usePrintConfig() {
  /**
   * 生成基础作业配置
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 基础作业配置
   */
  const createJobConfig = (density, labelType, printMode) => {
    return {
      density: density,
      labelType: labelType,
      printMode: printMode
    };
  };

  /**
   * 生成文本打印配置
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 文本打印配置
   */
  const getTextPrintConfig = (printCopies, density, labelType, printMode) => {
    return {
      data: [{
        InitDrawingBoardParam: { width: 40, height: 20, rotate: 0 },
        elements: [{
          type: 'text',
          params: {
            x: 4.375,
            y: 0.375,
            width: 30,
            height: 20,
            value: "蛋糕房",
            fontSize: 4,
            rotate: 0,
            lineMode: LINE_MODE_TYPE.ADAPT,
            lineSpace: 0,
            letterSpace: 0,
            textAlignHorizontal: 1,
            textAlignVertical: 1,
          }
        }],
        printCopies: printCopies,
      }],
      jobConfig: createJobConfig(density, labelType, printMode)
    };
  };

  /**
   * 生成条码打印配置
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 条码打印配置
   */
  const getBarcodePrintConfig = (printCopies, density, labelType, printMode) => {
    return {
      data: [{
        InitDrawingBoardParam: { width: 40, height: 20, rotate: 0 },
        elements: [{
          type: 'barcode',
          params: {
            x: 5,
            y: 1,
            width: 30.0,
            height: 10.0,
            value: "1234567890",
            codeType: BAR_CODE_TYPE.CODE128,
            fontSize: 3,
            rotate: 0,
            textHeight: 3,
            textPosition: 0,
          }
        }],
        printCopies: printCopies,
      }],
      jobConfig: createJobConfig(density, labelType, printMode)
    };
  };

  /**
   * 生成二维码打印配置
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 二维码打印配置
   */
  const getQrcodePrintConfig = (printCopies, density, labelType, printMode) => {
    return {
      data: [{
        InitDrawingBoardParam: { width: 40, height: 20, rotate: 0 },
        elements: [{
          type: 'qrcode',
          params: {
            x: 5,
            y: 5,
            width: 10,
            height: 10,
            value: "精臣云打印SDK",
            rotate: 0,
            codeType: QR_CODE_TYPE.QR_CODE,
          }
        }],
        printCopies: printCopies,
      }],
      jobConfig: createJobConfig(density, labelType, printMode)
    };
  };

  /**
   * 生成线条打印配置
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 线条打印配置
   */
  const getLinePrintConfig = (printCopies, density, labelType, printMode) => {
    return {
      data: [{
        InitDrawingBoardParam: { width: 40, height: 20, rotate: 0 },
        elements: [
          {
            type: 'line',
            params: {
              x: 5,
              y: 1,
              width: 20,
              height: 1,
              rotate: 0,
              lineType: LINE_TYPE.SOLID
            }
          },
          {
            type: 'line',
            params: {
              x: 5,
              y: 5,
              width: 20,
              height: 0.5,
              rotate: 0,
              lineType: LINE_TYPE.SOLID
            }
          },
          {
            type: 'line',
            params: {
              x: 5,
              y: 9,
              width: 20,
              height: 1,
              rotate: 0,
              lineType: LINE_TYPE.DOTTED
            }
          }
        ],
        printCopies: printCopies,
      }],
      jobConfig: createJobConfig(density, labelType, printMode)
    };
  };

  /**
   * 生成图形打印配置
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 图形打印配置
   */
  const getGraphPrintConfig = (printCopies, density, labelType, printMode) => {
    return {
      data: [{
        InitDrawingBoardParam: { width: 40, height: 20, rotate: 0 },
        elements: [{
          type: 'graph',
          params: {
            x: 5,
            y: 1,
            width: 10,
            height: 10,
            graphType: GRAPH_TYPE.ROUND,
            rotate: 0,
            cornerRadius: 0,
            lineWidth: 1,
            lineType: 1,
          }
        }],
        printCopies: printCopies,
      }],
      jobConfig: createJobConfig(density, labelType, printMode)
    };
  };

  /**
   * 生成图像打印配置
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 图像打印配置
   */
  const getImagePrintConfig = (printCopies, density, labelType, printMode) => {
    return {
      data: [{
        InitDrawingBoardParam: { width: 40, height: 20, rotate: 0 },
        elements: [{
          type: 'image',
          params: {
            imageData: LabelImageData.data,
            x: 0,
            y: 0,
            width: 40,
            height: 20,
            rotate: 0,
            imageProcessingType: 1,
            imageProcessingValue: 127,
          }
        }],
        printCopies: printCopies,
      }],
      jobConfig: createJobConfig(density, labelType, printMode)
    };
  };

  /**
   * 生成多元素批量打印配置
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 多重打印配置
   */
  const getMultiplePrintConfig = (printCopies, density, labelType, printMode) => {
    return {
      data: Array.from({ length: 5 }, (_, i) => ({
        InitDrawingBoardParam: { width: 40, height: 30, rotate: 0 },
        elements: [{
          type: 'text',
          params: {
            x: 4.375,
            y: 0.375,
            width: 30,
            height: 10,
            value: "蛋糕房 " + (i + 1),
            fontSize: 8,
            rotate: 0,
            lineMode: LINE_MODE_TYPE.ADAPT,
            lineSpace: 0,
            letterSpace: 0,
            textAlignHorizontal: 1,
            textAlignVertical: 1,
          }
        }, {
          type: 'barcode',
          params: {
            x: 5,
            y: 12,
            width: 30.0,
            height: 10.0,
            value: "1234567890",
            codeType: BAR_CODE_TYPE.CODE128,
            fontSize: 3,
            rotate: 0,
            textHeight: 5,
            textPosition: 0,
          }
        }],
        printCopies: printCopies,
      })),
      jobConfig: createJobConfig(density, labelType, printMode)
    };
  };

  /**
   * 根据打印类型获取配置
   * @param {string} printType - 打印类型
   * @param {number} printCopies - 打印份数
   * @param {number} density - 打印浓度
   * @param {number} labelType - 标签类型
   * @param {number} printMode - 打印模式
   * @returns {Object} 对应类型的打印配置
   */
  const getPrintConfig = (printType, printCopies, density, labelType, printMode) => {
    const configMap = {
      'text': getTextPrintConfig,
      'barcode': getBarcodePrintConfig,
      'qrcode': getQrcodePrintConfig,
      'line': getLinePrintConfig,
      'graph': getGraphPrintConfig,
      'image': getImagePrintConfig,
      'multiple': getMultiplePrintConfig
    };

    const generator = configMap[printType] || getTextPrintConfig;
    return generator(printCopies, density, labelType, printMode);
  };

  return {
    getPrintConfig,
    getTextPrintConfig,
    getBarcodePrintConfig,
    getQrcodePrintConfig,
    getLinePrintConfig,
    getGraphPrintConfig,
    getImagePrintConfig,
    getMultiplePrintConfig,
    createJobConfig
  };
}