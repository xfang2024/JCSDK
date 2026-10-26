import { ref } from 'vue';
import JCAPI from '@/src/utils/print.js';
import { ErrorHandler } from '@/src/utils/errorHandler.js';

// 常量定义
const TOAST_DURATION = 2000;

/**
 * 设备搜索组合式函数
 * @description 提供蓝牙和Wi-Fi设备搜索的统一逻辑
 * @returns {Object} 搜索相关的响应式状态和方法
 */
export function useDeviceSearch() {
  // ========== 响应式状态 ==========
  const devices = ref([]);
  const isSearching = ref(false);
  const searchError = ref(null);

  // 缓存平台信息，避免重复调用
  const platform = uni.getSystemInfoSync().platform;

  // ========== 私有方法 ==========

  /**
   * 请求 Android 位置权限
   * @returns {Promise<boolean>} 是否获得权限
   */
  const requestAndroidPermission = async () => {
    if (platform !== 'android') {
      return true;
    }

    return new Promise((resolve) => {
      plus.android.requestPermissions([
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ], (result) => {
        if (result.granted.length === 0 || result.deniedAlways.length > 0 || result.deniedPresent.length > 0) {
          ErrorHandler.handlePermissionError({ code: 2001, message: '位置权限被拒绝' }, requestAndroidPermission)
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };

  /**
   * 显示搜索加载状态
   */
  const showSearchLoading = () => {
    isSearching.value = true;
    uni.showLoading({ title: '搜索中...' });
  };

  /**
   * 隐藏搜索加载状态
   */
  const hideSearchLoading = () => {
    isSearching.value = false;
    uni.hideLoading();
  };

  /**
   * 处理搜索结果
   * @param {Array} deviceList 设备列表
   * @param {string} noDeviceMsg 无设备时的提示信息
   * @returns {boolean} 是否有设备
   */
  const processSearchResult = (deviceList, noDeviceMsg) => {
    if (deviceList && deviceList.length > 0) {
      devices.value = deviceList;
      return true;
    } else {
      ErrorHandler.handle({ code: 2002, message: noDeviceMsg }, 'processDeviceList', { showType: 'toast', duration: TOAST_DURATION });
      return false;
    }
  };

  /**
   * 统一错误处理方法
   * @param {Error} error 错误对象
   * @param {string} errorMessage 错误提示信息
   * @returns {Object} 错误结果对象
   */
  const handleSearchError = (error, errorMessage) => {
    hideSearchLoading();
    searchError.value = error;
    ErrorHandler.handleDeviceError({ code: 2003, message: errorMessage }, 'searchBluetoothDevices', { duration: TOAST_DURATION });
    return { success: false, devices: [], error };
  };

  /**
   * 获取无设备提示信息
   * @returns {string} 根据平台返回相应的提示信息
   */
  const getNoDeviceMessage = () => {
    return platform === 'android'
      ? '未搜索到设备，请检查位置权限和GPS'
      : '未搜索到设备';
  };

  // ========== 公开方法 ==========

  /**
   * 搜索蓝牙设备
   * @returns {Promise<{success: boolean, devices: Array}>}
   */
  const searchBluetoothDevices = async () => {
    try {
      // 1. 打开蓝牙适配器
      await uni.openBluetoothAdapter();

      // 2. 请求权限（Android）
      const hasPermission = await requestAndroidPermission();
      if (!hasPermission) {
        return { success: false, devices: [] };
      }

      // 3. 执行搜索
      showSearchLoading();
      const result = await JCAPI.searchBluetoothDevices();
      
      hideSearchLoading();

      // 4. 处理结果
      const noDeviceMsg = getNoDeviceMessage();
      const hasDevices = processSearchResult(result, noDeviceMsg);
      return { success: hasDevices, devices: devices.value };

    } catch (error) {
      return handleSearchError(error, '打开蓝牙失败');
    }
  };

  /**
   * 搜索Wi-Fi设备
   * @returns {Promise<{success: boolean, devices: Array}>}
   */
  const searchWifiDevices = async () => {
    try {
      // 1. 检查网络类型
      const { networkType } = await uni.getNetworkType();

      if (networkType !== 'wifi') {
        ErrorHandler.handleNetworkError({ code: 1001, message: '未连接到WiFi网络：请在搜索WIFI打印机或者连接WIFI打印机前先连接WIFI网络' }, 'searchWifiDevices');
        return { success: false, devices: [] };
      }

      // 2. 执行搜索
      showSearchLoading();
      const result = await JCAPI.searchWifiDevices();
      hideSearchLoading();

      // 3. 处理结果
      const hasDevices = processSearchResult(result, '未搜索到设备');
      return { success: hasDevices, devices: devices.value };

    } catch (error) {
      return handleSearchError(error, '搜索Wi-Fi设备失败');
    }
  };

  /**
   * 按名称搜索蓝牙设备
   * @param {Array<string>} deviceNames 设备名称数组
   * @returns {Promise<{success: boolean, devices: Array}>}
   */
  const searchBluetoothByName = async (deviceNames = ['B32', 'B21']) => {
    try {
      await uni.openBluetoothAdapter();

      const hasPermission = await requestAndroidPermission();
      if (!hasPermission) {
        return { success: false, devices: [] };
      }

      showSearchLoading();
      const result = await JCAPI.searchBluetoothDevicesWithName(deviceNames);
      hideSearchLoading();

      const noDeviceMsg = getNoDeviceMessage();
      const hasDevices = processSearchResult(result, noDeviceMsg);
      return { success: hasDevices, devices: devices.value };

    } catch (error) {
      return handleSearchError(error, '搜索设备失败');
    }
  };

  /**
   * 清空设备列表
   */
  const clearDevices = () => {
    devices.value = [];
    searchError.value = null;
  };

  return {
    // 状态
    devices,
    isSearching,
    searchError,
    // 方法
    searchBluetoothDevices,
    searchWifiDevices,
    searchBluetoothByName,
    clearDevices
  };
}