import { assignment, uuidv1, PX_ValueConversion } from '../../tool/utils';
import errorCode from '../../tool/errorCode.js';
import {
  triggerComponentListChange,
  triggerZoomChange,
  triggerCurrentSwitch,
} from './listening';
import { judgeTriggerLock } from './relyOn/common';
import { recordChange } from './relyOn/nodeFlow';
import { findComponentObject } from './relyOn/everyUpdate';
import { panelName } from '../../const/paramet';

/**
 * @description 面板添加新元素组件
 * @param name 组件的唯一标识定义的key名字
 * @param data 定义添加新组建时，是否复制已有组件数据
 * @param recordBool 是否需要记录
 * @param successCallback 执行成功回调
 */
export function addComponent(name, data, recordBool = true, successCallback) {
  if (
    ~this.freeTransit.componentsName.indexOf(name) &&
    judgeTriggerLock.bind(this)()
  ) {
    try {
      // 获取面板的this实例对象
      var that = this.panelInstance();

      if (data) {
        var _data = JSON.parse(JSON.stringify(data));
      }

      // 获取随机uuid
      var id = _data ? _data.id : uuidv1();

      // 组装需要追加的组件数据
      var pushData = _data || {
        id: id,
        name: name,
        // 注入默认样式
        freeStyle: assignment(this.freeTransit.defaultFreeStyle[name] || {}),
        // 注入默认的数据
        freeData: assignment(this.freeTransit.defaultFreeData[name] || {}),
        rootNodeStyle: Object.assign(
          {
            position: 'absolute',
            left: `0px`,
            top: `0px`,
            width: `0px`,
            height: `0px`,
            zIndex: 1,
            transform: {
              rotate: 0,
            },
          },
          this.freeTransit.defaultRootNodeStyle[name]
        ),
        // 定义组件隐藏/显示判断字段
        hidden: false,
        // 组件序号
        serialNumber: ++this.freeTransit.serialNumber,
      };

      // 将组装好的新组件初始数据追加进面板元素组件容器
      that.componentList.push(pushData);

      // 在历史操作记录容器中追加一个操作记录
      if (recordBool) {
        recordChange.bind(this)({
          id: id,
          name: name,
          behavior: 'add',
          newData: pushData,
          oldData: null,
        });
      }

      // 当面板数据更新dom渲染完成之后
      that.$nextTick(() => {
        // 解除行为操作状态锁
        this.freeTransit.triggerLock = true;
        // 促发面板元素组件容器变化监听事件
        triggerComponentListChange.bind(this)();
        // 设置当前新增的组件为当前默认操作的组件
        this.setCurrentControl(id);
        // 成功回调
        successCallback && successCallback();
      });
    } catch (error) {
      console.error(error);
    }
  }
}

/**
 * @description 复制已有组件
 * @param {*} id 需要复制的组件id
 */
export function copyComponent(id) {
  if (
    (id || this.freeTransit.currentControl.Id) &&
    ((id && id !== panelName) ||
      (this.freeTransit.currentControl.Id &&
        this.freeTransit.currentControl.Id !== panelName)) &&
    judgeTriggerLock.bind(this)()
  ) {
    findComponentObject.bind(this)(
      id || this.freeTransit.currentControl.Id,
      ({ that, item }) => {
        // 深度拷贝数据
        var pushData = assignment(item);
        // 重新赋值新uuid
        pushData.id = uuidv1();
        // 重新赋值新序号
        pushData.serialNumber = ++this.freeTransit.serialNumber;

        // 设置复制的组件的绝对定位位置
        pushData.rootNodeStyle.left =
          PX_ValueConversion(pushData.rootNodeStyle.left) + 5 + 'px';
        pushData.rootNodeStyle.top =
          PX_ValueConversion(pushData.rootNodeStyle.top) + 5 + 'px';

        // 将处理好的新组件初始数据追加进面板元素组件容器
        that.componentList.push(pushData);

        // 在历史操作记录容器中追加一个操作记录
        recordChange.bind(this)({
          id: pushData.id,
          name: pushData.name,
          behavior: 'add',
          newData: pushData,
          oldData: null,
        });

        // 当面板数据更新dom渲染完成之后
        that.$nextTick(() => {
          // 解除行为操作状态锁
          this.freeTransit.triggerLock = true;
          // 促发面板元素组件容器变化监听事件
          triggerComponentListChange.bind(this)();
          // 设置当前新增的组件为当前默认操作的组件
          this.setCurrentControl(pushData.id);
        });
      }
    );
  }
}

/**
 * @description 删除组件
 * @param {*} id 标记非必传
 * @param recordBool 是否需要记录
 * @param successCallback 执行成功回调
 */
