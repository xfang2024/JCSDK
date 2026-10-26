<template>
    <view class="print-management">
        <view class="subsection-header">
            <view class="subsection-title">打印管理</view>
        </view>
        <view class="button-group">
            <button class="btn" @click="setPrintCopies()">打印</button>
            <button class="btn btn-preview" @click="previewPrintData()">预览</button>
        </view>
    </view>
</template>

<script setup>
/**
 * 组件名称: PrintActionButtons
 * 引入路径: @/components/Print/PrintActionButtons.vue
 * 功能描述: 提供打印和预览操作按钮
 * 使用条件: 需要在打印功能模块中使用
 * 事件说明:
 *   - @print: 点击打印按钮时触发
 *   - @preview: 点击预览按钮时触发
 */

// 定义事件
const emit = defineEmits(['print', 'preview']);

/**
 * 设置打印份数
 * 触发打印事件
 */
const setPrintCopies = () => {
  // 打印当前选中的标签
  emit('print');
};

/**
 * 预览打印数据
 * 触发预览事件
 */
const previewPrintData = () => {
  // 预览打印数据
  emit('preview');
};
</script>

<style scoped>
@import './shared/print-common.css';
</style>