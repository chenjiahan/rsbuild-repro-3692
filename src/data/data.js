import { checkIOSVersion, isHD, isIpad } from '@/utils/os';
import uaUtil from '@/utils/ua';

export const NEXT_STEP_STATUS = {
  NORMAL: 0,
  DELAY_START: 1,
  ADD_COIN_START: 2,
  FEEDBACK_START: 3,
};

// ms计量
export const FRAME_RATE = 50;
export const PASS_DELAY_DURATION = 1000;
export const REQUEST_TIMEOUT = uaUtil.isIOS() ? 20000 : 35000;
export const TOUCHEND_WRONG_START_SHAKE_TIME = 300;
export const SHAKE_DURATION = 500;
export const WRONG_RESET_TIME = 1000;

// 客户端addCoin模式
export const ADD_COIN_MODE = {
  SHOW_STAR: 0,
  HIDE_STAR: 1,
  WITHOUT_COIN: 2, // 没有斑马币，有动画
  ONLY_AUDIO: 3, // 仅仅播放音频，没有斑马币，没有动画
  I18N_HIGH_LEVEL_WITHOUT_COIN: 4, // 海外高级别，没有斑马币，有动画，动画播放较快
};

// 所有page的report上传状态
export const UPLOAD_REPORT_STATUS = {
  FAIL: -1,
  LOADING: 1,
  NORMAL: 0,
};

export const ChapterTypeMap = {
  Quiz: 1,
  Game: 2,
  Record: 5,
  Report: 4,
  NewRecord: 11,
  MistakeCollection: 6,
  Quiz_V2: 8,
  DailyCalculation: 203,
  Encyclopedia: 10001,
  FeaturedCourse: 201,
};

export const ChapterContentType = {
  Webapp: 2,
  MathChapterContentTypeEndVideo: 4,
  AiResource: 18,
};

export const APNGPlayState = {
  Playing: 1,
  Paused: 0,
  Initial: -1,
};

// iOS 不小于 15，在 iPad 上安装 iOS 版本 App
export const IOS_GT15_IPAD_NOT_HD = isIpad && !isHD && !checkIOSVersion(15);


// 滑动生效距离
export const TouchMoveDistance = 80;

export const VOICE_STATUS = {
  UPLOAD_ERROR: -1,
  UPLOADING: 2,
  NORMAL: 0,
  HIDE: 3,
  UPLOADING_DONE: 4,
};

export const RECORD_STATUS = {
  IS_RECORDING: 1,
  NORMAL_AS_OLD: -1,
  NORMAL_AS_NEW: 2,
  WARNING_TAP: 0,
  WAIT_SUBMIT: 3,
};

export const ViewMode = {
  Normal: '0', // 常规模式
  Preview: '1', // 预览，不可交互
  Retry: '2', // 重做
  Exercise: '3', // 单道题，可交互
  LittleTeacher: '4', // ai 小老师使用
};

