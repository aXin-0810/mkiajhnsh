import { assignment } from '../../../tool/utils.js';
import { triggerCurrentChange } from '../listening';
import { judgeTriggerLock } from './common';
import { findComponentObject } from './everyUpdate';
import { queuePerform } from '../../../tool/jsPerformLock';

// 节点锁
const restoreNodeLock = new queuePerform();

/**
 * @description 记录变化
 * @param data 需要保存的记录数据
 */
export function recordChange(data) {
  // 每次保存重当前节点删除后面所有
  if (this.freeTransit.modifyRecord[this.freeTransit.currentRecordIndex + 1]) {
    this.freeTransit.modifyRecord.splice(
      this.freeTransit.currentRecordIndex + 1,
      this.freeTransit.modifyRecord.length - 1
    );
  }
  // 深拷贝转换数据
  var changeData = assignment(data);
  // 在操作历史容器中追加记录
  this.freeTransit.modifyRecord.push(changeData);
  // 当前操作记录节点下表++
  this.freeTransit.currentRecordIndex++;
  // 触发历史变化监听事件
  triggerCurrentChange.bind(this)(
    changeData,
    this.freeTransit.currentRecordIndex,
    this.freeTransit.modifyRecord
  );
}

/**
 * @description 还原恢复节点数据
 * @param type 前进/回退类型
 */
export const restoreNode = restoreNodeLock.refactor(function (type) {
  if (
    // 判断回退时是否还有上一步操作可以回退
    (type === 'rollBack' && this.freeTransit.currentRecordIndex >= 0) ||
    // 判断前进时是否还有下一步操作可以前进
    (type === 'nextStep' &&
      this.freeTransit.currentRecordIndex + 1 <
        this.freeTransit.modifyRecord.length)
  ) {
    if (judgeTriggerLock.bind(this)()) {
      // 获取面板this实例对象
      let that = this.panelInstance();

      // 判断type值
      let typeBool = type === 'nextStep' ? 1 : 0;

      // 获取对应历史记录数据
      let data =
        this.freeTransit.modifyRecord[
          this.freeTransit.currentRecordIndex + typeBool
        ];

      // 判断当前操作时向前进一步还是向后退一步
      let useData = data && data[typeBool ? 'newData' : 'oldData'];

      // 定义前进或者回滚成功后修改当前历史记录下表值
      let setCurrentRecordIndex = () => {
        if (typeBool) {
          // 前进成功后当前历史记录下标加1
          this.freeTransit.currentRecordIndex++;
        } else {
          // 回退成功后当前历史记录下标减1
          this.freeTransit.currentRecordIndex--;
        }
      };

      if (
        // 回退操作处理新增行为
        (!typeBool && data.behavior === 'add') ||
        // 前进操作处理删除行为
        (typeBool && data.behavior === 'del')
      ) {
        // 解锁执行下个任务
        this.freeTransit.triggerLock = true;
        // 重新执行删除操作但不做记录
        this.removeComponent(data.id, false, () => {
          setCurrentRecordIndex();
          restoreNodeLock.unlock();
        });
      } else if (
        // 回退操作处理删除行为
        (!typeBool && data.behavior === 'del') ||
        // 前进操作处理新增行为
        (typeBool && data.behavior === 'add')
      ) {
        // 解锁执行下个任务
        this.freeTransit.triggerLock = true;
        // 重新执行新增操作但不做记录
        this.addComponent(useData.name, useData, false, () => {
          setCurrentRecordIndex();
          restoreNodeLock.unlock();
        });
      } else {
        if (data.behavior === 'updata') {
          // 处理修改功能
          if (data.type === 'coilBoxOperation') {
            // 修改群成员移动定位
            that.componentList.forEach((item, index) => {
              if (~data.id.indexOf(item.id)) {
                that.componentList[index]['rootNodeStyle'] =
                  useData['rootNodeStyle'][item.id];
              }
            });
            that.$nextTick(() => {
              setCurrentRecordIndex();
              this.freeTransit.triggerLock = true;
              restoreNodeLock.unlock();
            });
          } else {
            findComponentObject.bind(this)(
              data.id,
              ({ that, item, index, list }) => {
                if (data.type == 'panelOperation') {
                  // 拖拽,缩放,旋转修改
                  that.componentList[index]['rootNodeStyle'] =
                    useData['rootNodeStyle'];
                } else {
                  // 其他基础修改
                  var _item = that.componentList[index][data.type];
                  _item[data.key] = useData[data.type][data.key];
                }
              }
            );
            that.$nextTick(() => {
              setCurrentRecordIndex();
              this.freeTransit.triggerLock = true;
              this.setCurrentControl(data.id, true);
              restoreNodeLock.unlock();
            });
          }
        }
      }
    } else {
      restoreNodeLock.unlock();
    }
  } else {
    restoreNodeLock.unlock();
  }
});
