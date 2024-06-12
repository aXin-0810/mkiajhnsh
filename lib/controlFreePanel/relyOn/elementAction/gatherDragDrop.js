import { mobileProcess } from '../elementCalculate/mobileProcess';
import { assignment, PX_ValueConversion } from '../../../../tool/utils';
import { recordChange } from '../nodeFlow';

/**
 * @description 注册集合拖拽移动
 */
export const gatherDragDrop = (function () {
  let newData_ = { rootNodeStyle: {} };
  let oldData_ = { rootNodeStyle: {} };
  let oldRootNodeStyle = {};
  let recordCoilBox = null;

  return mobileProcess(
    function (e, { panelInstance }) {
      if (panelInstance.lockCoilBox && this.freeTransit.lockingComponent) {
        recordCoilBox = {
          left: PX_ValueConversion(panelInstance.lockCoilBox.left),
          top: PX_ValueConversion(panelInstance.lockCoilBox.top),
        };
        this.freeTransit.lockingComponent.forEach((item) => {
          // 记录初始定位位置
          oldRootNodeStyle[item.id] = {
            left: PX_ValueConversion(item['rootNodeStyle'].left),
            top: PX_ValueConversion(item['rootNodeStyle'].top),
          };
          // 深度拷贝数据
          oldData_['rootNodeStyle'][item.id] = assignment(
            item['rootNodeStyle']
          );
          // 浅层拷贝数据
          newData_['rootNodeStyle'][item.id] = item['rootNodeStyle'];
        });
      }
    },
    function (e, { panelInstance, isDown, mobileX, mobileY, unlock }) {
      if (isDown == false) {
        return;
      }

      // 移动圈框
      computeOffsetRecord(
        panelInstance.lockCoilBox,
        recordCoilBox.left,
        recordCoilBox.top
      );

      // 遍历群组成员下标值
      for (let id in oldRootNodeStyle) {
        computeOffsetRecord(
          newData_['rootNodeStyle'][id],
          oldRootNodeStyle[id].left,
          oldRootNodeStyle[id].top
        );
      }

      panelInstance.$nextTick(() => {
        unlock();
      });

      /**
       * @description 计算移动后的左偏移量和顶部的偏移量
       * @param item 组件实例对象
       * @param original_l 原本距离左边的值
       * @param original_t 原本距离上边的值
       */
      function computeOffsetRecord(item, original_l, original_t) {
        item['left'] = Math.round(mobileX + original_l) + 'px';
        item['top'] = Math.round(mobileY + original_t) + 'px';
      }
    },
    function (e, { panelInstance, isDown, changeBool }) {
      if (isDown) {
        if (changeBool) {
          recordChange.bind(this)({
            id: Object.keys(newData_['rootNodeStyle']),
            behavior: 'updata',
            type: 'coilBoxOperation',
            newData: newData_,
            oldData: oldData_,
          });
        }
        panelInstance.$nextTick(() => {
          newData_ = { rootNodeStyle: {} };
          oldData_ = { rootNodeStyle: {} };
          oldRootNodeStyle = {};
          recordCoilBox = null;
        });
      }
    }
  );
})();
