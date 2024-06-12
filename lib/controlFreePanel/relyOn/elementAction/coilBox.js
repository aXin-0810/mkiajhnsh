import { mobileProcess } from '../elementCalculate/mobileProcess';
import { rectangularPointCoordinates } from '../elementCalculate/documentRect';
import { panelName } from '../../../../const/paramet';
/**
 * @description 画矩形框
 */
const coilBoxControl = (function () {
  let width, height, left, top, changeBool_;

  const coilBox = mobileProcess(
    function () {
      // 关闭上一次的矩形圈
      this.closeCoilBox();
      changeBool_ = false;
    },
    function (
      e,
      { panelInstance, initERect, newERect, isDown, setChangeBool, unlock }
    ) {
      if (isDown == false) {
        return;
      }

      width = Math.round(Math.abs(initERect.x - newERect.x));
      height = Math.round(Math.abs(initERect.y - newERect.y));
      top = Math.round(
        initERect.panelY < newERect.panelY ? initERect.panelY : newERect.panelY
      );
      left = Math.round(
        initERect.panelX < newERect.panelX ? initERect.panelX : newERect.panelX
      );

      if (width > 3 && height > 3) {
        panelInstance.lockCoilBox = {
          width: width + 'px',
          height: height + 'px',
          top: top + 'px',
          left: left + 'px',
        };
        changeBool_ = setChangeBool(true);
      } else {
        changeBool_ = setChangeBool(false);
      }

      panelInstance.$nextTick(() => {
        unlock();
      });
    },
    function (e, { panelInstance, panelRect, isDown, changeBool }) {
      if (isDown && changeBool) {
        var idGather = [];
        var component = [];
        // 查找被锁定圈完全包裹的组件
        for (let item of panelInstance.componentList) {
          let i = 0;
          rectangularPointCoordinates(
            item.id,
            panelRect,
            this.freeTransit.zoomValue,
            item.rootNodeStyle.transform.rotate,
            [
              'topRightAngle',
              'topLeftAngle',
              'bottomRightAngle',
              'bottomLeftAngle',
            ],
            function ({ x, y }) {
              if (x > left && x < left + width && y > top && y < top + height) {
                i++;
              }
            }
          );
          if (i === 4) {
            // 全包裹的组件坐标
            idGather.push(item.id);
            component.push(item);
          }
        }
        panelInstance.currentGatherMembers = [...idGather];
        this.freeTransit.lockingComponent = [...component];
      }
    }
  );

  // 关闭锁定圈
  const closeCoilBox = function (mainPanelBool = true) {
    if (changeBool_) {
      changeBool_ = false;
      return;
    }
    width = null;
    height = null;
    top = null;
    left = null;
    this.freeTransit.lockingComponent = [];
    this.panelInstance().currentGatherMembers = [];
    this.panelInstance().lockCoilBox = null;
    if (mainPanelBool) {
      this.setCurrentControl(panelName);
    }
  };

  return {
    coilBox,
    closeCoilBox,
  };
})();

export const coilBox = coilBoxControl.coilBox;
export const closeCoilBox = coilBoxControl.closeCoilBox;
