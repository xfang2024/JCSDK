/** 标签类型 */
export const LABEL_TYPE = {
    GAP: 1, // 间隙纸
    BLACK_MARK: 2, // 黑标纸
    CONTINUOUS: 3, // 连续纸
    FIXED_HOLE: 4, // 定孔纸
    TRANSPARENT: 5, // 透明纸
    BLACK_MARK_GAP: 6 // 黑标间隙纸
};

/** 条码类型 */
export const BAR_CODE_TYPE = {
    CODE128: 20,
    CODE_UPC_A: 21,
    CODE_UPC_E: 22,
    EAN8: 23,
    EAN13: 24,
    CODE93: 25,
    CODE39: 26,
    CODE_BAR: 27,
    ITF25: 28
};

/** 二维码类型 */
export const QR_CODE_TYPE = {
    QR_CODE: 31,
    PDF417: 32,
    DATA_MATRIX: 33,
    AZTEC: 34
};

// UI常量：index.vue 页面UI展示相关常量（如下拉选项、显示文本）

/** 打印模式数据 */
export const PRINT_MODE_DATA = [
    { name: '热敏', value: 1 },
    { name: '热转印', value: 2 }
];

/** 标签类型数据 */
export const LABEL_TYPE_DATA = [
    { name: '间隙纸', value: LABEL_TYPE.GAP },
    { name: '黑标纸', value: LABEL_TYPE.BLACK_MARK },
    { name: '连续纸', value: LABEL_TYPE.CONTINUOUS },
    { name: '定孔纸', value: LABEL_TYPE.FIXED_HOLE },
    { name: '透明纸', value: LABEL_TYPE.TRANSPARENT },
    { name: '黑标间隙纸', value: LABEL_TYPE.BLACK_MARK_GAP }
];


/** 绘制支持的旋转角度 */
export const LABEL_ROTATE_TYPE = {
    NONE: 0,
    ROTATE_90: 90,
    ROTATE_180: 180,
    ROTATE_270: 270
};

/** 换行方式 */
export const LINE_MODE_TYPE = {
    JUSTIFIED: 1, // 宽高固定，内容自适应（字号/字间距/行间距按比例缩放）
    AUTO_HEIGHT: 2, // 宽度固定，高度自适应
    FIXED: 4, // 宽高固定，超出部分裁剪
    ADAPT: 6 // 宽高固定，内容超过时预设宽高自动缩小
};

/** 二维码文字显示位置 */
export const BAR_CODE_TEXT_POSITION = {
    BELOW: 0, // 下方显示
    ABOVE: 1, // 上方显示
    HIDDEN: 2 // 不显示
};

/** 线条类型 */
export const LINE_TYPE = {
    SOLID: 1, // 实线
    DOTTED: 2 // 虚线（默认虚实1:1相间）
};

/** 图形类型 */
export const GRAPH_TYPE = {
    ROUND: 1, // 圆形
    OVAL: 2, // 椭圆形
    RECTANGLE: 3, // 矩形
    ROUNDED_RECTANGLE: 4 // 圆角矩形
};

