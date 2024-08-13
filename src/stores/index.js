import { NEXT_STEP_STATUS, UPLOAD_REPORT_STATUS, ViewMode } from '@/data/data';
import { defineStore } from 'pinia';

const useStore = defineStore('main', {
  state: () => ({
    isWebappStart: false,
    isWebappActive: false,
    isWebappEnd: false,
    isLastWebapp: true,
    isGameEnd: false,
    isLastStep: false,
    pageInited: false,
    disableAllEvent: false,
    isUserTouching: false, // 基础点击题选项是否点击中, 基础拖拽题拖拽物是否拖拽中
    isHintPlaying: false,
    firstTimeHintPlayingDone: false,
    disablePlayHint: false, //是否禁止播放读题语音
    isClickHintButton: false,
    isHintPlayingDone: false,
    disabledInfoAction: false, // 禁止信息提示操作 返回按钮 + 点击音频

    viewMode: ViewMode.Normal,

    chapterStartTime: 0, // 用户开始章节时间
    firstQuestionLoadedTime: 0, // 第一题加载时间
    chapterFinishedTime: 0, // 用户作答结束时间
    chapterCompletedTime: 0, // 用户完成章节时间，为用户作答结束时间+上传报告

    reportUploadStatus: UPLOAD_REPORT_STATUS.NORMAL,
    nextStepStatus: NEXT_STEP_STATUS.NORMAL,

    questionText: '', // 某些老题型会设置innerText
    wrongQuestionAnalysis: '', // 某些单步多场景题型会设置analysisImageId
    wrongTimes: 0,
    questionStartTime: 0,
    sceneStepInfo: {}, // 场景步骤信息
  }),
  getters: {
    isRetryMode: state => {
      return state.viewMode === ViewMode.Retry;
    },
    isPreviewMode: state => {
      return state.viewMode === ViewMode.Preview;
    },
    isLittleTeacherMode: state => {
      return state.viewMode === ViewMode.LittleTeacher;
    },
  },
});
export default useStore;
