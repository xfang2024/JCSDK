<!--
	组件名称: PrintFunctions
	引入路径: @/components/PrintFunctions.vue
	功能描述: 提供完整的打印功能管理，包括打印类型选择、打印参数设置、打印预览和打印进度管理
	使用条件: 需要传入已连接的打印机设备对象
	参数说明:
	  - connectedDevice: 已连接的打印机设备对象，用于执行打印操作
	  - isModalOpen: 全局弹窗状态，用于协调多个弹窗的显示
	  - modalState: 全局弹窗类型状态
	  - @modal-state-change: 监听弹窗状态变化事件
	注意事项: 
	  1. 组件会根据连接的打印机型号自动调整打印参数范围和默认值
	  2. 打印功能涉及多种弹窗管理，需要与设备连接板块的弹窗状态统一管理
	  3. 打印参数变更会通过事件实时通知父组件
	  4. 这些参数直接影响打印质量和兼容性
-->
<template>
  <view>
    <!-- 打印功能部分 -->
    <view class="print-functions">

      <print-type-selector v-model="selectedPrintType" />

      <!-- 打印管理 -->
      <print-action-buttons @print="setPrintCopies" @preview="previewPrintData" />
    </view>

    <print-copies-dialog v-model="showPrintDialog" :copies="printCopies" @update:copies="printCopies = $event"
      @confirm="handlePrint" />


    <!-- 打印预览弹窗 -->
    <print-preview-dialog v-model="showPrintPreviewDialog" :preview-data-list="previewDataList" :copies="printCopies"
      @update:copies="printCopies = $event" @confirm="handlePrint" />

    <!-- 打印进度弹窗 -->
    <print-progress-dialog :visible="showPrintProgress" :progress="printProgress" :total="printTotal"
      :status="printStatus" :error-message="printErrorMessage" :show-cancel-button="printStatus === 'progress'"
      :cancel-text="'取消'" @close="hidePrintProgressDialog" @cancel="cancelPrintJob"
      @confirm="hidePrintProgressDialog" />
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { usePrintConfig } from '@/components/print/composables/usePrintConfig.js';
import { usePrintExecution } from '@/components/print/composables/usePrintExecution.js';
import { useInputValidation } from '@/components/print/composables/useInputValidation.js';
import PrintTypeSelector from '@/components/print/PrintTypeSelector.vue';
import PrintActionButtons from '@/components/print/PrintActionButtons.vue';
import PrintCopiesDialog from '@/components/print/dialogs/PrintCopiesDialog.vue';
import PrintProgressDialog from '@/components/print/dialogs/PrintProgressDialog.vue';
import PrintPreviewDialog from '@/components/print/dialogs/PrintPreviewDialog.vue';

/**
 * 组件名称: PrintFunctions
 * 引入路径: @/components/PrintFunctions.vue
 * 功能描述: 提供完整的打印功能管理，包括打印类型选择、打印参数设置、打印预览和打印进度管理
 * 使用条件: 需要传入已连接的打印机设备对象
 * 参数说明:
 *   - connectedDevice: 已连接的打印机设备对象，用于执行打印操作
 *   - isModalOpen: 全局弹窗状态，用于协调多个弹窗的显示
 *   - modalState: 全局弹窗类型状态
 *   - @modal-state-change: 监听弹窗状态变化事件
 * 注意事项: 
 *   1. 组件会根据连接的打印机型号自动调整打印参数范围和默认值
 *   2. 打印功能涉及多种弹窗管理，需要与设备连接板块的弹窗状态统一管理
 *   3. 打印参数变更会通过事件实时通知父组件
 *   4. 这些参数直接影响打印质量和兼容性
 */

// 定义 props
const props = defineProps({
  // 已连接的打印机设备对象
  connectedDevice: {
    type: Object,
    default: null
  },
  // 全局弹窗状态
  isModalOpen: {
    type: Boolean,
    default: false
  },
  // 全局弹窗类型状态
  modalState: {
    type: String,
    default: null
  },
  // 打印浓度参数
  // 类型: Number
  // 默认值: 3
  // 取值范围: 根据打印机型号动态设置（1-3、1-5或1-15）
  density: {
    type: Number,
    default: 3
  },
  // 打印模式参数
  // 类型: Number
  // 默认值: 1
  // 取值范围: 1-2
  printMode: {
    type: Number,
    default: 1
  },
  // 标签类型参数
  // 类型: Number
  // 默认值: 1
  // 取值范围: 1-6
  labelType: {
    type: Number,
    default: 1
  }
});

// 定义 emits
const emit = defineEmits(['modal-state-change']);

// 使用组合式函数
const { getPrintConfig } = usePrintConfig();
const { generatePreviewData, executePrintJob, cancelPrintJob: cancelPrintJobExecution } = usePrintExecution();
const { validatePrintCopies } = useInputValidation();

// 创建响应式数据
const selectedPrintType = ref('text');
const printCopies = ref(1);
const showPrintDialog = ref(false);

// 打印进度弹窗相关属性
const showPrintProgress = ref(false);
const printProgress = ref(0);
const printTotal = ref(0);
const printStatus = ref('progress');
const printErrorMessage = ref('');

// 打印预览弹窗相关属性
const showPrintPreviewDialog = ref(false);
const previewImageData = ref('');
const previewLabelWidth = ref(40);
const previewLabelHeight = ref(20);
const previewDataList = ref([]);
const currentPreviewPageIndex = ref(0);
const previewPageInput = ref(1);

