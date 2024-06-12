/**
 * @description 判断行为操作状态锁是否开启
 */
export function judgeTriggerLock() {
  if (this.freeTransit.triggerLock) {
    // 关闭行为操作状态锁
    this.freeTransit.triggerLock = false;
    return true;
  } else {
    return false;
  }
}

/**
 * @description 点击过滤
 */
const clickFilter = (function () {
  var clickBool = true;
  function setClickBool(bool) {
    clickBool = bool;
  }
  function getClickBool() {
    return clickBool;
  }
  return {
    setClickBool,
    getClickBool,
  };
})();

/**
 * @description 设置值
 * @param bool 布尔值
 */
export const currentClickSetBool = clickFilter.setClickBool;

/**
 * @description 获取值
 * @returns 布尔值
 */
export const currentClickGetBool = clickFilter.getClickBool;
