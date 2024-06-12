import { gaugePoint } from '../../const/paramet';

import {
  panelInstance,
  componentInstance,
  instanceRootNodeStyle,
  instanceStyle,
  instanceData,
} from './relyOn/findObject';

// 基础功能模块
import {
  useThis,
  setCurrentControl,
  echoComponent,
  rollBack,
  nextStep,
  savePhaseData,
  resetFreePanel,
} from './base';

// 组件操作模块
import {
  addCloudModule,
  updateComponent,
  addComponent,
  copyComponent,
  removeComponent,
  setStyle,
  setData,
  setRootNodeStyle,
  setHidden,
  setZoomValue,
} from './operation';

// 事件模块
import { editorFuncEvent, removeFuncEvent, disableFuncEvent } from './event';

// 回调监听模块
import {
  listeningCurrentSwitch,
  listeningCurrentChange,
  listeningComponentListChange,
  listeningZoomChange,
  listeningEventChange,
  triggerCurrentSwitch,
} from './listening';

// 元素绑定事件
import {
  dragDropMove,
  gatherDragDrop,
  zoomWideHigh,
  rotateDoc,
  coilBox,
  closeCoilBox,
} from './relyOn/elementAction/index';

/**
 * @description 自由页面组件的控制构造器
 * @param {*} freeTransit_
 * @param {*} options_
 */
export function controlFreePanel(freeTransit_, options_ = {}) {
  /**
   * @description 面板实例对象
   */
  this.freeTransit = freeTransit_;

  /**
   * @description 控制选项
   */
  this.options = (() => {
    return Object.assign(
      {
        // 模式 [自由定位布局：FreePositioning，队列布局：QueueLayout]
        // 附属：此功能未完成
        // model: 'FreePositioning',
        // 标定点
        gaugePoint: gaugePoint,
        errorCallback: errorCallback,
      },
      options_
    );
  })();

  /**
   * @description 给面板环境赋值控制实例
   */
  this.freeTransit.accessControl(this);

  this.freeTransit.comesBack = () => {
    this.triggerCurrentSwitch(true);
  };

  // 错误处理
  function errorCallback(err) {
    console.error(err.msg);
  }
}

controlFreePanel.prototype.panelInstance = panelInstance;
controlFreePanel.prototype.componentInstance = componentInstance;
controlFreePanel.prototype.instanceRootNodeStyle = instanceRootNodeStyle;
controlFreePanel.prototype.instanceStyle = instanceStyle;
controlFreePanel.prototype.instanceData = instanceData;
controlFreePanel.prototype.useThis = useThis;
controlFreePanel.prototype.setCurrentControl = setCurrentControl;
controlFreePanel.prototype.addCloudModule = addCloudModule;
controlFreePanel.prototype.updateComponent = updateComponent;
controlFreePanel.prototype.addComponent = addComponent;
controlFreePanel.prototype.copyComponent = copyComponent;
controlFreePanel.prototype.removeComponent = removeComponent;
controlFreePanel.prototype.setStyle = setStyle;
controlFreePanel.prototype.setData = setData;
controlFreePanel.prototype.setRootNodeStyle = setRootNodeStyle;
controlFreePanel.prototype.setHidden = setHidden;
controlFreePanel.prototype.echoComponent = echoComponent;
controlFreePanel.prototype.setZoomValue = setZoomValue;
controlFreePanel.prototype.rollBack = rollBack;
controlFreePanel.prototype.nextStep = nextStep;
controlFreePanel.prototype.savePhaseData = savePhaseData;
controlFreePanel.prototype.resetFreePanel = resetFreePanel;
controlFreePanel.prototype.editorFuncEvent = editorFuncEvent;
controlFreePanel.prototype.removeFuncEvent = removeFuncEvent;
controlFreePanel.prototype.disableFuncEvent = disableFuncEvent;
controlFreePanel.prototype.listeningCurrentSwitch = listeningCurrentSwitch;
controlFreePanel.prototype.listeningCurrentChange = listeningCurrentChange;
controlFreePanel.prototype.listeningComponentListChange =
  listeningComponentListChange;
controlFreePanel.prototype.listeningZoomChange = listeningZoomChange;
controlFreePanel.prototype.listeningEventChange = listeningEventChange;
controlFreePanel.prototype.dragDropMove = dragDropMove;
controlFreePanel.prototype.gatherDragDrop = gatherDragDrop;
controlFreePanel.prototype.zoomWideHigh = zoomWideHigh;
controlFreePanel.prototype.rotateDoc = rotateDoc;
controlFreePanel.prototype.coilBox = coilBox;
controlFreePanel.prototype.closeCoilBox = closeCoilBox;
controlFreePanel.prototype.triggerCurrentSwitch = triggerCurrentSwitch;
