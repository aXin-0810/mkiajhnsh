import errorCode from '../../tool/errorCode.js';
import { triggerEventChange } from './listening';

/**
 * @description 编辑自定义事件方法
 * @param {Object} options
 * @param {string} options.id 非必填-添加事件的组件或者页面的id
 * @param {string} options.funcName 必填-函数名字在同个实例中不能重复
 * @param {string} options.funcCode 必填-函数内容
 */
export function editorFuncEvent({ id, funcName, funcCode }) {
  try {
    if (!funcCode || typeof funcCode !== 'string') {
      throw new Error(errorCode.eventError);
    }
    let { bindEvent } = this.freeTransit;
    if (!bindEvent[id]) bindEvent[id] = {};
    if (!bindEvent[id][funcName]) bindEvent[id][funcName] = {};
    if (bindEvent[id][funcName]['disable'] !== undefined)
      bindEvent[id][funcName]['disable'] = false;
    bindEvent[id][funcName]['funcCode'] = escape(funcCode);
    triggerEventChange.bind(this)(bindEvent[id][funcName], bindEvent[id]);
  } catch (error) {
    this.options.errorCallback(error);
  }
}

/**
 * @description 删除自定义事件方法
 * @param {Object} options
 * @param {string} options.id 非必填-添加事件的组件或者页面的id
 * @param {string} options.funcName 必填-函数名字在同个实例中不能重复
 */
export function removeFuncEvent({ id, funcName }) {
  try {
    let { bindEvent } = this.freeTransit;
    if (bindEvent[id] && bindEvent[id][funcName])
      delete bindEvent[id][funcName];
    triggerEventChange.bind(this)(undefined, bindEvent[id]);
  } catch (error) {
    console.error(error);
  }
}

/**
 * @description 禁用自定义事件方法
 * @param {Object} options
 * @param {string} options.id 非必填-添加事件的组件或者页面的id
 * @param {string} options.funcName 必填-函数名字在同个实例中不能重复
 * @param {string} options.state 非必填-状态
 */
export function disableFuncEvent({ id, funcName, state = false }) {
  try {
    let { bindEvent } = this.freeTransit;
    if (bindEvent[id] && bindEvent[id][funcName])
      bindEvent[id][funcName]['disable'] = state;
    triggerEventChange.bind(this)(bindEvent[id][funcName], bindEvent[id]);
  } catch (error) {
    console.error(error);
  }
}
