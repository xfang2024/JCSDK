<!--
  设备连接组件功能说明
  
  组件名称: DeviceConnection
  引入路径: @/components/device/DeviceConnection.vue
  功能描述: 提供设备连接相关的功能，包括蓝牙设备搜索、Wi-Fi设备搜索、设备连接、断开连接和连接状态检查
  
  主要功能模块:
  1. 设备连接管理
     - 搜索蓝牙设备: searchDevice()
     - 搜索Wi-Fi设备: searchWifiDevice()
     - 设备连接: connectToDevice(item)
     - 断开连接: disconnectDevice()
     - 连接状态检查: checkConnection()
  
  2. 弹窗管理
     - 设备列表弹窗: deviceListVisible
     - 弹窗状态管理: isModalOpen, modalState
  
  3. 设备列表处理
     - 处理设备搜索结果: processDeviceList(deviceList, noDeviceMessage)
  
  技术实现细节:
  1. 蓝牙设备搜索
     - 使用 uni.openBluetoothAdapter 确认蓝牙是否打开
     - 在 Android 平台需要请求位置权限
     - 使用 JCAPI.searchBluetoothDevices() 搜索设备
     - 搜索结果显示在设备列表弹窗中
  
  2. Wi-Fi设备搜索
     - 使用 uni.getNetworkType 检查网络环境
     - 在 Wi-Fi 环境下使用 JCAPI.searchWifiDevices() 搜索设备
     - 搜索结果显示在设备列表弹窗中
  
  3. 设备连接
     - 从设备列表中选择设备进行连接
     - 使用 JCAPI.connectPrinter() 连接设备
     - 连接成功后更新 connectedDevice 状态
  
  4. 弹窗状态管理
     - 使用 isModalOpen 标记弹窗是否打开
     - 使用 modalState 区分不同类型的弹窗状态: null(无弹窗)、"loading"(加载状态)、"dialog"(对话框状态)
     - 通过 preventBackgroundScroll 和 preventBackgroundClick 防止背景滚动和点击穿透
  
  注意事项:
  1. 设备连接功能依赖于 JCAPI SDK，需要确保 SDK 已正确初始化
  2. 在 Android 平台搜索蓝牙设备需要位置权限
  3. 搜索 Wi-Fi 设备需要在 Wi-Fi 环境下进行
  4. 弹窗功能与打印功能板块共享，需要统一管理弹窗状态
  5. 设备连接状态会影响打印功能的可用性
  
  组件依赖:
  - JCAPI: 打印机设备连接和操作的核心 API
  - uni-app API: 蓝牙适配器、网络类型检测、权限请求等系统功能
  
  使用示例:
  <device-connection @device-connected="handleDeviceConnected" />
-->
<template>
  <view class="device-connection-wrapper">
    <!-- 设备连接部分 -->
    <view class="device-connection">
      <view class="section-header">
        <view class="section-title">设备连接</view>
        <view class="section-hint">确保设备处于可发现模式</view>
      </view>
      <view class="button-group">
        <button class="btn" @click="searchDevice()">搜索蓝牙设备</button>
        <button class="btn" @click="searchWifiDevice()">搜索Wi-Fi设备</button>
        <button class="btn" @click="showWifiConfigDialog()">蓝牙配网</button>
        <button class="btn btn-disconnect" @click="disconnectDevice()">断开连接</button>
        <button class="btn" @click="checkConnection()">连接状态</button>
      </view>
    </view>

    <!-- 设备列表组件 -->
    <DeviceList :visible="deviceListVisible" :deviceList="devices" :loading="false"
      @update:visible="handleDeviceListVisibleChange" @device-connected="handleDeviceConnected"
      @close="handleDeviceListClose" @modal-state-change="handleDeviceListModalChange" />

    <!-- Wi-Fi配网对话框组件 -->
    <WifiConfigDialog :visible="wifiConfigVisible" @update:visible="handleWifiConfigVisibleChange"
      @config-success="handleWifiConfigSuccess" @config-error="handleWifiConfigError" />
  </view>
</template>

<script setup>
import JCAPI from '@/src/utils/print.js';
import DeviceList from './DeviceList.vue';
import WifiConfigDialog from './WifiConfigDialog.vue';
import { ref, watch } from 'vue';
import { useDeviceSearch } from '@/components/device/composables/useDeviceSearch.js';
import { ErrorHandler } from '@/src/utils/errorHandler.js';

// 定义组件属性
const props = defineProps({
  // 已连接的设备对象
  connectedDevice: {
    type: Object,
    default: null
  }
});

// 定义组件事件
const emit = defineEmits([
  'device-connected',    // 设备连接成功事件
  'device-disconnected', // 设备断开连接事件
  'modal-state-change',  // 弹窗状态变化事件
  'connection-checked'   // 连接状态检查事件
]);



const {
  devices,
  searchBluetoothDevices,
  searchWifiDevices
} = useDeviceSearch();

