<template>
	<view class="page-wrapper" :class="{ 'no-scroll': isModalOpen, 'loading': modalState === 'loading', 'connection-result': modalState === 'connection-result' }"
		@click="preventBackgroundClick" @touchmove="handleTouchMove">
		<!-- 主内容区域 -->
		<view class="content">
			<!--打印机状态组件-->
			<device-status :connected-device="connectedDevice" />

			<!-- 设备连接组件 -->
			<device-connection :connected-device="connectedDevice" @device-connected="handleDeviceConnected"
				@device-disconnected="handleDeviceDisconnected" @modal-state-change="handleDeviceModalChange"
				@connection-checked="handleConnectionChecked" />

			<!-- 打印功能组件 -->
			<print-functions 
				:connected-device="connectedDevice" 
				:density="density"
				:print-mode="printMode"
				:label-type="labelType"
				@modal-state-change="handlePrintModalChange" />

			<!-- 打印设置组件 -->
			<print-setting :connected-device="connectedDevice" @settings-change="onPrintSettingsChange" />
		</view>
		
		<!-- 全局遮罩层，用于阻止loading状态下的背景滚动 -->
		<view v-if="modalState === 'loading'" class="global-loading-mask" @touchmove.stop.prevent></view>
	</view>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import JCAPI from '@/src/utils/print.js';
//引入子组件
import DeviceStatus from '@/components/device/DeviceStatus.vue';
import DeviceConnection from '@/components/device/DeviceConnection.vue';
import PrintFunctions from '@/components/print/PrintFunctions.vue';
import PrintSetting from '@/components/settings/PrintSettings.vue';

export default defineComponent({
	components: {
		PrintSetting,
		DeviceStatus,
		DeviceConnection,
		PrintFunctions
	},
	setup() {
		// 响应式数据
		const connectedDevice = ref(null);
		const printMode = ref(1);
		const density = ref(3);
		const labelType = ref(1);
		const isModalOpen = ref(false);
		const modalState = ref(null); // 弹窗状态：null(无弹窗)、"loading"(加载状态)、"dialog"(对话框状态)

		// 生命周期钩子
		onMounted(() => {
			// 初始化SDK
			JCAPI.initSDK();
		});

		// 方法
		const onPrintSettingsChange = (settings) => {
			
			// 更新本地状态中的打印参数
			density.value = settings.density;
			printMode.value = settings.printMode;
			labelType.value = settings.labelType;
		};

		/**
			* 处理设备连接成功事件
			*/
		const handleDeviceConnected = (device) => {
			connectedDevice.value = device;
		};

		/**
			* 处理设备断开连接事件
			*/
		const handleDeviceDisconnected = () => {
			connectedDevice.value = null;
		};

		/**
		 * 处理设备连接弹窗状态变化
		 */
		const handleDeviceModalChange = (modalStateValue) => {
			isModalOpen.value = modalStateValue.isOpen;
			modalState.value = modalStateValue.state;
		};

		/**
		 * 处理打印功能弹窗状态变化
		 */
		const handlePrintModalChange = (modalStateValue) => {
			isModalOpen.value = modalStateValue.isOpen;
			modalState.value = modalStateValue.state;
		};

		/**
		 * 处理连接状态检查
		 */
		const handleConnectionChecked = (isConnected) => {
			console.log('连接状态检查结果:', isConnected);
			if (isConnected) {
				uni.showToast({
					title: "设备已连接",
					duration: 2000
				});
			} else {
				uni.showToast({
					title: "设备未连接，请先连接设备",
					icon: "none",
					duration: 2000
				});
			}
		};

		/**
		 * 阻止背景点击事件
		 * 当弹窗打开时，阻止背景区域的点击事件执行
		 * @param {Object} event - 点击事件对象
		 */
		const preventBackgroundClick = (event) => {
			// 如果弹窗处于打开状态，阻止背景点击事件
			if (isModalOpen.value) {
				event.stopPropagation();
				event.preventDefault();
				return false;
			}
		};

		/**
		 * 处理页面滑动事件
		 * 记录滑动事件触发时的loading状态值
		 * @param {Object} event - 滑动事件对象
		 */
		const handleTouchMove = (event) => {
			// 如果弹窗处于打开状态，阻止滑动事件
			if (isModalOpen.value) {
				event.stopPropagation();
				event.preventDefault();
				return false;
			}
		};

		// 返回所有模板需要的数据和方法
		return {
			connectedDevice,
			printMode,
			density,
			labelType,
			isModalOpen,
			modalState,
			onPrintSettingsChange,
			handleDeviceConnected,
			handleDeviceDisconnected,
			handleDeviceModalChange,
			handlePrintModalChange,
			handleConnectionChecked,
			preventBackgroundClick,
			handleTouchMove
		};
	}
});
</script>

<style>
@import "./index.css";
</style>
