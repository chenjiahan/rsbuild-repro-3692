export const isDev =
  /^test-m\.|^conan-test|^[0-9a-zA-Z]+-test\.|^local\.|\.ws$|\.biz$/.test(
    location.hostname,
  );

// 默认的spine mix
export const DEFAULT_SPINE_MIX = 0.5;

export const enum MouthSkinEnum {
  Talk = 'talk',
  ShutUp = 'shut-up',
}
export const enum AnimationType {
  Action = 'action',
  Mouth = 'mouth',
}

export const enum MouthAnimationEnum {
  OpenMouth = 'open-mouth',
  CloseMouth = 'close-mouth',
}

export const MouthAnimation2SkinName = {
  [MouthAnimationEnum.OpenMouth]: MouthSkinEnum.Talk,
  [MouthAnimationEnum.CloseMouth]: MouthSkinEnum.ShutUp,
};
