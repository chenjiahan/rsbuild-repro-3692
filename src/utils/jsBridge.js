import { ZConfirm } from '@/plugins/dialog/index';
import { logger } from '@/plugins/logger';
import useStore from '@/stores/index';
import { sleep, ua } from '@/utils/index';
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
  logger.writeAndSend('webapp_emit_close');
  await call('emit', 'close');
  setWebappEnd();
};
export const emitChapterFinish = async () => {
  logger.writeAndSend('webapp_emit_chapter_finished');
  await call('emit', 'chapterFinished');
};
export const emitFinish = async () => {
  logger.writeAndSend('webapp_emit_finished');
  await call('emit', 'finished');
  setWebappEnd();
};
export const emitComplete = async () => {
  logger.writeAndSend('webapp_emit_complete');
  await call('emit', 'complete');
  setWebappEnd();
};
export const emitEnd = async () => {
  logger.writeAndSend('webapp_emit_end');
  ua.isIOS && (await sleep(100)); // ios端需要延迟一段时间，webview回收导致jsBridge调用失败
  await call('emit', 'end');
  setWebappEnd();
};

export const emitStartRecord = async () => {
  console.log('客户端开始录音');
  return callAsync('startRecord');
};

export const emitStopRecord = async () => {
  if (ua.isMathWebapp) {
    logger.writeAndSend('stop_record');
    try {
      const res = await callAsync('stopRecord');
      const { fileId, duration } = res;
      if (fileId && duration) {
        logger.writeAndSend('stop_record_success', {
          res,
          timeConsumed: duration,
        });
        return {
          url: fileId,
          duration: Math.round(duration / 1000),
          localPath: fileId,
        };
      } else {
        throw new Error(JSON.stringify(res));
      }
    } catch (error) {
      logger.writeAndSend('stop_record_error', { error });
      throw error;
    }
  }
  console.log('客户端停止录音');
  return {
    localPath: 'https://img-pub-test.oss-cn-beijing.aliyuncs.com/1684f62dc0be70c.mp3',
    duration: 3,
    remoteUrl: 'https://img-pub-test.oss-cn-beijing.aliyuncs.com/1684f62dc0be70c.mp3',
  };
};

export const pauseRecordAudio = () => {
  callAsync('pauseRecord');
};

export const resumeRecordAudio = () => {
  callAsync('resumeRecord');
};

export const fileIdToBase64String = async fileId => {
  if (ua.isMathWebapp) {
    logger.writeAndSend('file_id_to_base64_string');
    try {
      const res = await call('fileIdToBase64String', fileId);
      logger.writeAndSend('file_id_to_base64_string_success');
      return `data:audio/wav;base64,${res}`;
    } catch (error) {
      logger.writeAndSend('file_id_to_base64_string_error', {
        error,
      });
      throw new Error(error);
    }
  } else {
    return fileId;
  }
};

export const getRemoteUrl = async localPath => {
  if (ua.isMathWebapp) {
    const time = Date.now();
    logger.writeAndSend('upload_file', localPath);
    try {
      const res = await callAsync('uploadFile', localPath, false);
      const { remoteUrl, url, error } = res;
      const result = remoteUrl || url;
      if (!result || error) {
        throw new Error(error || 'no_remote_url');
      }
      logger.writeAndSend('upload_file_success', {
        ...res,
        timeConsumed: new Date().getTime() - time,
      });
      return result;
    } catch (error) {
      logger.writeAndSend('upload_file_error', {
        error,
        timeConsumed: new Date().getTime() - time,
      });
      throw new Error(error);
    }
  }
  console.log('客户端开始上传', localPath);
  return 'https://img-pub-test.oss-cn-beijing.aliyuncs.com/1684f62dc0be70c.mp3';
};

export const uploadFileByString = async string => {
  if (ua.isMathWebapp) {
    logger.writeAndSend('upload_file_by_string');
    try {
      const res = await callAsync('uploadFileByString', string);
      const { remoteUrl, error } = res;
      if (!remoteUrl || error) {
        throw new Error(error || 'no_remote_url');
      }
      logger.writeAndSend('upload_file_by_string_success');
      return remoteUrl;
    } catch (error) {
      logger.writeAndSend('upload_file_by_string_error', {
        error,
      });
      throw new Error(error);
    }
  }
  console.log('上传操作轨迹');
  return 'https://conan-test.fbcontent.cn/conan-english/17455125/C37A2A4D-554E-45F0-A78E-802CFEC0AC19-1612346388280.txt';
};

export const addCoinAnimationForRecord = async coinNum => {
  try {
    logger.writeAndSend('add_coin');
    await callAsync('addCoinForRecord', coinNum);
    logger.writeAndSend('add_coin_success');
  } catch (error) {
    logger.writeAndSend('add_coin_error');
    return {};
  }
};
