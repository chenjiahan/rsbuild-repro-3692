import { preprocess } from '@/utils/adaptation';

const TYPE_COLIDE = 'collide-item';
const TYPE_OPTION = 'option-item';
const TYPE_CURTAIN = 'curtain-item';
const TYPE_ANIMATION = 'animation-item';
const SHAPE_CIRCLE = 'circle';
const SHAPE_RECT = 'rect';

const getPosInfo = (
  collides = [],
  options = [],
  finals = [],
  pattern = '',
  curtains = [],
  animations = [],
  curtainFinals = []
) => {
  // 经过适配预处理的Object数组
  const collideData = preprocess(collides, TYPE_COLIDE, pattern);
  const optionData = preprocess(options, TYPE_OPTION, pattern);
  const curtainData = preprocess(curtains, TYPE_CURTAIN, pattern);
  const animationsData = preprocess(animations, TYPE_ANIMATION, pattern);
  // NOTE: finals可能为一维数组或二维数组
  const finalPos = preprocess(finals.flat(), null, pattern).allPosInfo;
  const curtainFinalPos = preprocess(curtainFinals.flat(), null, pattern).allPosInfo;
  return {
    curtainPos: getShapeList(curtainData.allPosInfo),
    originPos: getShapeList(optionData.allPosInfo),
    collidePos: getShapeList(collideData.allPosInfo),
    animationsPos: getShapeList(animationsData.allPosInfo),
    cssStr: collideData.cssStr + optionData.cssStr + curtainData.cssStr + animationsData.cssStr,
    finalPos,
    curtainFinalPos,
  };
};

const getScenesPosInfo = (pattern = '', scenes = []) => {
  // scene题型适配
  const scenesInfo = [];
  scenes.forEach((scene, sceneIndex) => {
    const collides = scene.collides || [];
    const options = scene.options || [];
    const final = scene.finals || [];
    const curtains = scene.curtains || [];
    const curtainFinals = scene.curtainFinals || [];
    const nextBtn = scene['others']
      ? scene['others']['nextBtn']
        ? new Array(1).fill(scene['others']['nextBtn'])
        : []
      : [];
    const collideData = preprocess(collides, `scene${sceneIndex}-collide-item`, pattern);
    const curtainData = preprocess(curtains, `scene${sceneIndex}-curtain-item`, pattern);
    const optionData = preprocess(options, `scene${sceneIndex}-option-item`, pattern);
    const btnData = preprocess(nextBtn, `scene${sceneIndex}-btn-next-item`, pattern);
    // NOTE: finals可能为一维或者二位数组
    const finalPos = preprocess(final.flat(), null, pattern).allPosInfo;
    const curtainFinalPos = preprocess(curtainFinals.flat(), null, pattern).allPosInfo;
    const sceneInfo = Object.assign(
      {},
      {
        originPos: getShapeList(optionData.allPosInfo),
        collidePos: getShapeList(collideData.allPosInfo),
        curtainPos: getShapeList(curtainData.allPosInfo),
        cssStr: collideData.cssStr + optionData.cssStr + curtainData.cssStr + btnData.cssStr,
        finalPos,
        curtainFinalPos,
      }
    );
    scenesInfo.push(sceneInfo);
  });
  return scenesInfo;
};

const insertCss = cssStr => {
  // 删除旧的style
  const parent = document.getElementsByTagName('head').item(0);
  const oldStyle = document.getElementById('J_json_style');
  oldStyle && parent.removeChild(oldStyle);

  // 添加新的style
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = cssStr;
  style.setAttribute('id', 'J_json_style');
  parent.appendChild(style);
};
const getShapeList = poses => {
  return poses.map(pos => {
    switch (pos.shape) {
      case SHAPE_CIRCLE:
        return {
          index: pos.index,
          x: pos.x,
          y: pos.y,
          r: pos.width / 2,
          angle: 0,
          axis: pos.axis || '',
        };
      case SHAPE_RECT:
        return {
          index: pos.index,
          x: pos.x,
          y: pos.y,
          w: pos.width,
          h: pos.height,
          draftX: pos.draftX,
          draftY: pos.draftY,
          draftW: pos.draftWidth,
          draftH: pos.draftHeight,
          angle: 0,
          axis: pos.axis || '',
        };
      default:
        return pos;
    }
  });
};

const getArrDepth = array => {
  function sum(arr, flag) {
    return arr.reduce((total, item) => {
      var totalDepth;
      if (Array.isArray(item)) {
        totalDepth = sum(item, flag + 1);
      }
      return totalDepth > total ? totalDepth : total;
    }, flag);
  }
  return sum(array, 1);
};

export { insertCss, getPosInfo, getScenesPosInfo, getShapeList, getArrDepth };
