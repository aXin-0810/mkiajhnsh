'use strict';
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
exports.__esModule = true;
exports.queuePerform =
  exports.passivePerform =
  exports.intervalPerform =
  exports.firstPerform =
  exports.delayPerform =
  void 0;
var filteringUnnecessary = /** @class */ (function () {
  function filteringUnnecessary(num) {
    // 定义默认的断点时间
    this.breakpoint = 150;
    // 开关
    this['switch'] = true;
    this.setBreakpoint(num);
  }
  // 重设断点时间的方法
  filteringUnnecessary.prototype.setBreakpoint = function (num) {
    if (num) {
      this.breakpoint = num;
    }
  };
  // 置空延时
  filteringUnnecessary.prototype.emptyTimeDelay = function () {
    if (this.theTimerId) {
      clearTimeout(this.theTimerId);
      this.theTimerId = null;
    }
  };
  // 设置延时
  filteringUnnecessary.prototype.setTimeDelay = function (callback) {
    var _this = this;
    this.emptyTimeDelay();
    this.theTimerId = setTimeout(function () {
      callback && callback();
      _this.emptyTimeDelay();
    }, this.breakpoint);
  };
  // 正向断点锁(先到先得)
  filteringUnnecessary.prototype.theFirst = function () {
    var _this = this;
    this.setTimeDelay(function () {
      _this['switch'] = true;
    });
    if (this['switch']) {
      this['switch'] = false;
      return true;
    } else {
      return false;
    }
  };
  // 反向断点锁(末尾有效)
  filteringUnnecessary.prototype.theLast = function (fn) {
    this.setTimeDelay(function () {
      fn();
    });
  };
  // 间隔锁(满足时间间隔有效)
  filteringUnnecessary.prototype.thePhase = function () {
    var _this = this;
    if (this['switch']) {
      this['switch'] = false;
      this.setTimeDelay(function () {
        _this['switch'] = true;
      });
      return true;
    } else {
      return false;
    }
  };
  return filteringUnnecessary;
})();
// 乐观锁-最后放行
var delayPerform = /** @class */ (function (_super) {
  __extends(delayPerform, _super);
  function delayPerform(num) {
    return _super.call(this, num) || this;
  }
  // 重构
  delayPerform.prototype.refactor = function (fn) {
    var that = this;
    return function () {
      var _this = this;
      var paramet = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        paramet[_i] = arguments[_i];
      }
      that.theLast(function () {
        fn.apply(_this, paramet);
      });
    };
  };
  return delayPerform;
})(filteringUnnecessary);
exports.delayPerform = delayPerform;
// 乐观锁-抢先放行
var firstPerform = /** @class */ (function (_super) {
  __extends(firstPerform, _super);
  function firstPerform(num) {
    return _super.call(this, num) || this;
  }
  // 重构
  firstPerform.prototype.refactor = function (fn) {
    var that = this;
    return function () {
      var paramet = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        paramet[_i] = arguments[_i];
      }
      if (that.theFirst()) {
        fn.apply(this, paramet);
      }
    };
  };
  return firstPerform;
})(filteringUnnecessary);
exports.firstPerform = firstPerform;
// 乐观锁-间隔放行
var intervalPerform = /** @class */ (function (_super) {
  __extends(intervalPerform, _super);
  function intervalPerform(num) {
    return _super.call(this, num) || this;
  }
  // 重构
  intervalPerform.prototype.refactor = function (fn) {
    var that = this;
    return function () {
      var paramet = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        paramet[_i] = arguments[_i];
      }
      if (that.thePhase()) {
        fn.apply(this, paramet);
      }
    };
  };
  return intervalPerform;
})(filteringUnnecessary);
exports.intervalPerform = intervalPerform;
// 乐观锁-被动放行
var passivePerform = /** @class */ (function () {
  function passivePerform() {
    this['switch'] = true;
  }
  // 重构
  passivePerform.prototype.refactor = function (fn) {
    var that = this;
    return function () {
      var paramet = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        paramet[_i] = arguments[_i];
      }
      if (that['switch']) {
        that['switch'] = false;
        fn.apply(this, paramet);
      }
    };
  };
  // 解锁
  passivePerform.prototype.unlock = function () {
    this['switch'] = true;
  };
  return passivePerform;
})();
exports.passivePerform = passivePerform;
// 悲观锁-队列放行
var queuePerform = /** @class */ (function () {
  function queuePerform() {
    this['switch'] = true;
    this.environment = null;
    this.fun = null;
    this.queuePool = [];
  }
  // 执行
  queuePerform.prototype.perform = function () {
    if (
      this['switch'] &&
      this.fun &&
      this.environment &&
      this.queuePool[0] !== undefined
    ) {
      this['switch'] = false;
      this.fun.apply(this.environment, this.queuePool[0]);
    }
  };
  // 重构
  queuePerform.prototype.refactor = function (fn) {
    var that = this;
    if (!this.fun) {
      this.fun = fn;
    }
    return function () {
      var paramet = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        paramet[_i] = arguments[_i];
      }
      that.queuePool.push(paramet);
      if (!that.environment) {
        that.environment = this;
      }
      if (that['switch']) {
        that.perform();
      }
    };
  };
  // 解锁
  queuePerform.prototype.unlock = function () {
    this.queuePool.splice(0, 1);
    this['switch'] = true;
    this.perform();
  };
  // 队列解散
  queuePerform.prototype.dissolve = function () {
    this['switch'] = false;
    this.queuePool.splice(0, this.queuePool.length);
  };
  return queuePerform;
})();
exports.queuePerform = queuePerform;
