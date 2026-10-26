<template>
    <!-- 打印设置弹窗 -->
    <view v-if="showPrintDialog" class="uni-mask" @touchmove.stop.prevent="preventBackgroundScroll">
        <view class="uni-dialog-container print-copies-container" @click.stop>
            <!-- 标题栏 -->
            <view class="uni-dialog-header">
                <text class="uni-dialog-title">打印设置</text>
                <text class="uni-dialog-close" @click.stop="close">×</text>
            </view>

            <!-- 打印份数输入区 -->
            <view class="uni-dialog-content">
                <view class="setting-item">
                    <text class="setting-label">打印份数:</text>
                    <input 
                        class="setting-input" 
                        type="number" 
                        v-model="inputValue"
                        @blur="onBlur" 
                        placeholder="请输入打印份数" 
                    />
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="uni-dialog-footer">
                <text class="uni-dialog-cancel" @click.stop="close">取消</text>
                <text class="uni-dialog-confirm" @click="handlePrint">打印</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from 'vue';
import { useInputValidation } from '../composables/useInputValidation.js';

/**
 * 组件名称: PrintCopiesDialog
 * 引入路径: @/components/Print/dialogs/PrintCopiesDialog.vue
 * 功能描述: 打印份数设置对话框
 * 使用条件: 需要在打印功能模块中使用
 * 事件说明:
 *   - @update:modelValue: 更新弹窗显示状态
 *   - @update:copies: 更新打印份数
 *   - @confirm: 确认打印事件
 */

// 定义属性
const props = defineProps({
    modelValue: {  // v-model 支持弹窗显示状态
        type: Boolean,
        default: false
    },
    copies: {  // 打印份数
        type: Number,
        default: 1
    }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'update:copies', 'confirm']);

// 使用组合式函数
const { validatePrintCopies } = useInputValidation();

// 计算属性：弹窗显示状态
const showPrintDialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

// 计算属性：输入值
const inputValue = computed({
    get() {
        // 处理copies为null或undefined的情况
        return (props.copies || 1).toString();
    },
    set(value) {
        // 使用组合式函数验证打印份数
        const validatedValue = validatePrintCopies(value, true);
        if (validatedValue !== null) {
            emit('update:copies', validatedValue);
        }
    }
});

/**
 * 关闭弹窗
 */
const close = () => {
    emit('update:modelValue', false);
};

/**
 * 处理打印确认事件
 */
const handlePrint = () => {
    emit('confirm', props.copies);
    close();
};

/**
 * 处理失去焦点事件
 */
const onBlur = (event) => {
    // 使用组合式函数验证打印份数
    const value = validatePrintCopies(event.detail.value, false);
    emit('update:copies', value);
};
</script>

<style scoped>
/* 从print-common.css中引入相关样式 */
@import "../shared/print-common.css";
</style>