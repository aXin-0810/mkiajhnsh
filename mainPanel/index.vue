<template>
  <div class="mainPanelSetShell" :style="setShellStyle">
    <div
      :id="`${id}PageView`"
      :style="{
        position: 'relative',
        display: 'inline-block',
        transform: `scale(${zoomValue})`,
      }"
      class="mainPanelViewStyle"
    >
      <!-- 面板 -->
      <div
        v-if="again_show"
        :id="`${id}Page`"
        :style="[freeStyle]"
        class="mainPanelStyle"
        @mousedown.stop="lockCoil($event)"
        @click.stop="selectPanel"
      >
        <!-- 元素节点外壳 -->
        <div
          v-for="item in componentList"
          :id="item.id"
          :ref="item.id"
          :key="item.id"
          :style="[
            rootTagTypography(item),
            {
              cursor: 'move',
            },
          ]"
          :class="{
            basisStyle: true,
            hiddenComponent: item.hidden,
          }"
          @mousedown.stop="drag($event, item)"
        >
          <!-- 元素组件 -->
          <component
            :is="item.name"
            :id="item.id"
            :freeStyle="item.freeStyle"
            :freeData="item.freeData"
            :rootNodeStyle="item.rootNodeStyle"
            :style="rootTagSize(item)"
          />
          <!-- 高亮线框 -->
          <div
            :class="{
              aBorderStyle: true,
              [sameGroupClass]: ~currentGatherMembers.indexOf(item.id),
            }"
          ></div>
        </div>
        <!-- 克隆元素定义拖拽，缩放，旋转 -->
        <div
          v-if="isModule"
          :style="[
            rootTagTypography(currentObject),
            rootTagSize(currentObject),
            {
              'z-index': '9999999',
              'pointer-events': 'none',
            },
          ]"
          :class="{
            basisStyle: true,
            [currentClass]: true,
            hiddenComponent: currentObject.hidden,
          }"
        >
          <!-- 缩放节点 -->
          <div
            v-for="ite in controlPanel.options.gaugePoint || []"
            :key="ite + '_' + currentObject.id"
            :ref="ite + '_' + currentObject.id"
            :class="{
              [ite]: true,
              [zoomClass]: true,
              [cursorStyle[ite]]: true,
            }"
            style="pointer-events: auto"
            @mousedown.stop="zoom($event, currentObject, ite)"
          ></div>
          <!-- 旋转 -->
          <div
            :key="'rotatingNode_' + currentObject.id"
            :ref="'rotatingNode_' + currentObject.id"
            class="rotatingNode"
            style="pointer-events: auto"
            @mousedown.stop="rotate($event, currentObject)"
          ></div>
        </div>
      </div>
      <!-- 辅助元素 -->
      <template v-if="again_show">
        <!-- 旋转角度显示 -->
        <div
          v-if="isModule && angleShowsLocation"
          :style="{
            left: `${angleShowsLocation.x + 20}px`,
            top: `${angleShowsLocation.y}px`,
          }"
          :class="{ angleShowsLocation: true, [angleShowsView]: true }"
        >
          {{ currentObject.rootNodeStyle.transform.rotate % 360 }}°
        </div>
        <!-- 横轴对齐线 -->
        <div
          v-for="(item, index) in cross"
          :key="'cross-' + index"
          :class="{ topAlignment: true, [alignmentLineClass]: true }"
          :style="{ top: item + 'px' }"
        ></div>
        <!-- 竖轴对齐线 -->
        <div
          v-for="(item, index) in vertical"
          :key="'vertical-' + index"
          :class="{ leftAlignment: true, [alignmentLineClass]: true }"
          :style="{ left: item + 'px' }"
        ></div>
        <!-- 锁定圈 -->
        <div
          v-show="lockCoilBox"
          :class="{ [lockCoilBoxClass]: true }"
          :style="lockCoilBox"
          @mousedown.stop="gatherDrag($event)"
          @click.stop="
            () => {
              return true;
            }
          "
        ></div>
      </template>
    </div>
  </div>
</template>

