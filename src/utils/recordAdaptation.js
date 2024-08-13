/**
 * 对获取的JSON对象进行预处理
 * @return {
 *    { Array<{x, y, w, h}> } allPosInfo (对垂直方向上的位置根据设备高度进行处理)
 *    { String } cssStr (生成对应css字符串)
 *  }
 */
export const preprocess = (position, classPrefix = '') => {
  // 录制回放，兼容不同容器的尺寸
  const $recordReplay = document.getElementById('game-wrap-inner');
  const width =
    ($recordReplay && $recordReplay.offsetWidth) || document.documentElement.clientWidth;
  // 保持元素与背景图垂直相对位置一致
  let allPosInfo = [];
  let cssStr = '';
  // 我是小老师的基准 872 * 654
  const Benchmark = {
    width: 872,
    height: 654,
  };
  position.forEach(posInfo => {
    let styleStr = '';
    let posItem = {};
    Object.keys(posInfo).forEach(key => {
      let val = posInfo[key];
      switch (key) {
        case 'width':
          posItem[key] = Math.round((val * width) / Benchmark.width);
          styleStr += `${key}: ${Math.round(posItem[key])}px;`;
          break;
        case 'height':
          posItem[key] = Math.round((val * width) / Benchmark.width);
          styleStr += `${key}: ${Math.round(posItem[key])}px;`;
          break;
        case 'x':
          posItem[key] = Math.round((val * width) / Benchmark.width);
          styleStr += `left: ${Math.round(posItem[key])}px;`;
          break;
        case 'y':
          posItem[key] = Math.round((val * width) / Benchmark.width);
          styleStr += `top: ${Math.round(posItem[key])}px;`;
          break;
        default:
          posItem[key] = val;
          break;
      }
    });
    allPosInfo.push(posItem);
    !!classPrefix && (cssStr += `.${classPrefix}${posInfo.index || 0}{ ${styleStr} }`);
  });
  return { allPosInfo, cssStr };
};
