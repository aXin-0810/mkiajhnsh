import { mobileProcess } from '../elementCalculate/mobileProcess';
import { findComponentObject, realTimeCoordinates } from '../everyUpdate';
import { recordChange } from '../nodeFlow';
import { assignment, PX_ValueConversion } from '../../../../tool/utils';
import { currentClickSetBool } from '../common';

/**
 * @description 注册拖拽移动
 */
export const dragDropMove = (function () {
  let id, l, t, docObj, docIndex;

  return mobileProcess(
    function (e, { itemData }) {
      id = itemData.id;
      currentClickSetBool(true);
      this.closeCoilBox(false);
      this.setCurrentControl(id);
      findComponentObject.bind(this)(id, ({ item, index }) => {
        docIndex = index;
        docObj = assignment({
          id: item.id,
          name: item.name,
          rootNodeStyle: item.rootNodeStyle,
        });
        l = PX_ValueConversion(item['rootNodeStyle']['left']);
        t = PX_ValueConversion(item['rootNodeStyle']['top']);
      });
    },
    function (
      e,
      { panelInstance, panelRect, isDown, mobileX, mobileY, unlock }
    ) {
      if (isDown == false) {
        return;
      }

      panelInstance.componentList[docIndex]['rootNodeStyle']['left'] =
        Math.round(mobileX + l) + 'px';
      panelInstance.componentList[docIndex]['rootNodeStyle']['top'] =
        Math.round(mobileY + t) + 'px';

      panelInstance.$nextTick(() => {
        realTimeCoordinates.bind(this)(id, panelRect);
        unlock();
      });
    },
    function (e, { panelInstance, isDown, changeBool }) {
      currentClickSetBool(false);
      if (isDown) {
        if (changeBool) {
          recordChange.bind(this)({
            id: docObj.id,
            name: docObj.name,
            behavior: 'updata',
            type: 'panelOperation',
            newData: {
              rootNodeStyle:
                panelInstance.componentList[docIndex]['rootNodeStyle'],
            },
            oldData: {
              rootNodeStyle: docObj.rootNodeStyle,
            },
          });
        }
        panelInstance.$nextTick(() => {
          id = l = t = docObj = docIndex = null;
        });
      }
    }
  );
})();