export function removeComponent(id, recordBool = true, successCallback) {
  if (
    ((id && id !== panelName) ||
      (this.freeTransit.currentControl.Id &&
        this.freeTransit.currentControl.Id !== panelName)) &&
    judgeTriggerLock.bind(this)()
  ) {
    let _id = id || this.freeTransit.currentControl.Id;
    let that = findComponentObject.bind(this)(_id, ({ that, item, index }) => {
      // 在容器空间内删除对应id的this控制
      this.freeTransit.removeThis(_id);

      // 在面板组件容器中移除对应下标的组件数据
      var oldData = that.componentList.splice(index, 1);

      // 在历史操作记录容器中追加一个操作记录
      if (recordBool) {
        recordChange.bind(this)({
          id: oldData[0].id,
          name: oldData[0].name,
          behavior: 'del',
          newData: null,
          oldData: oldData[0],
        });
      }
    });
    // 当面板数据更新dom渲染完成之后
    that.$nextTick(() => {
      // 解除行为操作状态锁
      this.freeTransit.triggerLock = true;
      // 促发面板元素组件容器变化监听事件
      triggerComponentListChange.bind(this)();
      // 置空当前可操作的组件对象id
      this.setCurrentControl(panelName);
      // 成功回调
      successCallback && successCallback();
    });
  }
}

/**
 * @description 修改指定类数据(允许自定义字段修改)
 * @param {*} specifyType 修改的类型
 * @param {*} key 修改的key字段
 * @param {*} val 修改的值
 * @param {*} recordBool 此次修改是否记录在修改历史中
 */
export function specifyModification(specifyType, key, val, recordBool) {
  try {
    var id = this.freeTransit.currentControl.Id;

    // 判断操作id是否存在
    if (!id) {
      throw new Error(errorCode.lackOfId);
    }

    if (judgeTriggerLock.bind(this)()) {
      var that = this.panelInstance();

      // 判断当前是否修改面板配置数据
      if (id === panelName) {
        // 判断修改的数据类型之前是否存在
        if (
          that[specifyType] !== undefined ||
          that[specifyType][key] !== undefined
        ) {
          that[specifyType][key] = val;
        } else {
          throw new Error(errorCode.modifyBeyond);
        }
      } else {
        findComponentObject.bind(this)(id, ({ that, item, index }) => {
          // 判断修改的字段是否有定义
          if (
            item[specifyType] !== undefined &&
            item[specifyType][key] !== undefined
          ) {
            // 判断是否需要对修改做记录
            if (recordBool) {
              // 在历史操作记录容器中追加一个操作记录
              recordChange.bind(this)({
                id: item.id,
                name: item.name,
                behavior: 'updata',
                type: specifyType,
                key: key,
                newData: {
                  [specifyType]: { [key]: val },
                },
                oldData: {
                  [specifyType]: { [key]: item[specifyType][key] },
                },
              });
            }

            item[specifyType][key] = val;
          } else {
            throw new Error(errorCode.modifyBeyond);
          }
        });
      }

      // 当面板数据更新dom渲染完成之后
      that.$nextTick(() => {
        this.freeTransit.triggerLock = true;
        this.setCurrentControl(id, true);
      });
    }
  } catch (error) {
    if (!this.freeTransit.triggerLock) {
      // 当面板数据更新dom渲染完成之后
      that.$nextTick(() => {
        this.freeTransit.triggerLock = true;
        this.setCurrentControl(id, true);
      });
    }
    this.options.errorCallback(error);
  }
}

/**
 * @description 修改样式
 * @param {*} key 属性
 * @param {*} val 数据
 * @param {*} recordBool 是否保存修改记录
 */
export function setStyle(key, val, recordBool = true) {
  specifyModification.bind(this)('freeStyle', key, val, recordBool);
}

/**
 * @description 修改数据
 * @param {*} key 属性
 * @param {*} val 数据
 * @param {*} recordBool 是否保存修改记录
 */
export function setData(key, val, recordBool = true) {
  specifyModification.bind(this)('freeData', key, val, recordBool);
}

/**
 * @description 修改布局排版
 * @param {*} key 属性
 * @param {*} val 数据
 * @param {*} recordBool 是否保存修改记录
 */
export function setRootNodeStyle(key, val, recordBool = true) {
  specifyModification.bind(this)('rootNodeStyle', key, val, recordBool);
}

/**
 * @description 设置组件隐藏
 * @param {*} bool 是/否
 * @param {*} id 组件id，默认当前选中
 */
export function setHidden(bool, id) {
  // 判断操作id是否存在
  if (!id && !this.freeTransit.currentControl.Id) {
    return;
  }

  // 判断id不等于面板与判断行为操作状态锁是否开启
  if (id !== panelName && judgeTriggerLock.bind(this)()) {
    var that = findComponentObject.bind(this)(
      id || this.freeTransit.currentControl.Id,
      ({ that, item, index, list }) => {
        // 设置显示或者隐藏
        item.hidden = bool;
      }
    );

    // 当面板数据更新dom渲染完成之后
    that.$nextTick(() => {
      this.freeTransit.triggerLock = true;
    });
  }
}

/**
 * @description 设置当前面板缩放级别
 * @param {*} num 缩放值
 */
export function setZoomValue(num) {
  try {
    var val = num;
    if (typeof val !== 'number') {
      val = Number(num);
      if (isNaN(val)) {
        throw new Error(errorCode.zoomModifyBeyond);
      }
    }
    if (val > 0) {
      this.freeTransit.zoomValue = Number(val.toFixed(2));
      triggerZoomChange.bind(this)();
    } else {
      throw new Error(errorCode.zoomModifyBeyond);
    }
  } catch (error) {
    this.options.errorCallback(error);
  }
}
