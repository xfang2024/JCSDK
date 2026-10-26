<template>
    <view>
        <view class="section-header">
            <view class="section-title">打印功能</view>
            <view class="section-hint">选择需要打印的类型</view>
        </view>
        <!-- 打印类型选择 -->
        <view class="print-type-selection">
            <view class="radio-group">
                <view class="card-radio" :class="{ 'card-radio-selected': item.value === selectedPrintType }"
                    v-for="(item, index) in printTypes" :key="index" @click="selectPrintType(item.value)">
                    <view class="radio-icon">{{ item.icon }}</view>
                    <text class="radio-label">{{ item.label }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * 打印类型选择器组件
 * 用于选择不同的打印类型（文本、条码、二维码等）
 */

// 定义 props
const props = defineProps({
  modelValue: {  // v-model 支持
    type: String,
    default: 'text'
  },
});

// 定义 emits
const emit = defineEmits(['update:modelValue']);

// 打印类型选项配置
const printTypes = ref([
  { value: 'text', label: '打印文本', icon: 'A' },
  { value: 'barcode', label: '打印条码', icon: '||||' },
  { value: 'qrcode', label: '打印二维码', icon: '◻◻' },
  { value: 'line', label: '打印线条', icon: '─' },
  { value: 'graph', label: '打印图形', icon: '△' },
  { value: 'image', label: '打印图片', icon: '🖼🖼🖼️' },
  { value: 'multiple', label: '批量打印', icon: '📋📋' }
]);

/**
 * 当前选中的打印类型
 * 使用计算属性实现双向绑定，替代 data + watch 的组合
 */
const selectedPrintType = computed({
  get() {
    // 如果没有传入值，使用默认值 'text'
    return props.modelValue || 'text';
  },
  set(value) {
    // 触发 v-model 更新
    emit('update:modelValue', value);
  }
});

/**
 * 选择打印类型
 * @param {string} type - 打印类型值
 */
const selectPrintType = (type) => {
  console.log('选择打印类型:', type);
  // 直接赋值给计算属性，会触发 setter
  selectedPrintType.value = type;
};
</script>

<style scoped>
@import './shared/print-common.css';
</style>