import {
  assignment,
  PX_ValueConversion,
  getAngle,
  getHypotenuse,
  getSquareEdge,
  threeAngles,
} from '../../../../tool/utils';
import { recordChange } from '../nodeFlow';
import { findComponentObject, realTimeCoordinates } from '../everyUpdate';
import { rectangularPointCoordinates } from '../elementCalculate/documentRect';
import { mobileProcess } from '../elementCalculate/mobileProcess';

/**
 * @description 注册缩放
 */
export const zoomWideHigh = (function () {
  let id,
    // 拉伸类型
    optType,
    // 类型序号
    optSerial,
    // 对应的组件对象
    docObj = {},
    // 是否为对角点
    diagonalPointsBool,
    // 初始点坐标
    initPointCoordinates,
    // 记录反向点坐标
    reversePoint,
    // 记录矩形的直角边夹角
    bevelEdgeAngle,
    // 记录出发点与反向点夹角
    recordAngle,
    // 浅拷贝同步修改
    rootNodeStyle = null;
  // 注释：此数组顺序不能打乱
  let zoomType = [
    'topBorder',
    'topRightAngle',
    'rightBorder',
    'bottomRightAngle',
    'bottomBorder',
    'bottomLeftAngle',
    'leftBorder',
    'topLeftAngle',
  ];

  return mobileProcess(
    function (e, { panelRect, itemData }) {
      id = itemData.id;
      optType = itemData.type;
      optSerial = zoomType.indexOf(itemData.type);

      this.setCurrentControl(id);

      findComponentObject.bind(this)(id, ({ item }) => {
        docObj = assignment(item);

        // 初始获取矩形8个关键点坐标
        initPointCoordinates = rectangularPointCoordinates(
          id,
          panelRect,
          this.freeTransit.zoomValue,
          item.rootNodeStyle.transform.rotate,
          this.options.gaugePoint
        );
        // 获取反向点坐标
        reversePoint = initPointCoordinates[zoomType[(optSerial + 4) % 8]];
        // 获取拉伸点与反向点水平夹角
        recordAngle = getAngle(
          reversePoint.x,
          reversePoint.y,
          initPointCoordinates[optType].x,
          initPointCoordinates[optType].y
        );
        // 计算直角边与斜边夹角
        if (~[1, 3, 5, 7].indexOf(optSerial)) {
          diagonalPointsBool = true;
          // 计算三个角点之间的夹角
          bevelEdgeAngle = threeAngles(
            reversePoint,
            initPointCoordinates[optType],
            initPointCoordinates[zoomType[(optSerial + 2) % 8]]
          );
        } else {
          diagonalPointsBool = false;
          // 计算两平行边中点的水平夹角
          bevelEdgeAngle =
            docObj.rootNodeStyle.transform.rotate + optSerial * 45;
        }
        // 浅拷贝同步修改
        rootNodeStyle = item.rootNodeStyle;
      });
    },
    function (e, { panelInstance, panelRect, newERect, isDown, unlock }) {
      if (isDown == false) {
        return;
      }

      let e_ = {
        x: newERect.panelX,
        y: newERect.panelY,
      };

      // 计算鼠标点和反向点之间距离（作为移动直角三角形的斜边）
      let distance = getHypotenuse(reversePoint, e_);
      // 计算移动点-反向点-操作促发点之间的夹角（作为移动直角三角形锐角夹角）
      let pointAngle =
        recordAngle - getAngle(reversePoint.x, reversePoint.y, e_.x, e_.y);
      // 计算操作触发点-反向点之间的距离
      let stretchDistance = getSquareEdge(distance, pointAngle).oppositeSide;
      if (diagonalPointsBool) {
        // 计算动态伸展边与水平线夹角的直角宽高
        var contrastWideHigh = getSquareEdge(stretchDistance, recordAngle);
        // "对角伸缩时"计算矩形宽高
        var calculateWideHigh = getSquareEdge(stretchDistance, bevelEdgeAngle);
      } else {
        // 计算动态伸展边的对比直角宽高
        var contrastWideHigh = getSquareEdge(stretchDistance, bevelEdgeAngle);
      }
      // 计算新的中心点
      let newCenter = {
        x: reversePoint.x + contrastWideHigh.adjacentSide / 2,
        y: reversePoint.y - contrastWideHigh.oppositeSide / 2,
      };

      switch (optSerial) {
        case 0:
        case 4: //上边点，下边点
          rootNodeStyle.height = Math.round(stretchDistance) + 'px';
          rootNodeStyle.left =
            Math.round(
              newCenter.x - PX_ValueConversion(rootNodeStyle.width) / 2
            ) + 'px';
          rootNodeStyle.top =
            Math.round(newCenter.y - stretchDistance / 2) + 'px';
          break;
        case 2:
        case 6: //右边点，左边点
          rootNodeStyle.width = Math.round(stretchDistance) + 'px';
          rootNodeStyle.left =
            Math.round(newCenter.x - stretchDistance / 2) + 'px';
          rootNodeStyle.top =
            Math.round(
              newCenter.y - PX_ValueConversion(rootNodeStyle.height) / 2
            ) + 'px';
          break;
        case 1:
        case 5: //右上点，左下点
          rootNodeStyle.width =
            Math.round(calculateWideHigh.oppositeSide) + 'px';
          rootNodeStyle.height =
            Math.round(calculateWideHigh.adjacentSide) + 'px';
          rootNodeStyle.left =
            Math.round(newCenter.x - calculateWideHigh.oppositeSide / 2) + 'px';
          rootNodeStyle.top =
            Math.round(newCenter.y - calculateWideHigh.adjacentSide / 2) + 'px';
          break;
        case 3:
        case 7: //右下点，左上点
          rootNodeStyle.width =
            Math.round(calculateWideHigh.adjacentSide) + 'px';
          rootNodeStyle.height =
            Math.round(calculateWideHigh.oppositeSide) + 'px';
          rootNodeStyle.left =
            Math.round(newCenter.x - calculateWideHigh.adjacentSide / 2) + 'px';
          rootNodeStyle.top =
            Math.round(newCenter.y - calculateWideHigh.oppositeSide / 2) + 'px';
          break;
      }

      panelInstance.$nextTick(() => {
        realTimeCoordinates.bind(this)(id, panelRect);
        unlock();
      });
    },
    function (e, { panelInstance, isDown, changeBool }) {
      if (isDown) {
        if (changeBool) {
          changeBool = false;
          recordChange.bind(this)({
            id: docObj.id,
            name: docObj.name,
            behavior: 'updata',
            type: 'panelOperation',
            newData: {
              rootNodeStyle: rootNodeStyle,
            },
            oldData: {
              rootNodeStyle: docObj.rootNodeStyle,
            },
          });
          panelInstance.controlBool = true;
        }

        panelInstance.$nextTick(() => {
          // 解锁
          this.freeTransit.triggerLock = true;
          docObj = {};
          id =
            optType =
            optSerial =
            diagonalPointsBool =
            initPointCoordinates =
            bevelEdgeAngle =
            reversePoint =
            recordAngle =
            rootNodeStyle =
              null;
        });
      }
    }
  );
})();
