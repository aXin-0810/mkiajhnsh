import { judgeType } from '../../../tool/utils';
import { panelName } from '../../../const/paramet';

/**
 * @description 获取面板实例对象
 * @returns 面板实例对象
 */
export function panelInstance() {
  return this.freeTransit.useThis(panelName);
}

/**
 * @description 获取查找的实例对象
 * @param {string, function name(params) {}} paramet 参数 实例id / 查找回调
 * @returns 返回匹配的对象
 */
export function componentInstance(paramet) {
  const type = judgeType(paramet);
  const that = this.panelInstance();
  if (type === 'function') {
    return that.componentList.find(paramet);
  } else if (type === 'string') {
    return that.componentList.find((item) => {
      item.id === paramet;
    });
  }
  return false;
}

// 获取实例数据
export function instanceSpecifiedData(paramet, key) {
  const that = this.panelInstance();
  if (paramet === 'all') {
    let allData = {};
    that.componentList.map((item) => {
      allData[item.id] = item[key];
    });
    return allData;
  } else {
    return this.componentInstance(paramet)[key];
  }
}

// 获取根标签布局
export function instanceRootNodeStyle(paramet) {
  return instanceSpecifiedData.bind(this)(paramet, 'rootNodeStyle');
}

// 获取样式
export function instanceStyle(paramet) {
  return instanceSpecifiedData.bind(this)(paramet, 'freeStyle');
}

// 获取数据
export function instanceData(paramet) {
  return instanceSpecifiedData.bind(this)(paramet, 'freeData');
}
