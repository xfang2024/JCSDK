// 引入niimbot-jcsdk中的JCPrinter类
import { JCPrinter } from '@/uni_modules/niimbot-jcsdk';

// 实例化JCPrinter
const jcapi = new JCPrinter();

const JCAPI = {
    /**
     * 初始化SDK
     * @returns {Promise} - 初始化操作完成的Promise
     */
    initSDK() {
        return new Promise((resolve, _) => {
            jcapi.initSDK();
            resolve();
        });
    },

    /**
     * 搜索蓝牙设备
     * @returns {Promise} - 返回包含蓝牙设备列表的Promise
     */
    searchBluetoothDevices() {
        return this._searchDevices('getBluetoothDevices', null);
    },


    /**
     * 搜索带名称过滤的蓝牙设备
     * @param {string|string[]} name - 要过滤的设备名称，传入空字符串""表示不过滤，传入数组表示仅搜索指定名称开头的设备
     * @returns {Promise} - 返回包含蓝牙设备列表的Promise
     */
    searchBluetoothDevicesWithName(name) {
        // 处理不同的参数情况
        if (name === "") {
            // 空字符串表示不过滤，使用普通蓝牙搜索
            return this._searchDevices('getBluetoothDevices', null);
        } else if (Array.isArray(name) && name.length > 0) {
            // 数组表示过滤特定名称的设备
            return this._searchDevices('getBluetoothDevicesWithName', { "name": name });
        } else {
            // 其他情况默认不过滤
            return this._searchDevices('getBluetoothDevices', null);
        }
    },

    /**
     * 搜索WiFi设备
     * @returns {Promise} - 返回包含WiFi设备列表的Promise
     */
    searchWifiDevices() {
        return this._searchDevices('getWifiDevices', null);
    },

    /**
     * 搜索设备
     * @param {string} method - 要调用的jcapi方法名
     * @param {object} params - 传递给方法的参数
     * @returns {Promise} - 返回包含设备列表的Promise
     */
    _searchDevices(method, params) {
        return new Promise((resolve, reject) => {
            // 根据方法名调用相应的jcapi方法
            if (params) {
                jcapi[method](params, (res) => {
                    // 为每个设备添加设备类型字段
                    if (res && Array.isArray(res)) {
                        resolve(res);
                    } else {
                        reject(new Error("搜索异常"))
                    }

                });
            } else {
                jcapi[method]((res) => {
                    if (res && Array.isArray(res)) {
                        resolve(res);
                    } else {
                        reject(new Error("搜索异常"))
                    }
                });
            }
        });
    },


    /**
     * 连接打印机
     * @param {Object} item 打印机设备对象
     * @param {string} item.address 设备地址,Android 为mac地址，IOS为UUID
     * @param {string} item.name 设备名称
     * @param {number} item.deviceType 设备类型（0-蓝牙，1-网络）
     * @returns {Promise<Object>} 连接成功时解析响应结果，失败时拒绝响应结果
     */
    connectPrinter(item) {
        return new Promise((resolve, reject) => {
            // 使用setTimeout将连接操作放到异步执行环境中，确保弹窗关闭操作能够立即执行
            setTimeout(() => {
                // 调用jcapi的openPrinterByDevice方法连接打印机
                jcapi.openPrinterByDevice({
                    address: item.address,  // 打印机设备地址
                    name: item.name,        // 打印机设备名称
                    deviceType: item.deviceType // 设备类型：0-蓝牙，1-网络
                }, (res) => {
                    if (res.code === 0) {
                        // 解析响应结果
                        resolve(res);
                    } else {
                        // 连接失败，拒绝响应结果
                        reject(new Error(res));
                    }
                });
            }, 0);
        });
    },



    /**
     * 检测设备连接
     * @returns {Promise} - 返回一个Promise，连接成功时解析响应结果，失败时拒绝响应结果
     */
    isConnected() {
        return new Promise((resolve, reject) => {


            const connectStatus = jcapi.isConnected().value
			console.log("jcapi.isConnected()",jcapi.isConnected())
            if (connectStatus === 1) {
                resolve();
            } else {
                reject(new Error("未连接"));
            }
        });
    },

    /**
     * 配置打印机网络
     * @param {*} data 配置参数
     * @param {string} data.wifiName - Wi-Fi网络的名称（只支持2.4GHz网络）。
     * @param {string} data.wifiPwd - Wi-Fi网络的密码。
     * @returns {Promise} - 配置网络操作完成的Promise，成功时解析'配网成功'，失败时拒绝包含错误信息的Error对象
     * 
     * 注意：只能在蓝牙连接下给打印机进行配网操作，无法在Wi-Fi连接下进行。
     * 另外，只有部分机型支持局域网打印，且只支持2.4GHz的网络。
     */
    configurePrinterNetWork(data) {
        return new Promise((resolve, reject) => {
            jcapi.configWifi(data, (res) => {
                if (res.code === 0) {
                    resolve('配网成功');
                } else {
                    console.log("res", res)
                    reject(new Error(res));
                }
            });
        });
    },

    /**
     * 断开打印机连接
     * @returns {Promise} - 断开连接操作完成的Promise
     */
    disconnectPrinter() {
        return new Promise((resolve, _) => {
            jcapi.close();
            resolve();
        });
    },

    /**
     * 开始打印任务
     * @param {object} data 打印任务所需的数据
     * @param {number} data.totalCount - 总打印份数，表示所有页面的打印份数之和。
     *                                 例如，如果你有3页需要打印，第一页打印3份，第二页打印2份，第三页打印5份，那么totalCount的值应为10（3 + 2 + 5）。
     * @param {number} data.density - 打印浓度
     *                               - D11、D101、D110、H10、B16、B18、N1: 1~3，默认2
     *                               - B3S、B203、B1、B203、B31、B4、K3、K3W、K2、M2、M3: 1~5，默认3
     *                               - B50、B11、B50W、B32、Z401: 1~15，默认8
     * @param {number} data.labelType - 标签类型
     *                               - 1: 间隙纸
     *                               - 2: 黑标纸
     *                               - 3: 连续纸
     *                               - 4: 定孔纸
     *                               - 5: 透明纸
     *                               - 6: 标牌
     *                               - 10: 黑标间隙纸
     * @param {number} data.printMode - 打印模式
     *                               - 1: 热敏 - D11、D101、D110、H10、B16、B3S、B203、B1、B203、B31、B4、K3、K3W、B11仅支持热敏
     *                               - 2: 热转印 - B50、B50W、B32、Z401、M2、M3、N1、B18仅支持热转印
     * @returns {Promise} - 返回包含打印结果的Promise，成功时解析结果，失败时拒绝结果
     */
    startJob(data) {
        return new Promise((resolve, reject) => {
            jcapi.startJob(data, function (res) {
                if (res.code === 0) {
                    resolve();
                } else {
                    reject(new Error(res));
                }
            });
        });
    },

    /**
     * 初始化绘图板
     * @param {object} data - 初始化绘图板所需的参数
     * @param {number} data.width - 画板宽度，单位mm
     * @param {number} data.height - 画板高度，单位mm
     * @param {number} [data.rotate=0] - 画板旋转角度（可选），默认为0，不旋转。支持的旋转角度：0、90、180、270。
     * @returns {Promise} - 初始化操作完成的Promise
     */
    initDrawingBoard(data) {
        return new Promise((resolve, _) => {
            jcapi.initDrawingBoard(data);
            resolve();
        });
    },

    /**
     * 绘制文本
     * @param {{}} params 绘制参数
     * @param {number} params.x 元素起始x坐标
     * @param {number} params.y 元素起始y坐标
     * @param {number} params.width 文本框宽度，单位mm
     * @param {number} params.height 文本框高度，单位mm
     * @param {string} params.value 绘制文字内容
     * @param {number} params.fontSize 字体大小，单位mm。默认高度4mm。
     * @param {number} params.rotate （可选）画板旋转角度，默认为0，不旋转。支持的旋转角度 0、90、180、270。
     * @param {number} params.lineMode 换行方式，默认为2。
     *                              1: 宽高固定，内容大小自适应（字号/字符间距/行间距，按比例缩放）
     *                              2: 宽度固定，高度自适应 
     *                              6: 宽高固定，内容超过预设的宽高时自动缩小
     * @param {number} params.letterSpace 字间隔。默认为0。
     * @param {number} params.lineSpace 行间隔。默认为0。
     * @param {number} params.textAlignHorizontal 文字水平布局，默认为1。
     *                                         0：左对齐
     *                                         1：水平居中
     *                                         2：右边对齐
     * @param {number} params.textAlignVertical 文字垂直布局，默认为1。（备注：换行模式为2时无效）
     *                                        0：顶部对齐
     *                                        1：垂直居中
     *                                        2：底部对齐
     * @param {number} params.bold 文字加粗样式设置，默认为0。（暂不生效）
     *                          0：正常
     *                          1：加粗
     * @param {number} params.italics 文字斜体样式设置，默认为0。（暂不生效）
     *                            0：正常
     *                            1：斜体
     * @param {number} params.underline 文字下划线样式设置，默认为0。（暂不生效）
     *                              0：正常
     *                              1：下划线
     * @returns {Promise} - 绘制操作完成的Promise
     */
    drawLabelText(params) {
        return new Promise((resolve, _) => {
            jcapi.drawLabelText(params);
            resolve();
        });
    },

    /**
     * 绘制图片
     * @param {{}} params 绘制参数 需要去除base64数据头
     * @param {string} params.imageData 图片base64数据 需要去除base64数据头前缀
     * @param {number} params.x 元素起始x坐标
     * @param {number} params.y 元素起始y坐标
     * @param {number} params.width 图片宽度，单位mm
     * @param {number} params.height 图片高度，单位mm
     * @param {number} params.rotate （可选）画板旋转角度，默认为0，不旋转。支持的旋转角度 0、90、180、270。
     * @param {number} params.imageProcessingType （可选）处理算法，默认为1
     * @param {number} params.imageProcessingValue （可选）阈值，默认127
     * @returns {Promise} - 绘制操作完成的Promise
     */
    drawLabelImage(params) {
        return new Promise((resolve, _) => {
            jcapi.drawLabelImage(params);
            resolve();
        });
    },

    /**
     * 绘制线条
     * @param {{}} params 绘制参数
     * @param {number} params.x 元素起始x坐标
     * @param {number} params.y 元素起始y坐标
     * @param {number} params.width 线条宽度，单位mm
     * @param {number} params.height 线条高度，单位mm
     * @param {number} params.rotate （可选）画板旋转角度，默认为0，不旋转。支持的旋转角度 0、90、180、270。
     * @param {number} params.lineType 线条类型，默认类型为1。
     *                                1: 实线
     *                                2: 虚线
     * @returns {Promise} - 绘制操作完成的Promise
     */
    drawLabelLine(params) {
        return new Promise((resolve, _) => {
            jcapi.drawLabelLine(params);
            resolve();
        });
    },

    /**
     * 绘制形状
     * @param {{}} params 绘制参数
     * @param {number} params.x 元素起始x坐标
     * @param {number} params.y 元素起始y坐标
     * @param {number} params.width 形状宽度，单位mm
     * @param {number} params.height 形状高度，单位mm
     * @param {number} params.graphType 图像类型，默认类型为1。
     *                                1: 圆形
     *                                2: 椭圆
     *                                3: 矩形
     *                                4: 圆角矩形 
     * @param {number} params.rotate （可选）画板旋转角度，默认为0，不旋转。支持的旋转角度 0、90、180、270。
     * @param {number} params.cornerRadius 圆角半径，单位mm
     * @param {number} params.lineWidth 线条宽，单位mm。默认线宽为0.2mm。
     * @param {number} params.lineType 线条类型，默认类型为1。
     *                                1: 实线
     *                                2: 虚线
     * @returns {Promise} - 绘制操作完成的Promise
     */
    drawLabelGraph(params) {
        return new Promise((resolve, _) => {
            jcapi.drawLabelGraph(params);
            resolve();
        });
    },

    /**
     * 绘制条形码
     * @param {{}} params 绘制参数
     * @param {number} params.x 元素起始x坐标
     * @param {number} params.y 元素起始y坐标
     * @param {number} params.width 条码宽度，单位mm
     * @param {number} params.height 条码高度，单位mm
     * @param {string} params.value 条码内容
     * @param {number} params.fontSize 字体大小，单位mm。默认4mm。
     * @param {number} params.rotate （可选）画板旋转角度，默认为0，不旋转。支持的旋转角度 0、90、180、270。
     * @param {number} params.codeType 条码类型。默认类型20。
     *                                20: CODE128
     *                                21: UPC-A
     *                                22: UPC-E
     *                                23: EAN8
     *                                24: EAN13
     *                                25: CODE93
     *                                26: CODE39
     *                                27: CODEBAR
     *                                28: ITF25
     * @param {number} params.textHeight 文本高度。默认高度4mm。
     * @param {number} params.textPosition 条码文本位置。默认为0。
     *                                   0: 下方显示
     *                                   1: 上方显示
     *                                   2: 不显示
     * @returns {Promise} - 绘制操作完成的Promise
     */
    drawLabelBarCode(params) {
        return new Promise((resolve, _) => {
            jcapi.drawLabelBarCode(params);
            resolve();
        });
    },

    /**
     * 绘制二维码
     * @param {{}} params 绘制参数
     * @param {number} params.x 元素起始x坐标
     * @param {number} params.y 元素起始y坐标
     * @param {number} params.width 二维码宽度，单位mm
     * @param {number} params.height 二维码高度，单位mm
     * @param {string} params.value 二维码内容
     * @param {number} params.rotate （可选）画板旋转角度，默认为0，不旋转。支持的旋转角度 0、90、180、270。
     * @param {number} params.codeType 二维码类型，默认类型31。
     *                                31: QR_CODE
     *                                32: PDF417
     *                                33: DATA_MATRIX
     *                                34: AZTEC
     * @returns {Promise} - 绘制操作完成的Promise
     */
    drawLabelQrCode(params) {
        console.log('drawLabelQrcode', params);
        return new Promise((resolve, _) => {
            jcapi.drawLabelQrCode(params);
            resolve();
        });
    },

    /**
     * 生成打印数据
     * @returns {Promise} - 返回包含打印数据的Promise，成功时解析数据，失败时拒绝数据
     * @description 该函数用于生成打印数据，返回一个Promise对象，成功时解析打印数据，失败时闪退（主要原因为绘制元素前未设置画布）。
     */
    generateLabelJson() {
        return new Promise((resolve, reject) => {
            try {
                resolve(jcapi.generateLabelJson());
            } catch (error) {
                console.error("生成打印数据失败:", error);
                reject(new Error(error));
            }
        });
    },
    /**
     * 预览打印数据
     * @param {any} data - 要预览的打印数据
     * @returns {Promise} - 返回包含预览结果的Promise，成功时解析结果，失败时拒绝结果
     * @description 该函数用于预览打印数据，返回一个Promise对象，成功时解析预览结果，失败时拒绝结果。
     */
    previewPrintData(data) {
        return new Promise((resolve, reject) => {
            try {
                // 处理一下数据，自动加上数据头
                const imageData = "data:image/jpeg;base64," + jcapi.generatePrintPreviewImage(data).base64;
                resolve(imageData);
            } catch (error) {
                console.error("预览打印数据失败:", error);
                reject(new Error(error));
            }
        });
    },

    /**
     * 提交打印数据
     * @param {any} data - 要提交的打印数据（由 generateLabelJson 生成的对象）
     * @param {object} options - 打印配置对象
     * @param {number} options.printQuantity - 本次打印份数，必须传入
     * @returns {Promise<Object>} - 返回 Promise，成功时解析打印结果对象，失败时拒绝并返回错误信息
     */
    commitPrintData(data, options) {
        console.log('commitPrintData', data, options)
        return new Promise((resolve, reject) => {
            jcapi.printData(data, options, (res) => {
                console.log('printData', res)
                if (res.code === 0) {
                    resolve(res);
                } else {
                    reject(new Error(res));
                }
            });
        });
    },

    /**
     * 取消打印任务
     * @returns {Promise} - 返回包含取消结果的Promise，成功时解析结果，失败时拒绝结果
     */
    cancelPrint() {
        console.log('cancelPrint')
        return new Promise((resolve, reject) => {
            jcapi.cancelJob((res) => {
                console.log(res)
                if (res.code === 0) {
                    resolve(res);
                } else {
                    reject(new Error(res));
                }
            })
        });
    },

    /**
     * 监听当前任务打印异常回调（出错后单次上报）
     * @param {Object.<string, number>} callback - 异常信息对象，包含错误类型代码
     * @param {number} callback.code - 错误类型代码，表示打印异常的类型
     * @returns {void}
     * 
     * 异常类型说明：
     * 1  - 盒盖打开
     * 2  - 缺纸
     * 3  - 电量不足
     * 4  - 电池异常
     * 5  - 手动停止（按键）
     * 6  - 数据错误
     * 7  - 温度过高
     * 8  - 出纸异常
     * 9  - 正在打印
     * 10 - 没有检测到打印头
     * 11 - 环境温度过低
     * 12 - 打印头未锁紧
     * 13 - 未检测到碳带
     * 14 - 不匹配的碳带
     * 15 - 用完的碳带
     * 16 - 不支持的纸张类型
     * 17 - 纸张类型设置失败
     * 18 - 打印模式设置失败
     * 19 - 设置浓度失败
     * 20 - 写入RFID失败
     * 21 - 边距设置失败
     * 22 - 通讯异常
     * 23 - 打印机连接断开
     * 24 - 画板参数错误
     * 25 - 旋转角度错误
     * 26 - JSON参数错误
     * 27 - 出纸异常（B3S）
     * 28 - 检查纸张类型
     * 29 - RFID标签未进行写入操作
     * 30 - 不支持浓度设置
     * 31 - 不支持的打印模式
     * 34 - 不支持RFID写入
     * 50 - 非法标签
     * 51 - 非法碳带和标签
     * 52 - 固件接收数据超时
     * 53 - 非专用色带（当前机型使用了型号不匹配的色带）
     * 58 - 非正品耗材（标签与色带均未识别）（适用于部分新机型）
     * 59 - 非正品色带（色带均未识别）（适用于部分新机型）
     * 60 - 耗材超限（标签与色带均超过使用限制）（适用于部分新机型）
     * 61 - 色带超限（色带超过使用限制）（适用于部分新机型）
     * 62 - 非正品标签（标签未识别）（适用于部分新机型）
     * 63 - 标签超限（标签超过使用限制）（适用于部分新机型）
     */
    didReadPrintErrorInfo(callback) {
        if (typeof callback !== 'function') {
            console.error('didReadPrintErrorInfo: 回调参数必须是一个函数');
            return;
        }
        jcapi.didReadPrintErrorInfo(callback);
    },

    /**
     * 当前任务打印进度回调（会多次执行）
     * 
     * @param {Object.<string, number>} callback - 打印进度信息对象，包含已打印标签数
     * @param {number} callback.count - 已打印标签数
     * @returns {void}
     */
    didReadPrintCountInfo(callback) {
        if (typeof callback !== 'function') {
            console.error('didReadPrintCountInfo: 回调参数必须是一个函数');
            return;
        }
        jcapi.didReadPrintCountInfo(callback);
    }
}

export default JCAPI;