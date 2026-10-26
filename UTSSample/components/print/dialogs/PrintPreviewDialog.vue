<!--
  组件名称: PrintPreviewDialog
  引入路径: @/components/Print/dialogs/PrintPreviewDialog.vue
  功能描述: 打印预览弹窗组件，提供打印预览功能，包括预览图显示、多页导航控制、标签尺寸信息和打印份数输入
  参数说明:
    - modelValue: 控制弹窗显示/隐藏
    - previewDataList: 预览数据列表
    - copies: 打印份数
  事件说明:
    - update:modelValue: 更新弹窗显示状态
    - update:copies: 更新打印份数
    - confirm: 确认打印
-->
<template>
  <view v-if="modelValue" class="uni-mask" @touchmove.stop.prevent="preventBackgroundScroll">
    <view class="uni-dialog-container print-preview-container" :class="{
      'single-page': previewDataList.length === 1,
      'multi-page': previewDataList.length > 1
    }" @click.stop>
      <!-- 标题栏 -->
      <view class="uni-dialog-header">
        <text class="uni-dialog-title">打印预览</text>
        <text class="uni-dialog-close" @click.stop="closeDialog">×</text>
      </view>

      <!-- 内容区 -->
      <view class="uni-dialog-content">
        <!-- 预览图区域 -->
        <view class="preview-image-container">
          <image class="preview-image" :src="currentImageData" mode="aspectFit"></image>
        </view>

        <!-- 多页预览控制区域 -->
        <view v-if="previewDataList.length > 1" class="preview-page-controls">
          <view class="page-navigation">
            <text class="nav-button" :class="{ disabled: currentPageIndex === 0 }"
              @click="switchToPreviousPage">‹</text>
            <view class="page-info">
              <input class="page-input" type="number" v-model="pageInput" @input="onPageInputChange"
                @blur="onPageInputBlur" />
              <text class="page-total">/ {{ previewDataList.length }}</text>
            </view>
            <text class="nav-button" :class="{ disabled: currentPageIndex === previewDataList.length - 1 }"
              @click="switchToNextPage">›</text>
          </view>
        </view>

        <!-- 标签尺寸信息 -->
        <view class="label-info">
          <text class="label-info-text">标签尺寸: {{ currentLabelWidth }}mm × {{ currentLabelHeight
            }}mm</text>
        </view>

        <!-- 分割线 -->
        <view class="divider"></view>

        <!-- 打印份数设置 -->
        <view class="setting-item">
          <text class="setting-label">打印份数:</text>
          <input class="setting-input" type="number" v-model="tempCopies" @input="onCopiesInput"
            @blur="onCopiesBlur" placeholder="请输入打印份数" />
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="uni-dialog-footer">
        <text class="uni-dialog-cancel" @click.stop="closeDialog">取消</text>
        <text class="uni-dialog-confirm" @click="handleConfirm">打印</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useInputValidation } from '../composables/useInputValidation.js';

/**
 * 组件名称: PrintPreviewDialog
 * 引入路径: @/components/Print/dialogs/PrintPreviewDialog.vue
 * 功能描述: 打印预览弹窗组件，提供打印预览功能，包括预览图显示、多页导航控制、标签尺寸信息和打印份数输入
 * 使用条件: 需要在打印功能模块中使用
 * 事件说明:
 *   - @update:modelValue: 更新弹窗显示状态
 *   - @update:copies: 更新打印份数
 *   - @confirm: 确认打印
 */

// 定义属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  previewDataList: {
    type: Array,
    default: () => []
  },
  copies: {
    type: Number,
    default: 1
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'update:copies', 'confirm']);

// 使用组合式函数
const { validateInput, validatePrintCopies, validatePageNumber } = useInputValidation();

// 响应式数据
const currentPageIndex = ref(0);
const pageInput = ref(1);
const currentImageData = ref('');
const currentLabelWidth = ref(0);
const currentLabelHeight = ref(0);
const tempCopies = ref(1);

/**
 * 更新当前页面数据
 */
const updateCurrentPage = () => {
  if (props.previewDataList.length > 0 && currentPageIndex.value >= 0 && currentPageIndex.value < props.previewDataList.length) {
    const currentData = props.previewDataList[currentPageIndex.value];
    currentImageData.value = currentData.imageData;
    currentLabelWidth.value = currentData.labelWidth;
    currentLabelHeight.value = currentData.labelHeight;
    pageInput.value = currentPageIndex.value + 1;
  }
};

// 监听弹窗显示状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 处理copies为null或undefined的情况
    tempCopies.value = props.copies || 1;
    updateCurrentPage();
  }
}, { immediate: true });

// 监听预览数据列表
watch(() => props.previewDataList, () => {
  updateCurrentPage();
}, { immediate: true });

// 监听打印份数
watch(() => props.copies, (newVal) => {
  // 处理copies为null或undefined的情况
  tempCopies.value = newVal || 1;
}, { immediate: true });

/**
 * 阻止背景滚动穿透
 */
const preventBackgroundScroll = (event) => {
  event.stopPropagation();
  event.preventDefault();
};

/**
 * 关闭弹窗
 */
const closeDialog = () => {
  emit('update:modelValue', false);
};

/**
 * 确认打印
 */
const handleConfirm = () => {
  emit('update:copies', tempCopies.value);
  emit('confirm');
  closeDialog();
};

/**
 * 切换到上一页
 */
const switchToPreviousPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--;
    updateCurrentPage();
  }
};

/**
 * 切换到下一页
 */
const switchToNextPage = () => {
  if (currentPageIndex.value < props.previewDataList.length - 1) {
    currentPageIndex.value++;
    updateCurrentPage();
  }
};

/**
 * 处理页码输入变化
 */
const onPageInputChange = (e) => {
  const inputValue = e.detail.value;
  const currentPage = currentPageIndex.value + 1;
  
  // 使用组合式函数验证页码
  const value = validatePageNumber(
    inputValue, 
    props.previewDataList.length, 
    currentPage,
    false
  );

  pageInput.value = value;
  if (value !== null) {
    currentPageIndex.value = value - 1;
    updateCurrentPage();
  }
};

/**
 * 处理页码输入失焦事件
 */
const onPageInputBlur = (e) => {
  const inputValue = e.detail.value;
  const currentPage = currentPageIndex.value + 1;
  
  // 使用组合式函数验证页码
  const value = validatePageNumber(
    inputValue, 
    props.previewDataList.length, 
    currentPage,
    true
  );

  pageInput.value = value;
  currentPageIndex.value = value - 1;
  updateCurrentPage();
};

/**
 * 处理打印份数输入
 */
const onCopiesInput = (e) => {
  // 使用组合式函数验证打印份数
  const value = validatePrintCopies(e.detail.value, false);
  tempCopies.value = value;
};

/**
 * 处理打印份数输入失焦事件
 */
const onCopiesBlur = (e) => {
  // 使用组合式函数验证打印份数
  const value = validatePrintCopies(e.detail.value, true);
  tempCopies.value = value;
};
</script>

<style scoped>
@import "../shared/print-common.css";
</style>