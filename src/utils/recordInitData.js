import { preprocess } from '@/utils/recordAdaptation';
import { getShapeList } from '@/utils/initData';

const TYPE_COLLIDE = 'collide-item';
const TYPE_OPTION = 'option-item';
const TYPE_CURTAIN = 'curtain-item';
const TYPE_ANIMATION = 'animation-item';

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
  const collideData = preprocess(collides, TYPE_COLLIDE, pattern);
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

export { getPosInfo };
