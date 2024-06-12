import { panelName } from '../../const/paramet';
import { compareVersions } from '../../tool/utils';

/**
 * @description 数据传输空间构造器
 */
export function transit() {
  /**
   * @description 组件容器，存放所有组件的this对象以供使用
   */
  this.thisContainer = {};

  /**
   * @description 组件的配置参数
   */
  this.freeConfig = {};

  /**
   * @description 存放各类组件默认的排版
   */
  this.defaultRootNodeStyle = {};

  /**
   * @description 存放各类型组件初始默认样式容器
   */
  this.defaultFreeStyle = {};

  /**
   * @description 存放各类型组件初始默认数据容器
   */
  this.defaultFreeData = {};

  /**
   * @description 存放各类型组件对应定义的字段名称
   */
  this.componentsName = [];

  /**
   * @description 存放当前选中控制的组件基本数据。
   */
  this.currentControl = {
    Id: '',
    Index: -1,
    Obj: null,
    FreeConfig: null,
  };

  /**
   * @description 行为锁用于操作中判断事件是否可执行
   */
  this.triggerLock = true;

  /**
   * @description 存放面板操作的历史修改记录
   */
  this.modifyRecord = [];

  /**
   * @description 标记当前所在记录下标位置
   */
  this.currentRecordIndex = -1;

  /**
   * @description 存放面板以及组件所有绑定的事件与对应事件参数的信息容器
   */
  this.bindEvent = {};

  /**
   * @description 存放锁定框锁定的目标组件
   */
  this.lockingComponent = [];

  /**
   * @description 存放当前面板缩比例放值
   */
  this.zoomValue = 1;

  /**
   * @description 组件序号
   */
  this.serialNumber = 0;

  /**
   * @description 存放除当前元素以外，其他元素的八个关键点坐标x，y数量
   */
  this.alignmentPoint = {};

  // 监听回调容器

  /**
   * @description 存放订阅监听 “当前选中控制的组件id变化” 回调方法的对象
   */
  this.currentSwitchCallback = {};

  /**
   * @description 存放订阅监听 “当前面板组件列表变化” 回调方法的对象
   */
  this.componentListChangeCallback = {};

  /**
   * @description 存放订阅监听 “面板操作记录变化” 回调方法的对象
   */
  this.currentChangeCallback = {};

  /**
   * @description 存放订阅监听 “页面或组件定义的事件函数变化” 回调方法的对象
   */
  this.eventChangeCallback = {};

  /**
   * @description 存放订阅监听 “面板比例缩放变化” 回调方法的对象
   */
  this.zoomChangeCallback = {};

  /**
   * @description 存储定义的key字段对应保存组件this对象
   * @param {*} key 标识字段
   * @param {*} that_ 组件this对象
   */
  this.thisHook = (key, that_) => {
    if (!this.thisContainer[key]) {
      this.thisContainer[key] = that_;
    }
  };

  /**
   * @description 根据对应key字段获取组件的this对象
   * @param {*} key 标识字段
   */
  this.useThis = (key) => {
    return this.thisContainer[key];
  };

  this.comesBack = () => { };

  /**
   * @description 移除对应key字段保存的组件this对象
   * @param {*} key 标识字段
   */
  this.removeThis = (key) => {
    try {
      if (this.thisContainer[key]) {
        delete this.thisContainer[key];
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * @description 保存各个类型组件的默认配置
   * @param {String} key 标识字段
   * @param {Object} component 组件对象
   */
  this.addDefaultFreeConfig = (key, component) => {
    const { props, freeConfig } = component;
    if (freeConfig) {
      this.freeConfig[key] = freeConfig;
      const { rootNodeStyle, freeStyle, freeData } = props;
      if (rootNodeStyle && rootNodeStyle.default) {
        this.defaultRootNodeStyle[key] = rootNodeStyle.default();
      }
      if (freeStyle && freeStyle.default) {
        this.defaultFreeStyle[key] = freeStyle.default();
      }
      if (freeData && freeData.default) {
        this.defaultFreeData[key] = freeData.default();
      }
    }
  };

  /**
   * @description 重置数据
   */
  this.resetData = () => {
    // 主控板初始化数据
    Object.assign(
      this.thisContainer[panelName].$data,
      this.thisContainer[panelName].$options.data()
    );
    // 基础存储数据重置
    this.currentControl = {
      Id: '',
      Index: -1,
      Obj: null,
      FreeConfig: null,
    };
    this.currentRecordIndex = -1;
    this.modifyRecord = [];
    this.bindEvent = {};
    this.lockingComponent = [];
    this.zoomValue = 1;
    this.triggerLock = true;
    this.serialNumber = 0;
    this.alignmentPoint = {};
  };

  /**
   * @description 重置监听
   */
  this.resetListening = () => {
    this.currentSwitchCallback = {};
    this.componentListChangeCallback = {};
    this.currentChangeCallback = {};
    this.eventChangeCallback = {};
    this.zoomChangeCallback = {};
  };

  /**
   * @description 构造器重置
   */
  this.reset = () => {
    this.resetData();
    this.resetListening();
  };
}
