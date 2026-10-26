<!--


打印设置组件功能说明

本组件提供打印机的核心参数设置功能，包括打印浓度、打印模式和标签类型的配置。

1. 打印浓度设置
- 功能：控制打印输出的深浅程度，影响打印质量和碳带/纸张消耗
- 数据类型：数字输入框
- 变量：density
- 处理函数：
* handleDensity(e): 处理输入事件，实时更新浓度值
* handleDensityBlur(e): 处理失去焦点事件，确保输入有效值
- 取值范围：根据打印机型号动态设置（1-3、1-5或1-15）
- 默认值：根据打印机型号自动设置
- 验证逻辑：通过getCurrentDensityConfig()获取当前打印机支持的浓度范围
- 输入限制：只允许输入数字，超出范围自动调整为边界值

2. 打印模式设置
- 功能：选择打印机的打印方式（热敏或热转印）
- 数据类型：下拉选择器
- 变量：printMode
- 数据源：PRINT_MODE_DATA常量数组
- 处理函数：printModePickerChange(e)
- 可选值：
* 热敏（值：1）：适用于热敏纸，无需碳带
* 热转印（值：2）：适用于普通纸，需要碳带
- 显示变量：printModePickerSelectedIndex（控制下拉选择器显示）
- 限制：根据打印机型号，部分型号只支持特定模式

3. 标签类型设置
- 功能：选择使用的标签纸张类型
- 数据类型：下拉选择器
- 变量：labelType
- 数据源：LABEL_TYPE_DATA常量数组
- 处理函数：labelTypePickerChange(e)
- 可选值：
* 间隙纸（值：1）：标签间有间隙的纸张
* 黑标纸（值：2）：标签间有黑色标记的纸张
* 连续纸（值：3）：无间隙无标记的连续纸张
* 定孔纸（值：4）：有固定定位孔的纸张
* 透明纸（值：5）：透明材质的标签纸
* 黑标间隙纸（值：6）：同时有黑标和间隙的纸张
- 显示变量：labelTypePickerSelectedIndex（控制下拉选择器显示）

4. 参数自动更新机制
- 当连接新设备时，通过updateDefaultParams()函数自动更新所有参数
- 根据打印机型号从PRINTER_MODEL_CONFIGS获取对应的默认配置
- 确保参数与当前连接的打印机兼容

5. 参数应用机制
- 所有打印设置参数在打印任务中通过jobConfig对象传递
- 在getCurrentPrintConfig()函数中，将当前设置应用到打印配置
- 确保打印任务使用最新的参数设置

注意：这些设置直接影响打印质量和兼容性，错误的设置可能导致打印失败或质量问题。
-->

<template>
   <!-- 打印设置部分 -->
   <view class="print-settings">
      <view class="section-title">打印设置</view>
      <view class="setting-item">
         <text class="setting-label">打印浓度:</text>
         <input class="setting-input" type="number" v-model="density" @input="handleDensity"
            @blur="handleDensityBlur" adjust-position="true" />
      </view>
      <view class="setting-item">
         <text class="setting-label">打印模式:</text>
         <picker mode="selector" :range="printModeData" range-key="name" :value="printModePickerSelectedIndex"
            @change="printModePickerChange">
            <view class="picker-value">{{ printModeData[printModePickerSelectedIndex].name }}</view>
         </picker>
      </view>
      <view class="setting-item">
         <text class="setting-label">标签类型:</text>
         <picker mode="selector" :range="labelTypeData" range-key="name" :value="labelTypePickerSelectedIndex"
            @change="labelTypePickerChange">
            <view class="picker-value">{{ labelTypeData[labelTypePickerSelectedIndex].name }}</view>
         </picker>
      </view>

   </view>
</template>

<script>
import { ref, watch, defineComponent } from 'vue';
import { PRINT_MODE_DATA, LABEL_TYPE_DATA, PRINTER_MODEL_CONFIGS } from '@/src/constants/constants.js';

