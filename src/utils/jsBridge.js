import { ZConfirm } from '@/plugins/dialog/index';
import { logger } from '@/plugins/logger';
import useStore from '@/stores/index';
import axios from 'axios';

export const call = async (...params) => {
  logger.writeAndSend('jsBridge call', [...params][0]);
  return {};
};

export const callAsync = async (...params) => {
  logger.writeAndSend('jsBridge callAsync', [...params][0]);
  return {};
};

export const requestWithCache = async ({ url, method = 'GET', params = {}, data = {} }) => {
  return await axios.request({ url, method, params, data });
};

export const request = async ({ url, method = 'GET', params = {}, defaultValue = {} }) => {
  return { data: defaultValue };
};

export const confirm = async ({ title, desc, leftButtonText, rightButtonText, useNew }) => {
  const buttonIndex = await ZConfirm({
    title,
    subTitle: desc,
    leftText: leftButtonText,
    mainText: rightButtonText,
  });
  return !!buttonIndex;
};


export const emitInited = () => {
  window.onEventTrigger('start');
};

export const closeWebview = async () => {
};

function setWebappEnd() {
  const store = useStore();
  store.isWebappEnd = true;
}

export const emitClose = async () => {
};
export const emitChapterFinish = async () => {
};
export const emitFinish = async () => {
};
export const emitComplete = async () => {
};
export const emitEnd = async () => {
};

export const emitStartRecord = async () => {
};

export const emitStopRecord = async () => {
  console.log('客户端停止录音');
};

export const pauseRecordAudio = () => {
};

export const resumeRecordAudio = () => {
};

export const fileIdToBase64String = async fileId => {
};

export const getRemoteUrl = async localPath => {
};

export const uploadFileByString = async string => {
};

export const addCoinAnimationForRecord = async coinNum => {
};
