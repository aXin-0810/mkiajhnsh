import {
  panelViewRect,
  rectangularPointCoordinates,
} from './elementCalculate/documentRect';
import { firstPerform } from '../../../tool/jsPerformLock';
import { panelName } from '../../../const/paramet';

/**
 * @description 在面板组件容器中查找对应的组件数据
 * @param id 需要查询的组件实例对象id
 * @param callback 找到对应组件实例对象id后的回调事件
 */
export function findComponentObject(
  id,
  callback,
  replaceCallback,
  updatePoint = false
) {
  // 获取面板this操作实例对象
  var that = this.panelInstance();
  var currentControl = this.freeTransit.currentControl;

  if (id) {
    var updateCurrentControl =
      currentControl.Id !== id ||
      !that.componentList[currentControl.Index] ||
      that.componentList[currentControl.Index].id !== id;

    // 获取对应的操控对象
    if (updateCurrentControl) {
      if (id === panelName) {
        currentControl.Id = panelName;
        currentControl.Index = -1;
        currentControl.Obj = that;
        currentControl.FreeConfig = null;
        that.currentAlignmentPoint = {
          x: [],
          y: [],
        };
      } else {
        for (var i = 0; i < that.componentList.length; i++) {
          var item = that.componentList[i];
          if (item['id'] === id) {
            currentControl.Id = id;
            currentControl.Index = i;
            currentControl.Obj = item;
            currentControl.FreeConfig = this.freeTransit.freeConfig[item.name];
            break;
          }
        }
      }
      alignmentLineCalculate.bind(this)();
    }

    if (updateCurrentControl || updatePoint) {
      realTimeCoordinates.bind(this)(id);
    }

    callback &&
      callback({
        that: that,
        item: currentControl.Obj,
        index: currentControl.Index,
        list: that.componentList,
        current: this.freeTransit.currentControl,
      });

    updateCurrentControl && replaceCallback && replaceCallback();
  }

  return that;
}

/**
 * @description 计算元素对齐位置点
 */
export function alignmentLineCalculate() {
  let this_ = this;
  // 获取面板实例对象
  let that = this.panelInstance();
  // 容器doc对应窗口位置
  let panelRect = panelViewRect();
  // 对齐点
  let alignmentPoint = {
    x: [],
    y: [],
  };

  for (let item of that.componentList) {
    if (item.id !== this.freeTransit.currentControl.Id) {
      computer(item.id, item);
    }
  }

  this.freeTransit.alignmentPoint = alignmentPoint;

  function computer(id, item) {
    rectangularPointCoordinates(
      id,
      panelRect,
      this_.freeTransit.zoomValue,
      item.rootNodeStyle.transform.rotate,
      this_.options.gaugePoint,
      function ({ x, y }) {
        let x0 = Math.round(x);
        let y0 = Math.round(y);
        if (!~alignmentPoint.x.indexOf(x0)) {
          alignmentPoint.x.push(x0);
        }
        if (!~alignmentPoint.y.indexOf(y0)) {
          alignmentPoint.y.push(y0);
        }
      }
    );
  }
}

/**
 * @description 实时计算当前操作元素的关键坐标点
 */
export const realTimeCoordinates = (function () {
  let id = null;
  let doc = null;
  let item_ = null;
  // 容器doc对应窗口位置
  let panelRect = null;
  const snappingPosition = new firstPerform(1000).refactor(function () {
    // 获取面板当前对应窗口位置
    panelRect = panelViewRect();
  });

  return function (ide, relative) {
    if (ide === panelName) {
      id = null;
      doc == null;
      this.panelInstance().currentAlignmentPoint = null;
      return;
    }

    if (relative) {
      panelRect = relative;
    } else {
      snappingPosition();
    }

    if (ide !== id) {
      id = ide;
      doc = document.getElementById(ide);
      findComponentObject.bind(this)(id, ({ item }) => {
        // 对比旋转角度
        item_ = item;
      });
    }

    if (doc && item_) {
      let currentAlignmentPoint = {
        x: [],
        y: [],
      };

      rectangularPointCoordinates(
        doc,
        panelRect,
        this.freeTransit.zoomValue,
        item_.rootNodeStyle.transform.rotate,
        this.options.gaugePoint,
        function ({ x, y }) {
          let x0 = Math.round(x);
          let y0 = Math.round(y);
          if (!~currentAlignmentPoint.x.indexOf(x0)) {
            currentAlignmentPoint.x.push(x0);
          }
          if (!~currentAlignmentPoint.y.indexOf(y0)) {
            currentAlignmentPoint.y.push(y0);
          }
        }
      );

      this.freeTransit.useThis(panelName).currentAlignmentPoint =
        currentAlignmentPoint;
    }
  };
})();