export default defineComponent({
   name: 'PrintSetting',
   props: {
      // 已连接的打印机设备对象
      // 类型: Object
      // 默认值: null
      // 用途: 传入当前连接的打印机设备信息，用于获取打印机型号和配置
      // 注意: 当此属性变更时，组件会自动更新默认参数以匹配新的打印机型号
      connectedDevice: {
         type: Object,
         default: null
      },
      
      // 初始打印浓度参数
      // 类型: Number
      // 默认值: 3
      // 取值范围: 根据打印机型号动态设置（1-3、1-5或1-15）
      // 用途: 设置打印浓度的初始值，控制打印输出的深浅程度
      // 注意: 实际使用时会根据打印机型号自动调整到有效范围内
      initialDensity: {
         type: Number,
         default: 3
      },
      
      // 初始打印模式参数
      // 类型: Number
      // 默认值: 1
      // 取值范围: 1-2
      // 可选值:
      //   1 - 热敏模式（适用于热敏纸，无需碳带）
      //   2 - 热转印模式（适用于普通纸，需要碳带）
      // 用途: 设置打印模式的初始值，选择打印机的打印方式
      // 注意: 部分打印机型号可能只支持特定模式
      initialPrintMode: {
         type: Number,
         default: 1
      },
      
      // 初始标签类型参数
      // 类型: Number
      // 默认值: 1
      // 取值范围: 1-6
      // 可选值:
      //   1 - 间隙纸（标签间有间隙的纸张）
      //   2 - 黑标纸（标签间有黑色标记的纸张）
      //   3 - 连续纸（无间隙无标记的连续纸张）
      //   4 - 定孔纸（有固定定位孔的纸张）
      //   5 - 透明纸（透明材质的标签纸）
      //   6 - 黑标间隙纸（同时有黑标和间隙的纸张）
      // 用途: 设置标签类型的初始值，选择使用的标签纸张类型
      // 注意: 不同打印机型号可能支持不同的标签类型
      initialLabelType: {
         type: Number,
         default: 1
      }
   },
   emits: ['settings-change'],
   setup(props, { emit }) {
      // 响应式数据
      const printMode = ref(props.initialPrintMode);
      const density = ref(props.initialDensity);
      const labelType = ref(props.initialLabelType);
      const labelTypePickerSelectedIndex = ref(0);
      const labelTypeData = LABEL_TYPE_DATA;
      const printModePickerSelectedIndex = ref(0);
      const printModeData = PRINT_MODE_DATA;

      // 方法
      const printModePickerChange = (e) => {
         printModePickerSelectedIndex.value = e.detail.value;
         printMode.value = printModeData[printModePickerSelectedIndex.value].value;
         emitSettingsChange();
      };

      const labelTypePickerChange = (e) => {
         labelTypePickerSelectedIndex.value = e.detail.value;
         labelType.value = labelTypeData[labelTypePickerSelectedIndex.value].value;
         emitSettingsChange();
      };

      const handleDensity = (e) => {
         const inputValue = e.detail.value;
         const densityConfig = getCurrentDensityConfig();

         const value = handleInput({
            value: inputValue,
            allowEmpty: true,
            min: densityConfig.min,
            max: densityConfig.max,
            defaultValue: densityConfig,
            convertFunction: parseInt,
         });
         density.value = value;
         emitSettingsChange();
      };

      const handleDensityBlur = (e) => {
         const inputValue = e.detail.value;
         const densityConfig = getCurrentDensityConfig();

         const value = handleInput({
            value: inputValue,
            allowEmpty: false,
            min: densityConfig.min,
            max: densityConfig.max,
            defaultValue: densityConfig.default,
            convertFunction: parseInt,
            onBlur: true
         });

         density.value = value;
         emitSettingsChange();
      };

      // 通用输入处理函数
      /**
		 * 通用输入处理函数
		 * @param {Object} options - 处理选项
		 * @param {any} options.value - 输入值
		 * @param {boolean} options.allowEmpty - 是否允许空值
		 * @param {number} options.min - 最小值
		 * @param {number} options.max - 最大值
		 * @param {any} options.defaultValue - 默认值
		 * @param {Function} options.convertFunction - 类型转换函数
		 * @param {boolean} options.onBlur - 是否为失去焦点事件
		 * @returns {any} 处理后的值
		 */
		const handleInput = ({ value, allowEmpty = false, min, max, defaultValue, convertFunction = Number, onBlur = false }) => {
			// 如果输入为空
			if (value === '' || value === null || value === undefined) {
				// 如果允许空值且不是失去焦点事件，返回空值
				if (allowEmpty && !onBlur) {
					return null;
				}
				// 否则返回默认值
				return defaultValue;
			}

			// 类型转换
			let convertedValue = convertFunction(value);

			// 如果转换后不是有效数字，返回默认值
			if (isNaN(convertedValue)) {
				return defaultValue;
			}

			// 范围验证：小于最小值自动设为最小值，大于最大值自动设为最大值
			if (convertedValue < min) {
				convertedValue = min;
			} else if (convertedValue > max) {
				convertedValue = max;
			}

			return convertedValue;
		};

      // 获取当前打印机型号
      const getPrinterModel = () => {
         let model = 'DEFAULT';
			if (props.connectedDevice) {
				// 定义设备名称前缀与型号的映射关系
				const modelMap = {
					'D11': 'D11',
					'D101': 'D101',
					'D110': 'D110',
					'H10': 'H10',
					'B16': 'B16',
					'B18': 'B18',
					'N1': 'N1',
					'B3S': 'B3S',
					'B203': 'B203',
					'B1': 'B1',
					'B31': 'B31',
					'B4': 'B4',
					'K3': 'K3',
					'K3W': 'K3W',
					'K2': 'K2',
					'M2': 'M2',
					'M3': 'M3',
					'B50': 'B50',
					'B11': 'B11',
					'B50W': 'B50W',
					'B32': 'B32',
					'Z401': 'Z401'
				};

				// 获取所有设备名称前缀
				const prefixes = Object.keys(modelMap);

				// 遍历检查设备名称是否以某个前缀开头
				for (const prefix of prefixes) {
					if (props.connectedDevice.name.startsWith(prefix)) {
						model = modelMap[prefix];
						break;
					}
				}

				// 若未匹配到任何前缀，使用默认型号
				if (!Object.values(modelMap).includes(model)) {
					model = 'DEFAULT';
				}
			}

			return model;
      };

      // 获取当前打印机的浓度配置
      const getCurrentDensityConfig = () => {
         const model = getPrinterModel();
         return PRINTER_MODEL_CONFIGS[model]?.density || { min: 1, max: 15, default: 3 };
      };

      const updateDefaultParams = () => {
         const model = getPrinterModel();
         const config = PRINTER_MODEL_CONFIGS[model];
         if (config) {
            density.value = config.density.default;
            printMode.value = config.printModes[0];
            labelType.value = config.labelType;

            printModePickerSelectedIndex.value = printModeData.findIndex(item => item.value === printMode.value);
            labelTypePickerSelectedIndex.value = labelTypeData.findIndex(item => item.value === labelType.value);

            emitSettingsChange();
         }
      };

      // 发射设置变化事件
      /**
       * 发射设置变化事件，将当前打印参数传递给父组件
       * 
       * 事件参数说明：
       * - density: 打印浓度参数
       *   类型: Number
       *   取值范围: 根据打印机型号动态设置（1-3、1-5或1-15）
       *   默认值: 根据打印机型号自动设置
       *   用途: 控制打印输出的深浅程度，影响打印质量和碳带/纸张消耗
       * 
       * - printMode: 打印模式参数
       *   类型: Number
       *   取值范围: 1-2
       *   可选值: 
       *     1 - 热敏模式（适用于热敏纸，无需碳带）
       *     2 - 热转印模式（适用于普通纸，需要碳带）
       *   默认值: 1（热敏模式）
       *   用途: 选择打印机的打印方式
       * 
       * - labelType: 标签类型参数
       *   类型: Number
       *   取值范围: 1-6
       *   可选值:
       *     1 - 间隙纸（标签间有间隙的纸张）
       *     2 - 黑标纸（标签间有黑色标记的纸张）
       *     3 - 连续纸（无间隙无标记的连续纸张）
       *     4 - 定孔纸（有固定定位孔的纸张）
       *     5 - 透明纸（透明材质的标签纸）
       *     6 - 黑标间隙纸（同时有黑标和间隙的纸张）
       *   默认值: 1（间隙纸）
       *   用途: 选择使用的标签纸张类型
       */
      const emitSettingsChange = () => {
         emit('settings-change', {
            density: density.value,
            printMode: printMode.value,
            labelType: labelType.value
         });
      };

      // 监听设备连接状态变化
      watch(() => props.connectedDevice, (newDevice) => {
         if (newDevice) {
            updateDefaultParams();
         }
      }, { immediate: true });

      // 返回模板需要的所有变量和方法
      return {
         printMode,
         density,
         labelType,
         labelTypePickerSelectedIndex,
         labelTypeData,
         printModePickerSelectedIndex,
         printModeData,
         printModePickerChange,
         labelTypePickerChange,
         handleDensity,
         handleDensityBlur,
         getPrinterModel,
         getCurrentDensityConfig,
         updateDefaultParams,
         emitSettingsChange
      };
   }
});
</script>

<style scoped>
@import "./print-setting.css";
</style>