// 响应式状态
const deviceListVisible = ref(false);
const wifiConfigVisible = ref(false);
const isLoading = ref(false); // 添加loading状态标记

// 监听弹窗状态变化，通知父组件
watch(deviceListVisible, (newVal) => {
  // 当处于loading状态时，即使设备列表弹窗关闭，也不更新父组件的isModalOpen状态
  if (!isLoading.value) {
    emit('modal-state-change', {
      isOpen: newVal,
      state: newVal ? 'device-list' : null
    });
  }
});

watch(wifiConfigVisible, (newVal) => {
  // 只有在非loading状态下才更新弹窗状态
  if (!isLoading.value || !newVal) {
    emit('modal-state-change', {
      isOpen: newVal,
      state: newVal ? 'wifi-config' : null
    });
  }
});

/**
 * 搜索蓝牙设备
 */
const searchDevice = async () => {
  console.log("开始搜索蓝牙设备");
  // 通知父组件显示加载状态，禁止页面滚动
  emit('modal-state-change', { isOpen: true, state: 'loading' });
  const result = await searchBluetoothDevices();
  emit('modal-state-change', { isOpen: false, state: null });
  console.log('searchBluetoothDevices result:', result);
  if (result.success) {
    deviceListVisible.value = true;
  }
};


const searchWifiDevice = async () => {
  console.log("开始搜索WIFI设备");
  // 通知父组件显示加载状态，禁止页面滚动
  emit('modal-state-change', { isOpen: true, state: 'loading' });
  const result = await searchWifiDevices();
  emit('modal-state-change', { isOpen: false, state: null });

  if (result.success) {
    deviceListVisible.value = true;
  }
};

/**
 * 断开设备连接
 */
const disconnectDevice = async () => {
  try {
    await JCAPI.disconnectPrinter();
    emit('device-disconnected');
     ErrorHandler.handleDeviceError({ code: 4002, message: "设备已断开连接" }, 'disconnectDevice', 2000);

  } catch (error) {
    console.log("断开连接失败", error);
    ErrorHandler.handleDeviceError({ code: 4004, message: "断开连接失败" }, 'disconnectDevice', 2000);
  }
};

/**
 * 检查连接状态
 */
const checkConnection = async () => {
  try {
    await JCAPI.isConnected();
    emit('connection-checked', true);
  } catch (error) {
    emit('connection-checked', false);
  }
};

/**
 * 显示Wi-Fi配置对话框
 */
const showWifiConfigDialog = () => {
  wifiConfigVisible.value = true;
};

/**
 * 处理Wi-Fi配置对话框可见性变化
 */
const handleWifiConfigVisibleChange = (visible) => {
  wifiConfigVisible.value = visible;
};

/**
 * 处理Wi-Fi配置成功事件
 */
const handleWifiConfigSuccess = (result) => {
  console.log("Wi-Fi配置成功", result);
  // 可以在这里添加成功后的额外处理逻辑
};

/**
 * 处理Wi-Fi配置错误事件
 */
const handleWifiConfigError = (error) => {
  console.log("Wi-Fi配置失败", error);
  // 可以在这里添加失败后的额外处理逻辑
};



/**
 * 处理设备列表可见性变化
 */
const handleDeviceListVisibleChange = (visible) => {
  deviceListVisible.value = visible;
  // 只有在非loading状态下才更新弹窗状态
  // 这可以防止在设备连接过程中loading状态被覆盖
  if (!isLoading.value) {
    emit('modal-state-change', { isOpen: visible, state: visible ? 'device-list' : null });
  }
};

/**
 * 处理设备连接事件
 */
const handleDeviceConnected = (device) => {
  // 连接成功后，只通知父组件设备连接状态
  // 不再直接更新弹窗状态，避免与自动恢复逻辑冲突
  emit('device-connected', device);
};

/**
 * 处理设备列表关闭事件
 */
const handleDeviceListClose = () => {
  deviceListVisible.value = false;
  // 只有在非loading状态下才更新弹窗状态
  if (!isLoading.value) {
    emit('modal-state-change', { isOpen: false, state: null });
  }
};

/**
 * 处理设备列表弹窗状态变化事件
 */
const handleDeviceListModalChange = (modalStateValue) => {
  // 更新loading状态标记
  if (modalStateValue.state === 'loading') {
    isLoading.value = true;
  } else if (modalStateValue.state === 'connection-result') {
    // 当进入连接结果状态时，立即清除loading状态
    // 这样watch就能正常处理后续的状态变化
    isLoading.value = false;
  } else if (modalStateValue.state === null) {
    isLoading.value = false;
  }

  // 直接转发给父组件
  emit('modal-state-change', modalStateValue);
};



/**
 * 外部调用方法：关闭所有弹窗
 */
const closeAllModals = () => {
  deviceListVisible.value = false;
  wifiConfigVisible.value = false;
};

// 暴露方法给父组件使用
defineExpose({
  closeAllModals
});
</script>

<style scoped>
@import './shared/device-common.css';
</style>