<script>
import { panelName, cursorStyleArr } from '../const/paramet';
export default {
  props: {
    // 面板默认样式
    defaultFreeStyle: {
      type: Object,
      default: () => {
        return {
          width: '375px',
          height: '812px',
          background: '',
        };
      },
    },
    // 当前操作元素组件的样式
    currentClass: {
      type: String,
      default: 'currentBorder',
    },
    // 当前设置分组的组件 && 当前操作的组件的同组成员组件
    sameGroupClass: {
      type: String,
      default: 'sameGroup',
    },
    // 对齐线样式
    alignmentLineClass: {
      type: String,
      default: 'alignmentLineClass',
    },
    // 缩放节点样式
    zoomClass: {
      type: String,
      default: '',
    },
    // 旋转角度提示文本
    angleShowsView: {
      type: String,
      default: 'angleShowsView',
    },
    // 锁定圈样式
    lockCoilBoxClass: {
      type: String,
      default: 'lockCoilBoxClass',
    },
  },
  data() {
    return {
      id: panelName,
      // 主控板页面样式
      freeStyle: this.defaultFreeStyle,
      // 存放组件列表
      componentList: [],
      // 当前选中id
      currentId: '',
      // 当前选中数据
      currentObject: null,
      // 当前元素8个关键坐标点
      currentAlignmentPoint: null,
      // 当前集合
      currentGatherMembers: [],
      // 面板缩放值
      zoomValue: 1,
      // 旋转角度显示坐标位置
      angleShowsLocation: null,
      // 锁定圈
      lockCoilBox: null,
      // 操控状态
      controlBool: false,
      // 重新显示
      again_show: true,
    };
  },
  computed: {
    setShellStyle() {
      return {
        width:
          Number(this.freeStyle.width.replace(/px/, '')) * this.zoomValue +
          'px',
        height:
          Number(this.freeStyle.height.replace(/px/, '')) * this.zoomValue +
          'px',
      };
    },
    // 是个模块组件
    isModule() {
      // 当前有选中并且选中的不是面板而是模块组件
      return this.currentObject && this.currentObject.id !== this.id;
    },
    // 计算横轴对齐坐标
    cross() {
      let { alignmentPoint } = this.controlPanel.freeTransit;
      if (this.currentAlignmentPoint && alignmentPoint) {
        return this.currentAlignmentPoint.y.filter((v) => {
          return ~alignmentPoint.y.indexOf(v);
        });
      } else {
        return [];
      }
    },
    // 计算纵轴对齐坐标
    vertical() {
      let { alignmentPoint } = this.controlPanel.freeTransit;
      if (this.currentAlignmentPoint && alignmentPoint) {
        return this.currentAlignmentPoint.x.filter((v) => {
          return ~alignmentPoint.x.indexOf(v);
        });
      } else {
        return [];
      }
    },
    // 动态定义拉伸光标显示样式
    cursorStyle() {
      let num =
        this.currentObject && this.currentObject.rootNodeStyle
          ? Math.floor(
              ((this.currentObject.rootNodeStyle.transform.rotate + 23) % 360) /
                45
            )
          : 0;

      return {
        topBorder: this.countResize(num, 0),
        topRightAngle: this.countResize(num, 1),
        rightBorder: this.countResize(num, 2),
        bottomRightAngle: this.countResize(num, 3),
        bottomBorder: this.countResize(num, 0),
        bottomLeftAngle: this.countResize(num, 1),
        leftBorder: this.countResize(num, 2),
        topLeftAngle: this.countResize(num, 3),
      };
    },
  },
  created() {
    // 监听切换当前选中操作的组件
    this.controlPanel.listeningCurrentSwitch(({ currentObject }) => {
      this.currentObject = currentObject;
      this.currentId = currentObject ? currentObject.id : '';
    });
    // 监听缩放比例
    this.controlPanel.listeningZoomChange((zoomValue) => {
      this.zoomValue = zoomValue;
    });
  },
  beforeDestroy() {
    // 面板注销时重置容器数据
    this.controlPanel.resetFreePanel();
  },
  methods: {
    // 根标签样式
    rootTagTypography(item) {
      return {
        position: item.rootNodeStyle.position,
        zIndex: item.rootNodeStyle.zIndex,
        top: item.rootNodeStyle.top,
        left: item.rootNodeStyle.left,
        transform: `rotate(${item.rootNodeStyle.transform.rotate}deg)`,
      };
    },
    // 根标签尺寸
    rootTagSize(item) {
      return {
        width: item.rootNodeStyle.width,
        height: item.rootNodeStyle.height,
      };
    },
    // 设置当前操作元素组件
    setCurrentControl(id) {
      this.controlPanel.setCurrentControl(id);
    },
    // 计算对应光标
    countResize(num, index) {
      return cursorStyleArr[(num + index) % 4];
    },
    // 画锁定框
    lockCoil(e) {
      this.controlPanel.coilBox(e);
    },
    // 旋转指令
    rotate(e, item) {
      this.controlPanel.rotateDoc(e, { ...item });
    },
    // 缩放指令
    zoom(e, item, type) {
      this.controlPanel.zoomWideHigh(e, { type, ...item });
    },
    // 拖拽指令
    drag(e, item) {
      this.controlPanel.dragDropMove(e, { ...item });
    },
    // 集合拖拽
    gatherDrag(e) {
      this.controlPanel.gatherDragDrop(e);
    },
    // 选中面板
    selectPanel() {
      if (this.controlBool) {
        this.controlBool = false;
      } else {
        this.controlPanel.closeCoilBox();
      }
    },
  },
};
</script>

<style lang="scss" scope>
@import './style.scss';
</style>
