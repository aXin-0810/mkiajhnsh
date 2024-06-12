import { panelViewRect, scalingCoordinates } from './documentRect';
import { passivePerform } from '../../../../tool/jsPerformLock';

/**
 * @description 相对面板=>鼠标点击移动过程
 * @param {*} mousedown 鼠标按下时
 * @param {*} mousemove 鼠标移动时
 * @param {*} mouseup 鼠标弹起时
 */
export function mobileProcess(mousedown, mousemove, mouseup) {
  let performLock = new passivePerform();
  let this_, panelInstance, itemData;
  let initX, //初始x
    initY, //初始y
    newX, //实时x
    newY, //实时y
    mobileX, //x移动距离
    mobileY, //y移动距离
    panelRect, //面板矩形数据
    initERect,
    newERect,
    isDown = false, //开关
    changeBool = false; //判断数据是否变化

  // 鼠标移动
  const onmousemove = performLock.refactor(function (e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;

    newX = e.clientX;
    newY = e.clientY;
    mobileX = (newX - initX) / this_.freeTransit.zoomValue;
    mobileY = (newY - initY) / this_.freeTransit.zoomValue;
    newERect = scalingCoordinates(e, panelRect, this_.freeTransit.zoomValue);

    let setChange = true;
    mousemove &&
      mousemove.bind(this_)(e, {
        panelInstance,
        panelRect,
        itemData,
        initERect,
        newERect,
        initX,
        initY,
        newX,
        newY,
        mobileX,
        mobileY,
        isDown,
        changeBool,
        setChangeBool(bool) {
          changeBool = bool;
          setChange = false;
          return changeBool;
        },
        unlock() {
          performLock.unlock();
        },
      });
    if (setChange && !changeBool) changeBool = true;
  });

  // 鼠标抬起
  const onmouseup = function (e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;

    if (isDown) {
      document.onmouseup = null;
      window.onmousemove = null;
    }

    mouseup &&
      mouseup.bind(this_)(e, {
        panelInstance,
        panelRect,
        itemData,
        initERect,
        newERect,
        initX,
        initY,
        newX,
        newY,
        mobileX,
        mobileY,
        isDown,
        changeBool,
      });

    this_ = panelInstance = itemData = panelRect = initERect = newERect = null;
    initX = initY = newX = newY = mobileX = mobileY = null;
    isDown = changeBool = false;
  };

  // 鼠标按下
  return function (e, data) {
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }

    this_ = this;
    panelInstance = this.panelInstance();
    initX = e.clientX;
    initY = e.clientY;
    itemData = data;

    panelRect = panelViewRect();
    initERect = scalingCoordinates(e, panelRect, this_.freeTransit.zoomValue);
    mousedown &&
      mousedown.bind(this_)(e, {
        panelInstance,
        panelRect,
        itemData,
        initERect,
        initX,
        initY,
      });

    //开关打开
    isDown = true;

    //鼠标抬起事件
    document.onmouseup = onmouseup;
    //鼠标移动
    window.onmousemove = onmousemove;
  };
}
