<template>
  <view class="uni-mask" v-if="visible" @touchmove.stop.prevent="preventBackgroundScroll">
    <view class="uni-dialog-container print-progress-container" :class="{
      'progress-state': status === 'progress' || status === 'printing',
      'result-state': status === 'success',
      'error-state': status === 'error'
    }">
      <view class="uni-dialog-header">
        <text class="uni-dialog-title">{{ title }}</text>
        <text class="uni-dialog-close" @click="onClose">×</text>
      </view>
      
      <view class="uni-dialog-content">
        <!-- 进度条区域 -->
        <view v-if="showProgress" class="progress-container">
          <text class="progress-text">{{ progressText }}</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
          </view>
        </view>
        
        <!-- 状态信息区域 -->
        <view class="status-container">
          <text class="status-text" :class="getStatusClass()">{{ computedStatusText }}</text>
        </view>
      </view>
      
      <view class="uni-dialog-footer">
        <text class="uni-dialog-cancel" @click="onCancel" v-if="showCancelButton">
          {{ cancelText }}
        </text>
        <text class="uni-dialog-primary" @click="onConfirm" v-if="showConfirmButton">
          {{ confirmText }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

/**
 * 组件名称: PrintProgressDialog
 * 引入路径: @/components/Print/dialogs/PrintProgressDialog.vue
 * 功能描述: 打印进度弹窗组件，显示打印进度、状态信息和操作按钮
 * 使用条件: 需要在打印功能模块中使用
 * 事件说明:
 *   - @close: 关闭弹窗
 *   - @cancel: 取消操作
 *   - @confirm: 确认操作
 */

// 定义属性
const props = defineProps({
  // 控制弹窗显示/隐藏
  visible: {
    type: Boolean,
    default: false
  },
  // 弹窗标题
  title: {
    type: String,
    default: '打印进度'
  },
  // 当前进度
  progress: {
    type: Number,
    default: 0
  },
  // 总数
  total: {
    type: Number,
    default: 0
  },
  // 打印状态
  status: {
    type: String,
    default: 'progress' // progress, success, error
  },
  // 状态文本
  statusText: {
    type: String,
    default: ''
  },
  // 错误信息
  errorMessage: {
    type: String,
    default: ''
  },
  // 是否显示取消按钮
  showCancelButton: {
    type: Boolean,
    default: true
  },
  // 取消按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  // 是否显示确认按钮
  showConfirmButton: {
    type: Boolean,
    default: false
  },
  // 确认按钮文本
  confirmText: {
    type: String,
    default: '确定'
  }
});

// 定义事件
const emit = defineEmits(['close', 'cancel', 'confirm']);

// 计算进度百分比
const progressPercentage = computed(() => {
  if (props.total <= 0) return 0;
  return Math.min((props.progress / props.total) * 100, 100);
});

// 进度文本
const progressText = computed(() => {
  if (props.total <= 0) return '准备中...';
  return `正在打印: ${props.progress}/${props.total}`;
});

// 是否显示进度条
const showProgress = computed(() => {
  return props.status === 'progress';
});

// 计算状态文本
const computedStatusText = computed(() => {
  if (props.statusText) return props.statusText;
  
  switch (props.status) {
    case 'progress':
      return '正在打印...';
    case 'success':
      return '打印完成';
    case 'error':
      return props.errorMessage || '打印失败';
    default:
      return '';
  }
});

/**
 * 阻止背景滚动穿透
 */
const preventBackgroundScroll = (event) => {
  event.stopPropagation();
  event.preventDefault();
};

/**
 * 获取状态文本样式类
 */
const getStatusClass = () => {
  if (props.status === 'error') return 'error-text';
  if (props.status === 'success') return 'success-text';
  return '';
};

/**
 * 关闭弹窗
 */
const onClose = () => {
  emit('close');
};

/**
 * 取消操作
 */
const onCancel = () => {
  emit('cancel');
};

/**
 * 确认操作
 */
const onConfirm = () => {
  emit('confirm');
};
</script>

<style scoped>
/* 从print-common.css中引入相关样式 */
@import "../shared/print-common.css";
</style>