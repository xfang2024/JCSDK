/**
 * 输入校验逻辑
 * @description 提供通用的输入验证功能，包括打印份数校验、页码校验等
 */

/**
 * 输入校验逻辑组合式函数
 * @returns {Object} 包含输入校验相关函数的对象
 */
export function useInputValidation() {
  /**
   * 通用输入处理函数
   * @param {Object} options - 配置选项
   * @param {any} options.value - 输入值
   * @param {boolean} options.allowEmpty - 是否允许空值
   * @param {number} options.min - 最小值
   * @param {number} options.max - 最大值
   * @param {any} options.defaultValue - 默认值
   * @param {Function} options.convertFunction - 转换函数
   * @param {boolean} options.onBlur - 是否为失焦事件
   * @returns {any} 校验后的值
   */
  const validateInput = ({ 
    value, 
    allowEmpty = false, 
    min, 
    max, 
    defaultValue, 
    convertFunction = Number, 
    onBlur = false 
  }) => {
    // 空值处理
    if (value === '' || value === null || value === undefined) {
      if (allowEmpty && !onBlur) {
        return null;
      }
      return defaultValue;
    }

    // 类型转换
    let convertedValue = convertFunction(value);

    // NaN 处理
    if (isNaN(convertedValue)) {
      return defaultValue;
    }

    // 范围限制
    if (convertedValue < min) {
      convertedValue = min;
    } else if (convertedValue > max) {
      convertedValue = max;
    }

    return convertedValue;
  };

  /**
   * 打印份数校验
   * @param {any} value - 输入值
   * @param {boolean} onBlur - 是否为失焦事件
   * @returns {number} 校验后的打印份数
   */
  const validatePrintCopies = (value, onBlur = false) => {
    return validateInput({
      value,
      allowEmpty: !onBlur,
      min: 1,
      max: 99,
      defaultValue: 1,
      convertFunction: parseInt,
      onBlur
    });
  };

  /**
   * 打印浓度校验
   * @param {any} value - 输入值
   * @param {boolean} onBlur - 是否为失焦事件
   * @returns {number} 校验后的打印浓度
   */
  const validatePrintDensity = (value, onBlur = false) => {
    return validateInput({
      value,
      allowEmpty: !onBlur,
      min: 1,
      max: 5,
      defaultValue: 3,
      convertFunction: parseInt,
      onBlur
    });
  };

  /**
   * 标签类型校验
   * @param {any} value - 输入值
   * @param {boolean} onBlur - 是否为失焦事件
   * @returns {number} 校验后的标签类型
   */
  const validateLabelType = (value, onBlur = false) => {
    return validateInput({
      value,
      allowEmpty: !onBlur,
      min: 1,
      max: 4,
      defaultValue: 1,
      convertFunction: parseInt,
      onBlur
    });
  };

  /**
   * 打印模式校验
   * @param {any} value - 输入值
   * @param {boolean} onBlur - 是否为失焦事件
   * @returns {number} 校验后的打印模式
   */
  const validatePrintMode = (value, onBlur = false) => {
    return validateInput({
      value,
      allowEmpty: !onBlur,
      min: 1,
      max: 2,
      defaultValue: 1,
      convertFunction: parseInt,
      onBlur
    });
  };

  /**
   * 页码校验
   * @param {any} value - 输入值
   * @param {number} max - 最大页码
   * @param {number} defaultValue - 默认值
   * @param {boolean} onBlur - 是否为失焦事件
   * @returns {number} 校验后的页码
   */
  const validatePageNumber = (value, max, defaultValue = 1, onBlur = false) => {
    return validateInput({
      value,
      allowEmpty: !onBlur,
      min: 1,
      max,
      defaultValue,
      convertFunction: parseInt,
      onBlur
    });
  };

  return {
    validateInput,
    validatePrintCopies,
    validatePageNumber,
    validatePrintDensity,
    validateLabelType,
    validatePrintMode
  };
}