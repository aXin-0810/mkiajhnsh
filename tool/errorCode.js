export default {
  // 缺少操作组件id，或者错入id
  lackOfId: JSON.stringify({
    code: 1001,
    msg: 'id错误或者缺少操作组件id',
  }),

  //修改参数超出修范围
  modifyBeyond: JSON.stringify({
    code: 1002,
    msg: '修改参数超出修范围请检查修改属性',
  }),

  //事件类型超出绑定范围
  eventModifyBeyond: JSON.stringify({
    code: 1003,
    msg: '事件类型超出绑定范围',
  }),

  //同组件函数名必须唯一
  functionNameError: JSON.stringify({
    code: 1004,
    msg: '同组件函数名必须唯一',
  }),

  //函数须以字符类型入参
  eventError: JSON.stringify({
    code: 1005,
    msg: '函数须以字符类型入参',
  }),

  //缩放参数必须为大于0的数字
  zoomModifyBeyond: JSON.stringify({
    code: 1006,
    msg: '缩放参数必须为大于0的数字',
  }),
};