/** 打印机错误码映射 */
export const ERROR_CODE_MAP = {
    //打印机错误码
    1: '盒盖打开(错误码1)：请关闭打印机盒盖后重新提交任务',
    2: '缺纸(错误码2)：打印机纸张不足，请补充对应规格纸张后重试',
    3: '电量不足(错误码3)：打印机电量低，建议连接电源或更换满电电池',
    4: '电池异常(错误码4)：请检查打印机电池状态',
    5: '手动停止(错误码5)：打印任务被手动停止',
    6: '数据错误(错误码6)：打印数据格式错误，请检查数据',
    7: '温度过高(错误码7)：打印机温度过高，请稍后重试',
    8: '出纸异常(错误码8)：打印机出纸异常，请检查纸张路径',
    9: '正在打印(错误码9)：打印机正在处理其他任务，请稍后重试',
    10: '没有检测到打印头(错误码10)：请检查打印头是否正确安装',
    11: '环境温度过低(错误码11)：环境温度过低，请在适宜温度下使用',
    12: '打印头未锁紧(错误码12)：请检查并锁紧打印头',
    13: '未检测到碳带(错误码13)：请检查碳带是否正确安装',
    14: '不匹配的碳带(错误码14)：请使用匹配的碳带',
    15: '用完的碳带(错误码15)：碳带已用完，请更换新的碳带',
    16: '不支持的纸张类型(错误码16)：当前纸张类型不被支持',
    17: '纸张类型设置失败（错误码17）：纸张类型设置失败，请重试',
    18: '打印模式设置失败（错误码18）：打印模式设置失败，请重试',
    19: '设置浓度失败（错误码19）：打印浓度设置失败，请重试',
    20: '写入rfid失败（错误码20）：RFID写入失败，请重试',
    21: '边距设置失败（错误码21）：边距设置失败，请重试',
    22: '通讯异常（错误码22）：打印机通讯异常，请检查连接',
    23: '打印机连接断开（错误码23）：打印机连接已断开，请重新连接',
    24: '画板参数错误（错误码24）：画板参数错误，请检查设置',
    25: '旋转角度错误（错误码25）：旋转角度设置错误，请检查',
    26: 'json参数错误（错误码26）：JSON参数格式错误，请检查数据',
    27: '出纸异常（B3S）（错误码27）：B3S型号打印机出纸异常，请检查',
    28: '检查纸张类型（错误码28）：请检查并确认纸张类型',
    29: 'RFID标签未进行写入操作（错误码29）：RFID标签未写入，请操作',
    30: '不支持浓度设置（错误码30）：当前打印机不支持浓度设置',
    31: '不支持的打印模式（错误码31）：当前打印机不支持该打印模式',
    34: '不支持RFID写入（错误码34）：当前打印机不支持RFID写入功能',
    50: '非法标签（错误码50）：检测到非法标签，请检查标签',
    51: '非法碳带和标签（错误码51）：检测到非法碳带和标签组合，请检查碳带和标签',
    52: '固件接收数据超时（错误码52）：打印机固件接收数据超时，请检查连接',
    53: '非专用色带（当前机型使用了型号不匹配的色带）（错误码53）：请使用匹配的色带',
    58: '非正品耗材（标签与色带均未识别）（适用于部分新机型）,请检查标签和色带',
    59: '非正品色带（色带均未识别）（适用于部分新机型）,请检查色带',
    60: '耗材超限（标签与色带均超过使用限制）（适用于部分新机型）,请检查标签和色带',
    61: '色带超限（色带超过使用限制）（适用于部分新机型）,请检查色带',
    62: '非正品标签（标签未识别）（适用于部分新机型）,请检查标签',
    63: '标签超限（标签超过使用限制）（适用于部分新机型）,请检查标签',
    //WIFI相关错误
    1001: '未连接到WiFi网络：请在搜索WIFI打印机前先连接WIFI网络',
    // 配网错误
    1011: '配网失败（错误码1021）：配网过程失败，请检查网络设置（WIFI账号密码是否正确、WIFI网络是否为2.4G网络且WIFI正常开启、WIFI网络是否为多子网网络）',

    // 打印机状态错误
    1021: '打印机忙碌，请稍后重试',
    1022: '打印机不支持此操作，请检查打印机型号',
    1023: '打印机离线，请检查打印机状态',

    // 蓝牙相关错误
    2001: '位置权限被拒绝，蓝牙搜索需要位置权限',
    2002: '未搜索到设备',
    2003: '蓝牙未正常开启,请在设置中开启蓝牙',


    // 设备错误
    4001: '设备连接失败，请检查设备状态',
    4002: '设备已断开连接',
    4003: '设备忙碌，请稍后重试',
    4004: '设备断开连接失败',
    // 通用错误
    9001: '操作失败，请稍后重试',
    9002: '参数错误，请检查输入',
};




/** 不同打印机型号的参数配置 */
export const PRINTER_MODEL_CONFIGS = {
    // D11、D101、D110、H10、B16、B18、N1: 密度范围1~3，默认2
    'D11': { density: { min: 1, max: 3, default: 2 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'D101': { density: { min: 1, max: 3, default: 2 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'D110': { density: { min: 1, max: 3, default: 2 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'H10': { density: { min: 1, max: 3, default: 2 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B16': { density: { min: 1, max: 3, default: 2 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B18': { density: { min: 1, max: 3, default: 2 }, labelType: LABEL_TYPE.GAP, printModes: [2] },
    'N1': { density: { min: 1, max: 3, default: 2 }, labelType: LABEL_TYPE.GAP, printModes: [2] },

    // B3S、B203、B21、B1、B31、B4、K3、K3W、K2、M2、M3: 密度范围1~5，默认3
    'B3S': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B203': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B21': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B1': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B31': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B4': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'K3': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'K3W': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'K2': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'M2': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [2] },
    'M3': { density: { min: 1, max: 5, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [2] },

    // B50、B11、B50W、B32、Z401: 密度范围1~15，默认8
    'B50': { density: { min: 1, max: 15, default: 8 }, labelType: LABEL_TYPE.GAP, printModes: [2] },
    'B11': { density: { min: 1, max: 15, default: 8 }, labelType: LABEL_TYPE.GAP, printModes: [1] },
    'B50W': { density: { min: 1, max: 15, default: 8 }, labelType: LABEL_TYPE.GAP, printModes: [2] },
    'B32': { density: { min: 1, max: 15, default: 8 }, labelType: LABEL_TYPE.GAP, printModes: [2] },
    'Z401': { density: { min: 1, max: 15, default: 8 }, labelType: LABEL_TYPE.GAP, printModes: [2] },

    // 默认配置（用于不匹配任何特定型号的情况）
    'DEFAULT': { density: { min: 1, max: 15, default: 3 }, labelType: LABEL_TYPE.GAP, printModes: [1] }
};