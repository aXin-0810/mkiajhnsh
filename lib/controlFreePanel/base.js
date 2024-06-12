import { assignment } from '../../tool/utils';
import { judgeTriggerLock } from './relyOn/common';
import { restoreNode } from './relyOn/nodeFlow';
import { findComponentObject } from './relyOn/everyUpdate';
import {
  currentClickSetBool,
  currentClickGetBool,
} from './relyOn/elementAction/index';
import {
  triggerCurrentSwitch,
  triggerComponentListChange,
  triggerCurrentChange,
  triggerZoomChange,
} from './listening';
import { panelName } from '../../const/paramet';

/**
 * @description 通过id获取组件this实例对象
 * @param {*} id 需要获取使用的组件的实例对象id
 */
export function useThis(id) {
  return this.freeTransit.useThis(id);
}

/**
 * @description 赋值组件id设置当前默认操作组件
 * @param {*} id 面板中每个元素组件的唯一标识id
 */
export function setCurrentControl(id, updatePoint = false) {
  if (judgeTriggerLock.bind(this)()) {
    if (currentClickGetBool()) {
      // 查找当前操作组件对象
      findComponentObject
        .bind(this)(
          id,
          undefined,
          () => {
            // 触发操作组件切换的监听事件
            triggerCurrentSwitch.bind(this)();
          },
          updatePoint
        )
        .$nextTick(() => {
          // 以上代码运行完毕后解除操作状态锁
          this.freeTransit.triggerLock = true;
        });
    } else {
      currentClickSetBool(true);
      this.freeTransit.triggerLock = true;
    }
  }
}

/**
 * @description 回滚上一步
 */
export function rollBack() {
  restoreNode.bind(this)('rollBack');
}

/**
 * @description 前进一步
 */
export function nextStep() {
  restoreNode.bind(this)('nextStep');
}

/**
 * @description 保存当前阶段操作数据
 */
export function savePhaseData() {
  var that = this.panelInstance();
  try {
    // 清除冗余的函数数据
    let componentIds = [panelName].concat(
      that.componentList.map((item) => {
        return item.id;
      })
    );
    Object.keys(this.freeTransit.bindEvent).forEach((id) => {
      if (!~componentIds.indexOf(id)) {
        delete this.freeTransit.bindEvent[id];
      }
    });

    return assignment({
      bindEvent: this.freeTransit.bindEvent,
      elements: that.componentList,
      [panelName]: {
        freeStyle: that.freeStyle,
      },
    });
  } catch (error) {
    this.options.errorCallback(error);
  } finally {
    // 保存成功后初始化历史操作记录
    this.freeTransit.modifyRecord = [];
    // 保存成功后初始化历史操作记录下标位
    this.freeTransit.currentRecordIndex = -1;
    // 触发历史变化监听事件
    triggerCurrentChange.bind(this)(
      null,
      this.freeTransit.currentRecordIndex,
      this.freeTransit.modifyRecord
    );
  }
}

/**
 * @description 回显组件样式
 * @param {*} pageObj
 */
export function echoComponent(pageObj = {}) {
  // 重置面板数据存储中心容器
  this.resetFreePanel();
  // 获取面板对象
  var that = this.panelInstance();
  // 赋值面板初始样式
  that.freeStyle = (pageObj[panelName] && pageObj[panelName].freeStyle) || {};
  // 赋值事件绑定信息
  this.freeTransit.bindEvent = pageObj.bindEvent || {};
  if (judgeTriggerLock.bind(this)()) {
    // this存储容器中只保留mainPanel
    this.freeTransit.thisContainer = {
      [panelName]: that,
    };
    // 当面板数据更新dom渲染完成之后
    that.$nextTick(() => {
      that.componentList = pageObj.elements || [];
      // 当面板数据更新dom渲染完成之后
      that.$nextTick(() => {
        this.freeTransit.triggerLock = true;
        triggerComponentListChange.bind(this)();
        setCurrentControl.bind(this)(panelName);
      });
    });
  }
}

/**
 * @description 重置构造器以及主控板页面
 */
export function resetFreePanel() {
  // 重置空间容器
  this.freeTransit.resetData();
  triggerCurrentSwitch.bind(this)();
  triggerCurrentChange.bind(this)(
    null,
    this.freeTransit.currentRecordIndex,
    this.freeTransit.modifyRecord
  );
  triggerZoomChange.bind(this)();
}
