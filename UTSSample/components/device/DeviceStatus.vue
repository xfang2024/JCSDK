<!--
设备状态组件功能说明

本组件用于显示打印设备的连接状态和基本信息，主要功能包括：

1. 设备连接状态显示
   - 根据connectedDevice的值判断设备是否已连接
   - 未连接时显示"未连接"状态和提示信息
   - 已连接时显示"已连接"状态和设备信息

2. 设备信息展示
   - 设备名称显示
   - 设备UUID/地址显示
   - 连接状态指示器（视觉反馈）

3. 状态指示器
   - 未连接状态：显示灰色指示点和"未连接"文本
   - 已连接状态：显示绿色指示点和"已连接"文本

组件名称: DeviceStatus
引入路径: @/components/device/DeviceStatus.vue
功能描述: 显示打印设备的连接状态和基本信息，提供直观的视觉反馈
使用条件: 需要传入connectedDevice参数，可以是null（未连接）或设备对象（已连接）
使用示例:
  <device-status :connected-device="connectedDevice"></device-status>

参数说明:
- connected-device: Object类型，包含设备信息（name和address属性）
  - name: 设备名称（字符串）
  - address: 设备UUID/地址（字符串）

注意事项:
- 组件会根据connectedDevice是否存在自动切换显示状态
- 未连接时显示提示信息"当前无可可用设备，请先连接打印设备"
- 已连接时显示设备详细信息
- 组件样式使用CSS变量，便于主题定制
- 组件不包含任何业务逻辑，仅负责状态展示

事件说明:
- 本组件不触发任何事件，仅用于状态展示

组件依赖:
- 依赖uni-app框架的基础组件
- 使用CSS变量系统进行样式定义
-->

<template>
    <!-- 设备状态概览 -->
    <view class="device-status" :class="{ connected: connectedDevice }">
        <view v-if="!connectedDevice" class="disconnected-state">
            <view class="status-header">
                <text class="status-title">设备状态</text>
            </view>
            <view class="status-content">
                <text class="status-message">当前无可可用设备，请先连接打印设备</text>
                <view class="status-indicator">
                    <text class="indicator-dot-disconnected"></text>
                    <text class="status-text-disconnected">未连接</text>
                </view>
            </view>
        </view>
        <view v-else class="connected-state">
            <view class="status-header">
                <text class="status-title">设备状态</text>
            </view>
            <view class="status-content">
                <view class="device-info-card">
                    <view class="device-details">
                        <view class="device-name">{{ connectedDevice.name }}</view>
                        <view class="device-uuid">UUID: {{ connectedDevice.address }}</view>
                    </view>
                </view>
                <view class="status-indicator">
                    <text class="indicator-dot-connected"></text>
                    <text class="status-text-connected">已连接</text>
                </view>
            </view>
        </view>
    </view>
</template>
<script setup>
/**
 * 定义组件属性
 * 
 * connectedDevice: 连接的设备信息对象
 * - 类型: Object
 * - 默认值: null
 * - 属性说明:
 *   - name: String类型，设备名称
 *   - address: String类型，设备UUID/地址
 * 
 * 用途: 
 *   - 判断设备连接状态
 *   - 显示设备基本信息
 *   - 控制组件UI状态
 */
defineProps({
  connectedDevice: {
    type: Object,
    default: null
  }
})
</script>

<style>
/* 从index.css中提取的设备状态相关样式 */

/* 设备状态样式 */
.device-status {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 5px var(--color-shadow);
}

.device-status.connected {
  border-color: var(--color-success);
}

/* 未连接状态样式 */
.disconnected-state .status-header {
  margin-bottom: var(--spacing-md);
}

.disconnected-state .status-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--color-text-primary);
}

.disconnected-state .status-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.disconnected-state .status-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-base);
}

.disconnected-state .status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.indicator-dot-disconnected {
  display: inline-block;
  width: var(--spacing-lg);
  height: var(--spacing-lg);
  background-color: var(--color-error);
  border-radius: 50%;
}

.status-text-disconnected {
  font-size: var(--font-size-sm);
  color: var(--color-error);
  font-weight: 500;
}

/* 已连接状态样式 */
.connected-state .status-header {
  margin-bottom: var(--spacing-md);
}

.connected-state .status-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--color-text-primary);
}

.connected-state .status-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.connected-state .device-info-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.connected-state .device-details {
  flex: 1;
}

.connected-state .device-name {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.connected-state .device-uuid {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.connected-state .status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.indicator-dot-connected {
  display: inline-block;
  width: var(--spacing-lg);
  height: var(--spacing-lg);
  background-color: var(--color-success);
  border-radius: 50%;
}

.status-text-connected {
  font-size: var(--font-size-sm);
  color: var(--color-success);
  font-weight: 500;
}
</style>