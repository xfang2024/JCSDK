import {
  LINE_MODE_TYPE,
} from '@/src/constants/constants.js';
import JCAPI from '@/src/utils/print.js';

// ========================================
// 步骤 1：搜索蓝牙设备
// ========================================
export async function step1_searchDevices() {
  console.log('>>> 开始搜索设备...');

  // 打开蓝牙适配器
  await uni.openBluetoothAdapter();

  // 搜索设备（返回设备数组）
  const devices = await JCAPI.searchBluetoothDevices();
  console.log('>>> 搜索到设备:', devices);

  return devices;
}

// ========================================
// 步骤 2：连接设备
// ========================================
export async function step2_connectDevice(device) {
  console.log('>>> 连接设备:', device.name);

  const result = await JCAPI.connectPrinter(device);

  if (result.code === 0) {
    console.log('>>> 连接成功!');
    return true;
  } else {
    console.log('>>> 连接失败, 错误码:', result.code);
    return false;
  }
}


// ========================================
// 步骤 3：打印文本（可以切换至其他元素，也可以多个元素组合）
// ========================================
export async function step3_printText(text = '测试打印', callbacks = {}) {

  return new Promise(async (resolve, reject) => {
    console.log('>>> 开始打印:', text);
    const {
      onProgressUpdate = () => { },
      onSuccess = () => { },
      onError = () => { }
    } = callbacks;
    let totalCount = 1;
    // 是否发生错误
    let hasErrorOccurred = false;
    const calculatedTotal = totalCount;
    // 3.1 注册回调
    JCAPI.didReadPrintCountInfo((callbackResult) => {
      onProgressUpdate(callbackResult.count, calculatedTotal);
      if (callbackResult.count >= totalCount) {
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

    // 3.2 开始打印任务
    await JCAPI.startJob({
      density: 3,      // 浓度 1-5
      labelType: 1,    // 标签类型
      printMode: 1,     // 打印模式
      totalCount: totalCount,    // 打印总分数
    });

    // 3.3 初始化画布 (40mm 宽 x 20mm 高)
    await JCAPI.initDrawingBoard({
      width: 40,
      height: 30,
      rotate: 0
    });

    // 3.4 绘制文本
    await JCAPI.drawLabelText({
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
    });

    // 3.5 生成打印数据
    const printData = await JCAPI.generateLabelJson();

    // 3.6 提交打印数据
    await JCAPI.commitPrintData(printData, {
      printQuantity: 1
    });
  })
}


// ========================================
// 完整流程示例
// ========================================
export async function quickPrint(text = '快速打印测试', callbacks = {}) {
  try {
    // 1. 搜索
    const devices = await step1_searchDevices();
    if (!devices || devices.length === 0) {
      throw new Error('未找到设备');
    }

    // 2. 连接第一个设备
    const connected = await step2_connectDevice(devices[0]);
    if (!connected) {
      throw new Error('连接失败');
    }

    // 3. 打印
    await step3_printText(text, callbacks);
  } catch (error) {
    console.error('>>> 错误:', error);
  }
}


