import { mobileProcess } from '../elementCalculate/mobileProcess';
import { comViewRect } from '../elementCalculate/documentRect';
import { findComponentObject, realTimeCoordinates } from '../everyUpdate';
import { assignment, getAngle } from '../../../../tool/utils';
import { recordChange } from '../nodeFlow';

/**
 * @description 注册旋转
 */
export const rotateDoc = (function () {
  let id, docObj, DomRectControl;

  return mobileProcess(
    function (e, { panelInstance, panelRect, itemData, initERect }) {
      id = itemData.id;

      this.setCurrentControl(id);

      findComponentObject.bind(this)(id, ({ item }) => {
        docObj = assignment(item);
      });

      let DomRect = comViewRect(id, panelRect, this.freeTransit.zoomValue);
      DomRectControl = {
        x: DomRect.docCenter.panelX,
        y: DomRect.docCenter.panelY,
      };

      // 定位旋转角度提示位置
      panelInstance.angleShowsLocation = {
        x: initERect.panelX,
        y: initERect.panelY,
      };
    },
    function (e, { panelInstance, panelRect, newERect, isDown, unlock }) {
      if (isDown == false) {
        return;
      }

      this.freeTransit.currentControl.Obj.rootNodeStyle.transform.rotate =
        Math.round(
          getAngle(
            DomRectControl.x,
            DomRectControl.y,
            newERect.panelX,
            newERect.panelY
          )
        );

      panelInstance.angleShowsLocation = {
        x: newERect.panelX,
        y: newERect.panelY,
      };

      panelInstance.$nextTick(() => {
        realTimeCoordinates.bind(this)(id, panelRect);
        unlock();
      });
    },
    function (e, { panelInstance, isDown, changeBool }) {
      if (isDown) {
        if (changeBool) {
          recordChange.bind(this)({
            id: docObj.id,
            name: docObj.name,
            behavior: 'updata',
            type: 'panelOperation',
            newData: {
              rootNodeStyle: this.freeTransit.currentControl.Obj.rootNodeStyle,
            },
            oldData: {
              rootNodeStyle: docObj.rootNodeStyle,
            },
          });
          panelInstance.controlBool = true;
        }
        panelInstance.$nextTick(() => {
          this.freeTransit.triggerLock = true;
          panelInstance.angleShowsLocation = null;
          id = docObj = DomRectControl = null;
        });
      }
    }
  );
})();
