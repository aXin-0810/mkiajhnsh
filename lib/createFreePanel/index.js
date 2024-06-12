import { transit } from '../transit/index.js';
import { evil, judgeType } from '../../tool/utils';
import { panelName } from '../../const/paramet';

/**
 * @description 自由页面组件构造器
 * @param {*} options
 */
export function createFreePanel(mainPanel, options = {}) {
  // 创建新容器
  this.freeTransit = new transit();

  // 区分this
  let that = this;

  /**
   * @description 勾住组件this
   */
  this.lockTheThis = (key, component) => {
    /**
     * @description 在每个组件创建时获取组件的this实例对象并保存在容器中
     */
    // 记录默认的created事件
    if (component.created) {
      var created = component.created;
    }
    // 重写组件的created事件
    component.created = function () {
      // 锁住this
      that.freeTransit.thisHook(key || this.id, this);
      // 执行原有的钩子方法
      if (created) {
        created.call(this);
      }
    };

    /**
     * @description 在每个组件销毁时释放this实例对象在容器中删除
     */
    // 判断组件本身是否存在销毁时事件，没有则定义数据类型
    if (!component.beforeDestroy || !component.beforeDestroy.length) {
      component.beforeDestroy = [];
    }

    // 添加组件销毁时事件函数
    component.beforeDestroy.push(function () {
      that.freeTransit.removeThis(key || this.id);
    });
  };

  /**
   * @description 注册组件数据解析转换
   */
  this.componentEnroll = (item) => {
    /**
     * @description 添加父传子字段数据
     */
    if (!item.component.props) {
      item.component.props = {};
    }

    /**
     * @description 赋值获取组件实例this的方法
     */
    if (!item.component.methods) {
      item.component.methods = {};
    }

    /**
     * 转化解析配置json
     */
    if (item.component.freeConfig) {
      var freeConfig = item.component.freeConfig;
      Object.keys(freeConfig).map((prop) => {
        if (~['rootNodeStyle', 'freeStyle', 'freeData'].indexOf(prop)) {
          // 解析转换可变化数据
          item.component.props[prop] = {
            type: Object,
            default: () => {
              if (prop === 'rootNodeStyle') {
                return freeConfig[prop];
              } else {
                var object = {};
                Object.keys(freeConfig[prop]).map((key) => {
                  if (freeConfig[prop][key]['default']) {
                    object[key] = freeConfig[prop][key]['default'];
                  } else {
                    object[key] = freeConfig[prop][key];
                  }
                });
                return object;
              }
            },
          };
        } else if (prop === 'freeBindMethods') {
          // 解析转换可自定义编辑函数
          var freeBindMethods = freeConfig[prop];
          Object.keys(freeBindMethods).map((funcName) => {
            item.component.methods[funcName] = function (...paramet) {
              // 获取组件对应修改后的方法
              var componentBindEvent = that.freeTransit.bindEvent[this.id];
              if (componentBindEvent) {
                var { [funcName]: func } = componentBindEvent;
              }
              // 运行函数
              if (func && func.funcCode) {
                // 自定义函数
                evil(unescape(func.funcCode)).call(this, ...paramet);
              }
              // 默认函数
              else if (judgeType(freeBindMethods[funcName]) == 'function') {
                freeBindMethods[funcName].call(this, ...paramet);
              }
            };
          });
        }
      });
    }

    // 勾住组件this以id为字段
    this.lockTheThis(undefined, item.component);

    // 给每个组件赋值useThis的方法，用于在组件中调度别的组件操作
    item.component.methods.useThis = that.freeTransit.useThis;

    item.component.methods.comesBack = that.freeTransit.comesBack;

    /**
     * @description 添加唯一标识id属性
     */
    item.component.props.id = {
      type: null,
    };

    /**
     * @description 添加排版属性
     */
    if (!item.component.props.rootNodeStyle) {
      item.component.props.rootNodeStyle = {
        type: null,
      };
    }

    // 获取组件修改样式的范围
    that.freeTransit.addDefaultFreeConfig(item.name, item.component);

    // 保存组件类名字
    that.freeTransit.componentsName.push(item.name);

    return item.component;
  };

  // 面板注册
  this.lockTheThis(panelName, mainPanel);

  this.freeTransit.addDefaultFreeConfig(panelName, mainPanel);

  // 组件遍历注册
  if (options.components && options.components.length) {
    options.components.forEach((item) => {
      /**
       * @description 面板组件注册子组件
       */
      if (!mainPanel.components) {
        mainPanel.components = {};
      }

      mainPanel.components[item.name] = this.componentEnroll(item);
    });
  }

  /**
   * @description 赋值面板控制权
   */
  this.freeTransit.accessControl = (controlPanel) => {
    if (!mainPanel.beforeCreate) {
      mainPanel.beforeCreate = [];
    }
    mainPanel.beforeCreate.push(function () {
      this.controlPanel = controlPanel;
    });
  };

  /**
   * @description 返回面板控件组件
   */
  this.component = () => {
    return new Promise((resolve) => {
      resolve(mainPanel);
    });
  };
}