// 监听本地弹窗状态变化，同步到父组件
watch(showPrintDialog, (newVal) => {
  emitModalStateChange(newVal ? 'print-dialog' : null);
});

watch(showPrintPreviewDialog, (newVal) => {
  emitModalStateChange(newVal ? 'print-preview' : null);
});

watch(showPrintProgress, (newVal) => {
  emitModalStateChange(newVal ? 'print-progress' : null);
});

// 获取当前打印配置
/**
 * 获取当前打印配置
 * @description 组合打印类型、打印份数、打印浓度、标签类型和打印模式，生成完整的打印配置对象
 * @returns {Object} 包含完整打印参数的配置对象
 */
const getCurrentPrintConfig = () => {
  const config = getPrintConfig(
    selectedPrintType.value,
    printCopies.value,
    props.density,
    props.labelType,
    props.printMode
  );
  
  // 确保返回的配置包含所有必要的参数
  return {
    ...config
  };
};

/**
 * 发射弹窗状态变化事件
 */
const emitModalStateChange = (state) => {
  emit('modal-state-change', {
    isOpen: !!state,
    state: state
  });
};

/**
 * 关闭所有弹窗
 */
const closeAllModals = () => {
  showPrintDialog.value = false;
  showPrintPreviewDialog.value = false;
  showPrintProgress.value = false;
};

/**
 * 设置打印份数弹窗
 */
const setPrintCopies = () => {
  showPrintDialog.value = true;
};

/**
 * 显示打印进度弹窗
 */
const showPrintProgressDialog = () => {
  showPrintProgress.value = true;
  printStatus.value = 'progress';
  printProgress.value = 0;
  printErrorMessage.value = '';
};

/**
 * 隐藏打印进度弹窗
 */
const hidePrintProgressDialog = () => {
  showPrintProgress.value = false;
};

/**
 * 取消打印任务
 */
const cancelPrintJob = async () => {
  console.log("取消打印任务");
  try {
    await cancelPrintJobExecution();
    hidePrintProgressDialog();
    uni.showToast({
      title: "打印任务已取消"
    });
  } catch (error) {
    console.error('取消打印任务失败:', error);
    uni.showToast({
      title: "取消打印任务失败",
      icon: 'none'
    });
  }
};

/**
 * 更新当前预览数据
 * @description 更新当前预览数据
 */
const updateCurrentPreviewData = () => {
  if (previewDataList.value.length > 0 && currentPreviewPageIndex.value >= 0 && currentPreviewPageIndex.value < previewDataList.value.length) {
    const currentData = previewDataList.value[currentPreviewPageIndex.value];
    previewImageData.value = currentData.imageData;
    previewLabelWidth.value = currentData.labelWidth;
    previewLabelHeight.value = currentData.labelHeight;
  }
};

/**
 * 处理打印操作
 */
const handlePrint = (copies) => {
  showPrintDialog.value = false;
  console.log("打印份数:", typeof copies === 'number');
  // 如果子组件传递了打印份数，则使用传递的值
  if (typeof copies === 'number' && copies > 0) {
    console.log("更新 printCopies 为:", copies);
    printCopies.value = copies;
  }

  // 使用组合式函数验证打印份数
  const validatedCopies = validatePrintCopies(printCopies.value, true);
  if (validatedCopies < 1) {
    uni.showToast({
      title: '打印份数至少为1',
      icon: 'none'
    });
    return;
  }
  printCopies.value = validatedCopies;

  const printConfig = getCurrentPrintConfig();
  console.log("打印配置:", printConfig);
  executePrint(printConfig);
};

/**
 * 执行打印操作
 */
const executePrint = async (printConfig) => {
  try {
    showPrintProgressDialog();
    printStatus.value = 'progress';
    printProgress.value = 0;
    printErrorMessage.value = '';

    await executePrintJob(printConfig, {
      onProgressUpdate: (count, total) => {
        printProgress.value = count;
        printTotal.value = total;
      },
      onSuccess: () => {
        printStatus.value = 'success';
        setTimeout(() => {
          hidePrintProgressDialog();
        }, 1000);
      },
      onError: (errorMessage) => {
        printStatus.value = 'error';
        printErrorMessage.value = errorMessage;
        setTimeout(() => {
          hidePrintProgressDialog();
        }, 1000);
      }
    });
  } catch (error) {
    console.error('打印失败:', error);
    printStatus.value = 'error';
    printErrorMessage.value = error.message || '打印失败';
  }
};

/**
 * 预览打印数据
 */
const previewPrintData = async () => {
  try {
    // 显示加载状态
    uni.showLoading({
      title: '生成预览中...',
      mask: true
    });

    // 获取当前打印配置
    const printConfig = getCurrentPrintConfig();
    if (!printConfig) {
      uni.showToast({
        title: '打印配置错误',
        icon: 'none'
      });
      return;
    }

    // 使用组合式函数生成预览数据
    previewDataList.value = await generatePreviewData(printConfig);

    // 如果有预览数据，显示预览弹窗
    if (previewDataList.value && previewDataList.value.length > 0) {
      currentPreviewPageIndex.value = 0;
      previewPageInput.value = 1;
      updateCurrentPreviewData();

      // 显示预览弹窗
      showPrintPreviewDialog.value = true;
    } else {
      uni.showToast({
        title: '预览生成失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('预览打印数据失败:', error);
    uni.showToast({
      title: error.message || '预览生成失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 暴露方法给父组件使用
defineExpose({
  closeAllModals
});
</script>

<style scoped>
/* 从index.css中迁移过来的打印功能相关样式 */
@import "./shared/print-common.css";
</style>