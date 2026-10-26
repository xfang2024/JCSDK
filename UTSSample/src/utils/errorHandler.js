import { ERROR_CODE_MAP } from '@/src/constants/constants.js';

/**
 * 统一错误处理器
 */
export class ErrorHandler {
    /**
     * 处理错误并显示提示
     * @param {Error|Object} error 错误对象
     * @param {string} context 错误上下文（用于日志）
     * @param {Object} options 选项
     * @returns {{code: number, message: string}}
     */
    static handle(error, context = '', options = {}) {
        const {
            showType = 'toast',   // 显示类型：'toast'|'modal'|'none'
            duration = 2000,      // Toast显示时长（仅在showType为'toast'时有效）
            icon = 'none',          // Toast的Icon类型 （'none'|'success'|'error'|'loading'）
            logError = true       // 是否记录错误日志
        } = options;
        // 1. 提取错误码和信息

        const code = error?.code ?? -1;
        const message = error?.message || ERROR_CODE_MAP[code] || '操作失败';
        // 2. 记录日志
        if (logError) {
            console.error(`[${context}] Error:`, { code, message });
        }


        // 3. 显示用户提示（根据showType决定显示方式）
        if (showType === 'modal') {
            uni.showModal({
                title: '提示',
                content: message,
                showCancel: false
            });
        } else if (showType === 'toast') {
            console.log("message", message)
            uni.showToast({
                title: message,
				icon :icon,
                duration: duration,
				position:'bottom'
            });
        }
        // showType为'none'时不显示任何提示

        return { code, message };
    }

    /**
     * 显示确认对话框
     * @param {string} title 标题
     * @param {string} content 内容
     */
    static showAlert(title, content) {
        uni.showModal({
            title,
            content,
            showCancel: false
        });
    }

    /**
     * 处理局域网连接错误（使用Toast提示）
     * @param {Error} error 错误对象
     * @param {string} context 上下文
     * @param {number} duration Toast显示时长（默认2000ms）
     */
    static handleNetworkError(error, context = '', duration = 2000) {
        const code = error?.code ?? 1001;
        return this.handle({ code, message: error?.message }, context, {
            showType: 'toast',
            icon: 'error',
            duration: duration
        });
    }

    /**
     * 处理打印机状态错误（使用Toast提示）
     * @param {Error} error 错误对象
     * @param {string} context 上下文
     * @param {number} duration Toast显示时长（默认2000ms）
     */
    static handlePrinterStatusError(error, context = '', duration = 2000) {
        const code = error?.code ?? 1011;
        return this.handle({ code, message: error?.message }, context, {
            showType: 'modal',
            duration: duration
        });
    }

    /**
     * 处理配网错误（使用Modal对话框）
     * @param {Error} error 错误对象
     * @param {string} context 上下文
     */
    static handleConfigNetworkError(error, context = '') {
        const code = error?.code ?? 1021;
        return this.handle({ code, message: error?.message }, context, {
            showType: 'modal'
        });
    }

    /**
     * 处理权限错误（使用Modal对话框）
     * @param {Error} error 错误对象
     * @param {string} context 上下文
     */
    static handlePermissionError(error, context = '') {
        const code = error?.code ?? 2001;
        return this.handle({ code, message: error?.message }, context, {
            showType: 'modal'
        });
    }

    /**
     * 处理设备错误（使用Toast提示）
     * @param {Error} error 错误对象
     * @param {string} context 上下文
     * @param {number} duration Toast显示时长（默认2000ms）
     */
    static handleDeviceError(error, context = '', duration = 2000) {
        const code = error?.code ?? 4001;
        console.log('handleDeviceError', error);
        return this.handle({ code, message: error?.message }, context, {
            showType: 'toast',
            icon: 'error',
            duration: duration
        });
    }

    /**
     * 处理打印机错误（使用Modal对话框）
     * @param {Error} error 错误对象
     * @param {string} context 上下文
     */
    static handlePrinterError(error, context = '') {
        const code = error?.code ?? 1;
        return this.handle({ code, message: error?.message }, context, {
            showType: 'modal'
        });
    }
}