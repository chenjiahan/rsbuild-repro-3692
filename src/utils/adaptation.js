import { checkIsLtIOS12 } from '@/utils/os';

/**
 * 对获取的JSON对象进行预处理
 * @return {
 *    { Array<{x, y, w, h}> } allPosInfo (对垂直方向上的位置根据设备高度进行处理)
 *    { String } cssStr (生成对应css字符串)
 *  }
 */
export const preprocess = (position, classPrefix = '', pattern = '') => {
  const isLtIOS12 = checkIsLtIOS12();
  // 稿子按照iphoneX
  const iphoneX = {
    w: 812 * 3,
    h: 375 * 3,
    rem: 100,
  };
  // 录制回放，兼容不同容器的尺寸 by zhaiwanli
  const $recordReplay = document.getElementById('game-wrap-inner');
  const width =
    ($recordReplay && $recordReplay.offsetWidth) || document.documentElement.clientWidth;
  const height =
    ($recordReplay && $recordReplay.offsetHeight) || document.documentElement.clientHeight;
  const other = {
    w: width,
    h: height,
    rem: width / 24.36,
  };
  // 保持元素与背景图垂直相对位置一致
  let offsetX = 0,
    offsetY = (height - (width * iphoneX.h) / iphoneX.w) / 2;
  let phaserOffsetX = 0,
    phaserOffsetY = ((1624 * height) / width - 750) / 2;
  let allPosInfo = [];
  let cssStr = '';
  position.map(posInfo => {
    let styleStr = '';
    let posItem = {};
    Object.keys(posInfo).forEach(key => {
      let val = posInfo[key];
      switch (key) {
        // // 两个辅助布局的属性
        // case 'horizontalCenter':
        //   posItem.x = (other.w - posInfo.width) / 2;
        //   break;
        // case 'verticalCenter':
        //   posItem.y = (other.h - posInfo.height) / 2;
        //   break;
        case 'width':
        case 'draftWidth':
          if (pattern.includes('phaser') && !isLtIOS12) {
            posItem[key] = Math.round(val);
          } else {
            posItem[key] = Math.round(((val * 1.5) / iphoneX.rem) * other.rem);
            key !== 'draftWidth' && (styleStr += `${key}: ${Math.round(posItem[key])}px;`);
          }
          break;
        case 'height':
        case 'draftHeight':
          if (pattern.includes('phaser') && !isLtIOS12) {
            posItem[key] = Math.round(val);
          } else {
            posItem[key] = Math.round(((val * 1.5) / iphoneX.rem) * other.rem);
            key !== 'draftHeight' && (styleStr += `${key}: ${Math.round(posItem[key])}px;`);
          }
          break;
        case 'x':
        case 'draftX':
          if (pattern.includes('phaser')) {
            posItem[key] = Math.round(
              isLtIOS12
                ? ((val * 1.5) / iphoneX.rem) * other.rem +
                    offsetX +
                    (((posInfo.width * 1.5) / iphoneX.rem) * other.rem) / 2
                : val + phaserOffsetX + posInfo.width / 2
            );
          } else {
            posItem[key] = Math.round(((val * 1.5) / iphoneX.rem) * other.rem + offsetX);
            key !== 'draftX' && (styleStr += `left: ${Math.round(posItem[key])}px;`);
          }
          break;
        case 'y':
        case 'draftY':
          if (pattern.includes('phaser')) {
            posItem[key] = Math.round(
              isLtIOS12
                ? ((val * 1.5) / iphoneX.rem) * other.rem +
                    offsetY +
                    (((posInfo.height * 1.5) / iphoneX.rem) * other.rem) / 2
                : val + phaserOffsetY + posInfo.height / 2
            );
          } else {
            posItem[key] = Math.round(((val * 1.5) / iphoneX.rem) * other.rem + offsetY);
            key !== 'draftY' && (styleStr += `top: ${Math.round(posItem[key])}px;`);
          }
          break;
        case 'uppperRight':
          posItem.y = Math.round((54 / iphoneX.rem) * other.rem);
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

export const standardSize = {
  width: 812 * 2,
  height: 375 * 2,
  rem: 100,
};

export const transformSize = (value = 0) =>
  (value * document.documentElement.clientWidth) / standardSize.width;

export const transformPosition = ({ x = 0, y = 0 }) => {
  // 保持元素与背景图垂直相对位置一致
  const viewWidth = document.documentElement.clientWidth;
  const viewHeight = document.documentElement.clientHeight;
  const offsetY = (viewHeight - (viewWidth * standardSize.height) / standardSize.width) / 2;
  return {
    x: (x * viewWidth) / standardSize.width,
    y: (y * viewWidth) / standardSize.width + offsetY,
  };
};
export const getScale = () => document.documentElement.clientWidth / standardSize.width;

export function transformNode(node) {
  const { x = 0, y = 0, width = 0, height = 0 } = node;
  return {
    ...node,
    ...transformPosition({ x, y }),
    width: transformSize(width),
    height: transformSize(height),
  };
}
