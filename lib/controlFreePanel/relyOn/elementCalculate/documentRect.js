import { panelName } from '../../../../const/paramet';
import {
  pythagoreanBevelEdge,
  bevelEdgeAngle,
  calculationPoint,
} from '../../../../tool/utils';

/**
 * @description 获取面板矩形信息
 */
export function panelViewRect() {
  let panelElement = document.getElementById(`${panelName}PageView`);
  let panelRect = panelElement.getBoundingClientRect();
  return {
    panelElement,
    panelRect,
    panelCenter: {
      x: panelRect.x + panelRect.width / 2,
      y: panelRect.y + panelRect.height / 2,
    },
  };
}

/**
 * @description 获取组件矩形信息
 * @param {*} element 组件id / 组件doc
 * @param {*} panelRectData 面板矩形数据
 * @param {*} scale 缩放值
 */
export function comViewRect(element, panelRectData, scale) {
  if (element instanceof Element) {
    var docRect = element.getBoundingClientRect();
  } else {
    element = document.getElementById(element);
    var docRect = element.getBoundingClientRect();
  }
  var { panelRect } = panelRectData;
  return {
    docElement: element,
    docRect: docRect,
    docCenter: {
      panelX: (docRect.x + docRect.width / 2 - panelRect.x) / scale,
      panelY: (docRect.y + docRect.height / 2 - panelRect.y) / scale,
    },
  };
}

/**
 * @description 缩放状态下计算x/y的对应坐标
 * @param {*} e 鼠标
 * @param {*} panelRectData 面板矩形数据
 * @param {*} scale 缩放值
 */
export function scalingCoordinates(e, panelRectData, scale) {
  var { panelRect, panelCenter } = panelRectData;
  if (scale === 1) {
    return {
      x: e.x,
      y: e.y,
      panelX: e.x - panelRect.x,
      panelY: e.y - panelRect.y,
    };
  }
  return {
    x: panelCenter.x - (panelCenter.x - e.x) / scale,
    y: panelCenter.y - (panelCenter.y - e.y) / scale,
    panelX: (e.x - panelRect.x) / scale,
    panelY: (e.y - panelRect.y) / scale,
  };
}

/**
 * @description 计算矩形点坐标
 * @param {*} element 元素id或者元素实例本身
 * @param {*} panelRectData 面板矩形数据
 * @param {*} scale 面板缩放值
 * @param {*} rotate 元素原始旋转角度
 * @param {*} gaugePointArr 需要求的点
 * @param {*} callback 回调
 */
export function rectangularPointCoordinates(
  element,
  panelRectData,
  scale,
  rotate,
  gaugePointArr,
  callback
) {
  // 获取元素组件对象
  let { docElement, docCenter } = comViewRect(element, panelRectData, scale);
  // 1/2宽
  let twoPointsWidth = docElement.offsetWidth / 2;
  // 1/2高
  let twoPointsHeight = docElement.offsetHeight / 2;
  // 直角求斜边
  let hypotenuse = pythagoreanBevelEdge(twoPointsWidth, twoPointsHeight);
  // 1/2高与1/2斜边夹角
  let highAngle = bevelEdgeAngle(twoPointsHeight, hypotenuse);
  // 1/2宽与1/2斜边夹角
  let widthAngle = 90 - highAngle;
  // 求点
  let gaugePoint = {
    // 左上角
    topLeftAngle: { radius: hypotenuse, angle: rotate + highAngle + 180 },
    // 上边中点
    topBorder: { radius: twoPointsHeight, angle: rotate - 90 },
    // 右上角
    topRightAngle: { radius: hypotenuse, angle: rotate + widthAngle - 90 },
    // 右边中点
    rightBorder: { radius: twoPointsWidth, angle: rotate },
    // 右下角
    bottomRightAngle: { radius: hypotenuse, angle: rotate + highAngle },
    // 下边中点
    bottomBorder: { radius: twoPointsHeight, angle: rotate + 90 },
    // 左下角
    bottomLeftAngle: { radius: hypotenuse, angle: rotate + widthAngle + 90 },
    // 左边中点
    leftBorder: { radius: twoPointsWidth, angle: rotate + 180 },
  };
  // 坐标容器
  let pointCoordinates = {};
  gaugePointArr.forEach(function (key) {
    let item = gaugePoint[key];
    if (item) {
      let coordinates = calculationPoint(
        docCenter.panelX,
        docCenter.panelY,
        item.radius,
        item.angle
      );
      pointCoordinates[key] = coordinates;
      callback && callback(coordinates);
    }
  });
  return pointCoordinates;
}
