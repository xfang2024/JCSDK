<!--
  Wi-Fi配网对话框组件
  
  组件名称: WifiConfigDialog
  引入路径: @/components/device/WifiConfigDialog.vue
  功能描述: 提供Wi-Fi配网功能的对话框，包含Wi-Fi名称和密码输入
  
  主要功能:
  1. Wi-Fi配网对话框显示/隐藏控制
  2. Wi-Fi名称和密码输入
  3. 输入验证
  4. 配网操作执行
  5. 配网结果反馈
  
  使用示例:
  <WifiConfigDialog 
    :visible="wifiConfigVisible" 
    @update:visible="handleWifiConfigVisibleChange"
    @config-success="handleWifiConfigSuccess"
    @config-error="handleWifiConfigError"
  />
-->
<template>
    <view v-if="visible" class="uni-mask" @touchmove.stop.prevent="preventBackgroundScroll">
        <view class="uni-dialog-container wifi-config-container" @click.stop>
            <!-- 标题栏 -->
            <view class="uni-dialog-header">
                <text class="uni-dialog-title">配网设置</text>
                <text class="uni-dialog-close" @click.stop="closeDialog">×</text>
            </view>

            <!-- 内容区 -->
            <view class="uni-dialog-content">
                <view class="uni-form-item uni-column">
                    <view class="title">输入配网的网络名称:</view>
                    <input class="setting-input" focus placeholder="输入Wi-Fi名称" @input="onWifiNameInput"
                        :value="wifiname" />
                    <view class="title password-title">输入配网的网络密码:</view>
                    <input class="setting-input" placeholder="输入Wi-Fi密码" @input="onWifiPwdInput" :value="wifipwd" />
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="uni-dialog-footer">
                <button type="primary" class="uni-dialog-primary" @click="startWifiConfiguration()">开始配网</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import JCAPI from '@/src/utils/print.js';
import { ref, watch } from 'vue';
import { ErrorHandler } from '@/src/utils/errorHandler.js';

// 定义组件属性
const props = defineProps({
  // 控制弹窗显示/隐藏
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义组件事件
const emit = defineEmits([
  'update:visible',    // 弹窗显示/隐藏状态更新事件
  'config-success',     // 配网成功事件
  'config-error'        // 配网失败事件
]);

// 响应式状态
const wifiname = ref('');
const wifipwd = ref('');
const isConfiguring = ref(false);

// 监听弹窗显示状态变化，重置表单
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    // 弹窗关闭时重置表单
    wifiname.value = '';
    wifipwd.value = '';
    isConfiguring.value = false;
  }
});

/**
 * 显示Wi-Fi配置弹窗
 */
const showWifiConfiguration = () => {
  emit('update:visible', true);
};

/**
 * 开始Wi-Fi配置
 */
const startWifiConfiguration = async () => {
  // 非空校验
  if (!wifiname.value || !wifipwd.value) {
    ErrorHandler.handle({ code: 9002, message: 'WiFi名称和密码不能为空' }, 'startWifiConfiguration', { showType: 'toast', duration: 2000 });
    return;
  }

  isConfiguring.value = true;
  
  uni.showLoading({
    title: "配网中..."
  });

  try {
    const result = await JCAPI.configurePrinterNetWork({
      wifiName: wifiname.value,
      wifiPwd: wifipwd.value,
    });
    
    console.log("配网结果", result);
    uni.hideLoading();
    isConfiguring.value = false;

    if (result.code == 0) {
      // 配网成功
      emit('update:visible', false);
      emit('config-success', result);
      ErrorHandler.handlePrinterStatusError({ code: 0, message: "设备配网成功" }, 'startWifiConfiguration');
    } else {
      // 配网失败
      emit('config-error', result);
      ErrorHandler.handlePrinterStatusError({ code: result.code ||1011, message: `配网失败，错误信息: ${result.info}` }, 'startWifiConfiguration');
    }

  } catch (error) {
    console.log("配网失败", error);
    uni.hideLoading();
    isConfiguring.value = false;
    
    // 从Error对象中提取原始res对象
    let errorData = { code: -1, info: "未知错误" };
    if (error && error.message) {
      try {
        // 尝试解析Error对象中的message，它可能是JSON字符串
        const parsedError = JSON.parse(error.message);
        if (parsedError.code !== undefined && parsedError.info !== undefined) {
          errorData = parsedError;
        }
      } catch (e) {
        // 如果解析失败，使用默认错误信息
        console.log("解析错误信息失败", e);
      }
    }
    
    emit('config-error', errorData);
    ErrorHandler.handle({ code: errorData.code || 1011, message: `配网失败，错误信息: ${errorData.info}` }, 'startWifiConfiguration', { showType: 'modal' });
  }
};

/**
 * Wi-Fi名称输入处理
 */
const onWifiNameInput = (event) => {
  wifiname.value = event.detail.value;
};

/**
 * Wi-Fi密码输入处理
 */
const onWifiPwdInput = (event) => {
  wifipwd.value = event.detail.value;
};

/**
 * 关闭对话框
 */
const closeDialog = () => {
  emit('update:visible', false);
};

/**
 * 阻止背景滚动穿透
 */
const preventBackgroundScroll = (event) => {
  event.stopPropagation();
  event.preventDefault();
};

// 暴露方法给父组件使用
defineExpose({
  showWifiConfiguration
});
</script>

<style scoped>
@import './shared/device-common.css';
</style>