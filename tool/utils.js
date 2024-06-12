/**
 * @description 生成uuid
 */
export function uuidv1(len, radix) {
  var CHARS =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [],
    i;
  radix = radix || CHARS.length;
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = CHARS[0 | (Math.random() * radix)];
  } else {
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 32; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = CHARS[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}

/**
 * @description 对象赋值
 * @param data 原数据
 * @param modality 拷贝方法类型
 */
export function assignment(data, modality = 'json') {
  if (modality == 'json') {
    return JSON.parse(JSON.stringify(data));
  } else if (modality == 'deep') {
    return deepClone(data);
  }
}

/**
 * @description 对象深拷贝
 * @param data 原数据
 */
export function deepClone(data) {
  const type = judgeType(data);
  let obj = null;
  if (type == 'array') {
    obj = [];
    for (let i = 0; i < data.length; i++) {
      obj.push(deepClone(data[i]));
    }
  } else if (type == 'object') {
    obj = {};
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        obj[key] = deepClone(data[key]);
      }
    }
  } else {
    return data;
  }
  return obj;
}

/**
 * @description 判断数据类型并且做出返回
 * @param obj 数据
 */
export function judgeType(obj) {
  // tostring会返回对应不同的标签的构造函数
  const toString = Object.prototype.toString;
  const map = {
    '[object Function]': 'function',
    '[object Object]': 'object',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
  };
  if (obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
}

/**
 * @description 字符串转换方法
 * @param {*} fn 函数字符串
 */
export function evil(fn) {
  var Fn = Function;
  return new Fn('return ' + fn)();
}

/**
 * @description px数据转换为数字值
 * @param val 需要去除px转换的数值
 */
export function PX_ValueConversion(val) {
  return Number(val.replace(/px/, '').replace(/%/, ''));
}

/**
 * @description 比较版本大小
 * @param {string} v1
 * @param {string} v2
 * @returns bool 1>2/true 1<2/false
 */
export function compareVersions(v1, v2) {
  function filterf(str) {
    if (~['~', '^'].indexOf(str[0])) {
      return str.substr(1);
    }
    return str;
  }
  let vl1 = filterf(v1).split('.');
  let vl2 = filterf(v2).split('.');
  let length = vl1.length <= vl2.length ? vl1.length : vl2.length;
  for (var i = 0; i < length; i++) {
    if (Number(vl1[i]) > Number(vl2[i])) {
      return true;
    } else if (Number(vl1[i]) < Number(vl2[i])) {
      return false;
    }
  }
  return vl1.length >= vl2.length ? true : false;
}

/**
 * @description 已知中心点/任一点，计算两点之间求夹角
 * @param {*} px 中心点x
 * @param {*} py 中心点y
 * @param {*} mx 移动点x
 * @param {*} my 移动点y
 * @returns number夹角度数
 */
export function getAngle(px, py, mx, my) {
  var x = Math.abs(px - mx);
  var y = Math.abs(py - my);
  var z = pythagoreanBevelEdge(x, y);
  var cos = y / z;
  //用反三角函数求弧度
  var radina = Math.acos(cos);
  //将弧度转换成角度
  var angle = Math.floor(180 / (Math.PI / radina));
  //鼠标在第四象限
  if (mx > px && my > py) {
    angle = 180 - angle;
  }
  //鼠标在y轴负方向上
  else if (mx == px && my > py) {
    angle = 180;
  }
  //鼠标在x轴正方向上
  else if (mx > px && my == py) {
    angle = 90;
  }
  //鼠标在第三象限
  else if (mx < px && my > py) {
    angle = 180 + angle;
  }
  //鼠标在x轴负方向
  else if (mx < px && my == py) {
    angle = 270;
  }
  //鼠标在第二象限
  else if (mx < px && my < py) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * @description 已知三个点坐标求夹角
 * @param {*} A 需要求的夹角点坐标
 * @param {*} B 条件点坐标1
 * @param {*} C 条件点坐标2
 * @returns
 */
export function threeAngles(A, B, C) {
  let AB = Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
  let AC = Math.sqrt(Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2));
  let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  let cosA =
    (Math.pow(AB, 2) + Math.pow(AC, 2) - Math.pow(BC, 2)) / (2 * AB * AC);
  return (Math.acos(cosA) * 180) / Math.PI;
}

/**
 * @description 已知中心点/半径/角度，计算圆周上点坐标
 * @param {*} x 中心点x
 * @param {*} y 中心点y
 * @param {*} radius 半径
 * @param {*} angle 角度
 */
export function calculationPoint(x, y, radius, angle) {
  return {
    x: x + radius * Math.cos((angle * Math.PI) / 180),
    y: y + radius * Math.sin((angle * Math.PI) / 180),
  };
}

/**
 * 已知两点坐标求距离
 * @param {*} point1
 * @param {*} point2
 */
export function getHypotenuse(point1, point2) {
  return Math.sqrt(
    Math.pow(Math.abs(point1.x - point2.x), 2) +
    Math.pow(Math.abs(point1.y - point2.y), 2)
  );
}

/**
 * @description 已知两直角边边长，计算斜边边长
 * @param {*} squareEdge1 直角边1
 * @param {*} squareEdge2 直角边2
 */
export function pythagoreanBevelEdge(squareEdge1, squareEdge2) {
  return Math.sqrt(Math.pow(squareEdge1, 2) + Math.pow(squareEdge2, 2));
}

/**
 * @description 已知一个直角边边长/斜边边长，计算夹角
 * @param {*} squareEdge 直角边
 * @param {*} hypotenuse 斜边
 */
export function bevelEdgeAngle(squareEdge, hypotenuse) {
  return (Math.asin(squareEdge / hypotenuse) * 180) / Math.PI;
}

/**
 * @description 获取直角边
 * @param {*} long 斜边长度
 * @param {*} angle 夹角
 * @returns
 */
export function getSquareEdge(long, angle) {
  //获得弧度
  var radian = ((2 * Math.PI) / 360) * angle;
  return {
    adjacentSide: Math.sin(radian) * long, //邻边
    oppositeSide: Math.cos(radian) * long, //对边
  };
}

// 动态加载js
export function loadScript(id, url, callback) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = id;
    if (script.readyState) {
      //IE
      script.onreadystatechange = function () {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null;
          callback && callback();
          document.getElementById(id).remove();
          resolve();
        }
      };
    } else {
      //Others
      script.onload = function () {
        callback && callback();
        document.getElementById(id).remove();
        resolve();
      };
      script.onerror = function (e) {
        reject(e);
      };
    }
    script.src = url;
    document.getElementsByTagName('body')[0].appendChild(script);
  });
}