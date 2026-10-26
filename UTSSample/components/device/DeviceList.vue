<!--
  设备列表组件功能说明
  
  组件名称: DeviceList
  引入路径: @/components/device/DeviceList.vue
  功能描述: 提供设备列表显示，处理设备选择和连接按钮
  
  主要功能模块:
  1. 设备列表显示
     - 显示搜索到的设备列表
     - 显示设备名称和UUID信息
     - 提供设备连接按钮
  
  2. 设备连接处理
     - 处理设备选择事件
     - 调用设备连接API
     - 通知父组件连接结果
  
  3. 弹窗状态管理
     - 控制弹窗显示/隐藏
     - 防止背景滚动和点击穿透
  
  技术实现细节:
  1. 设备列表渲染
     - 使用v-for循环渲染设备列表
     - 显示设备名称和UUID信息
     - 为每个设备提供连接按钮
  
  2. 设备连接逻辑
     - 从父组件接收设备列表数据
     - 处理设备连接按钮点击事件
     - 使用JCAPI.connectPrinter连接设备
     - 通知父组件连接结果
  
  3. 弹窗状态管理
     - 使用visible prop控制弹窗显示/隐藏
     - 通过update:visible事件通知父组件状态变化
     - 使用preventBackgroundScroll防止背景滚动
  
  组件依赖:
  - JCAPI: 打印机设备连接和操作的核心 API
  
  使用示例:
  <device-list 
    :visible="deviceListVisible" 
    :device-list="devices"
    @update:visible="deviceListVisible = $event"
    @device-connected="handleDeviceConnected"
    @close="handleClose"
  />
-->
<template>
  <view v-if="visible" class="uni-mask" @touchmove.stop.prevent="preventBackgroundScroll">
    <view class="uni-dialog-container" @click.stop>
      <!-- 标题栏 -->
      <view class="uni-dialog-header">
        <text class="uni-dialog-title">可用设备</text>
        <text class="uni-dialog-close" @click.stop="closeDialog">×</text>
      </view>

      <!-- 设备列表区 -->
      <scroll-view class="uni-dialog-content" scroll-y="true" :show-scrollbar="true"
        @touchmove.stop.prevent="preventBackgroundScroll">
        <view class="uni-list-container">
          <view class="uni-list-box" v-for="(item, index) in deviceList" :key="index">
            <view class="device-info-section">
              <view class="uni-list-item-content">
                <view class="uni-list_name">{{ item.name }}</view>
                <view class="uni-list_item">UUID: {{ item.address }}</view>
              </view>
              <button class="connect-button" @click.stop="connectToDevice(item)">连接</button>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作栏 -->
      <view class="uni-dialog-footer">
        <text class="uni-dialog-cancel" @click.stop="closeDialog">取消</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import JCAPI from '@/src/utils/print.js';
import { ErrorHandler } from '@/src/utils/errorHandler.js';

// 定义组件属性
const props = defineProps({
  // 控制弹窗显示/隐藏
  visible: {
    type: Boolean,
    default: false
  },
  // 设备列表数据
  deviceList: {
    type: Array,
    default: () => []
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
});

// 定义组件事件
const emit = defineEmits([
  'update:visible',     // 更新弹窗显示状态
  'device-connected',   // 设备连接成功事件
  'close',              // 关闭弹窗事件
  'modal-state-change'  // 弹窗状态变化事件
]);

/**
 * 连接设备
 */
const connectToDevice = async (item) => {
  // 先通知父组件显示加载状态，禁止页面滚动
  emit('modal-state-change', { isOpen: true, state: 'loading' });
  // 然后关闭设备列表弹窗
  emit('update:visible', false);

  uni.showLoading({
    title: "连接中..."
  });

  try {
    const result = await JCAPI.connectPrinter(item);
    uni.hideLoading();
    // 连接完成后，保持弹窗状态以禁止背景滑动，显示连接结果
    emit('modal-state-change', { isOpen: true, state: 'connection-result' });
    if (result.code == 0) {
      ErrorHandler.handle({ code: 0, message: "连接成功" }, 'connectToDevice', { showType: 'toast', icon: 'success', duration: 2000 });
    } else {
      ErrorHandler.handleDeviceError({ code: result.code || 4001, message: "连接失败" }, 'connectToDevice', 2000);
    }

    // 通知父组件连接结果
    emit('device-connected', result.code == 0 ? item : null);

    // 连接结果提示2秒后，自动恢复页面滚动状态
    setTimeout(() => {
      emit('modal-state-change', { isOpen: false, state: null });
    }, 2000);
  } catch (error) {
    console.log("连接设备失败", error);
    uni.hideLoading();
    // 连接失败后，保持弹窗状态以禁止背景滑动
    emit('modal-state-change', { isOpen: true, state: 'connection-result' });
    emit('device-connected', null);

    // 连接失败提示2秒后，自动恢复页面滚动状态
    setTimeout(() => {
      emit('modal-state-change', { isOpen: false, state: null });
    }, 2000);
  }
};

/**
 * 关闭弹窗
 */
const closeDialog = () => {
  emit('update:visible', false);
  // 关闭弹窗时，通知父组件弹窗已关闭，恢复页面滚动
  emit('modal-state-change', { isOpen: false, state: null });
  emit('close');
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
  closeDialog
});
</script>

<style scoped>
@import './shared/device-common.css';
</style>