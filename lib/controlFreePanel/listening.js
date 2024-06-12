import { uuidv1 } from '../../tool/utils';

/**
 * @description 注册监听当前控制组件变化
 * @param {*} callback 回调方法
 * 重点注视：期望监听使用完成后能销毁监听，需要主动触发移除监听。移除方法会在监听后返回，直接执行即可移除
 */
export function listeningCurrentSwitch(callback) {
  let listeningId = uuidv1();
  this.freeTransit.currentSwitchCallback[listeningId] = callback;
  return () => {
    delete this.freeTransit.currentSwitchCallback[listeningId];
  };
}

/**
 * @description 注册监听组件列表变化
 * @param {*} callback 回调方法
 * 重点注视：期望监听使用完成后能销毁监听，需要主动触发移除监听。移除方法会在监听后返回，直接执行即可移除
 */
export function listeningComponentListChange(callback) {
  let listeningId = uuidv1();
  this.freeTransit.componentListChangeCallback[listeningId] = callback;
  return () => {
    delete this.freeTransit.componentListChangeCallback[listeningId];
  };
}

/**
 * @description 注册监听记录变化数据变化
 * @param {*} callback 回调方法
 * 重点注视：期望监听使用完成后能销毁监听，需要主动触发移除监听。移除方法会在监听后返回，直接执行即可移除
 */
export function listeningCurrentChange(callback) {
  let listeningId = uuidv1();
  this.freeTransit.currentChangeCallback[listeningId] = callback;
  return () => {
    delete this.freeTransit.currentChangeCallback[listeningId];
  };
}

/**
 * @description 监听事件监听
 * @param {*} callback 回调方法
 */
export function listeningEventChange(callback) {
  let listeningId = uuidv1();
  this.freeTransit.eventChangeCallback[listeningId] = callback;
  return () => {
    delete this.freeTransit.eventChangeCallback[listeningId];
  };
}

/**
 * @description 监听面板缩放
 * @param {*} callback 回调方法
 */
export function listeningZoomChange(callback) {
  let listeningId = uuidv1();
  this.freeTransit.zoomChangeCallback[listeningId] = callback;
  return () => {
    delete this.freeTransit.zoomChangeCallback[listeningId];
  };
}

/**
 * @description 触发监听选中切换
 * @param {*} data 当前切换操作的组件的实例对象数据
 */
export const triggerCurrentSwitch = (function () {
  let dataId = null;
  return function (bool) {
    try {
      let newdata = this.freeTransit.currentControl;
      let { Obj, Index, Id, FreeConfig } = newdata;
      if (!dataId || dataId !== Id || bool) {
        dataId = Id;
        Object.keys(this.freeTransit.currentSwitchCallback).forEach((key) => {
          this.freeTransit.currentSwitchCallback[key]({
            currentThis: Id ? this.freeTransit.useThis(Id) : undefined,
            currentObject: Obj,
            currentIndex: Index,
            currentControl: newdata,
            freeConfig: FreeConfig,
          });
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
})();

/**
 * @description 触发监听组件列表变化
 */
export function triggerComponentListChange() {
  try {
    var that = this.panelInstance();
    Object.keys(this.freeTransit.componentListChangeCallback).forEach((key) => {
      this.freeTransit.componentListChangeCallback[key](that.componentList);
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * @description 触发监听缩放变化
 */
export function triggerZoomChange() {
  try {
    Object.keys(this.freeTransit.zoomChangeCallback).forEach((key) => {
      this.freeTransit.zoomChangeCallback[key](this.freeTransit.zoomValue);
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * @description 触发数据变化监听
 * @param changeData 变化数据
 * @param currentIndex 当前记录下标
 * @param historicalRecord 历史记录
 */
export function triggerCurrentChange(
  changeData,
  currentIndex,
  historicalRecord
) {
  try {
    Object.keys(this.freeTransit.currentChangeCallback).forEach((key) => {
      this.freeTransit.currentChangeCallback[key](
        changeData,
        currentIndex,
        historicalRecord
      );
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * @description 触发事件监听
 */
export function triggerEventChange(currentBindEvent, currentGather) {
  try {
    Object.keys(this.freeTransit.eventChangeCallback).forEach((key) => {
      this.freeTransit.eventChangeCallback[key]({
        currentBindEvent,
        currentGather,
        bindEvent: this.freeTransit.bindEvent,
      });
    });
  } catch (e) {
    console.error(e);
  }
}
