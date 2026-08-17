const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化日期为年-月-日格式
const formatDate = date => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${year}年${month}月${day}日`;
}

// 正则表达式验证规则
const regex = {
  // 数字（整数）
  integer: /^\d*$/,
  // 数字（可带小数点）
  number: /^\d*\.?\d*$/,
  // 正整数
  positiveInteger: /^[1-9]\d*$/,
  // 非负浮点数
  nonNegativeNumber: /^\d*\.?\d*$/
};

module.exports = {
  formatTime,
  formatDate,
  regex
}
