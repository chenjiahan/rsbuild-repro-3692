import axios from 'axios';
import * as jsBridge from '@/utils/jsBridge';
import { logger } from '@/plugins/logger';
import { ua } from '@/utils/index';
import { $t } from '@/mixins/i18n/index';

const newStyleAlertCondition = ua.isChinaApp || !ua.isWebapp;

const basicRequest = async ({ url, params = {}, defaultValue = {}, loggerKey, method = 'GET' }) => {
  const now = +Date.now();
  logger.writeAndSend(loggerKey, params);
  try {
    // url +=
    //   '?__zebraMask__=shield&YFD_U=1A38AD5A-C80A-4B1A-A5CC-3015959EB1FE&brand=iPhone13%2525252C2&_productId=503&av=9&version=5.17.0&_debug_user_=201928758';
    const res = await jsBridge.request({
      url,
      params,
      defaultValue,
      method,
    });

    const isGetMethod = method === 'GET';

    if (!res || res.error || !Object.keys(res).length) {
      throw new Error(res);
    } else {
      // response可能没有data的key（如：专题课查询报告），返回{ headers: {} }
      const data = isGetMethod ? res.data || defaultValue : res;
      logger.writeAndSend(`${loggerKey}_success`, {
        ...data,
        timeConsumed: +Date.now() - now,
      });
      return data;
    }
  } catch (error) {
    logger.writeAndSend(`${loggerKey}_error`, {
      url,
      error: error.message,
      timeConsumed: +Date.now() - now,
    });
    return defaultValue;
  }
};

export const getConfig = async url => {
  const now = +Date.now();
  try {
    const res = await jsBridge.requestWithCache({ url });
    if (res.error || !res.data) {
      throw new Error('get_config_by_native_request_error');
    } else {
      logger.writeAndSend('get_config_by_native_request_success', {
        timeConsumed: +Date.now() - now,
      });
      return res.data;
    }
  } catch (err) {
    logger.writeAndSend('get_config_by_native_request_error', {
      error: err.message,
      timeConsumed: +Date.now() - now,
    });
    try {
      const res = await axios.get(url + '?zebra_cache=false');
      if (res.error) {
        throw new Error('get_config_by_axios_error');
      } else {
        logger.writeAndSend('get_config_by_axios_success');
        return res.data;
      }
    } catch (error) {
      logger.writeAndSend('get_config_by_axios_error', {
        error: error.message,
      });
      return { resources: {}, content: [] };
    }
  }
};

export const confirmNetworkError = async () => {
  const res = await jsBridge.confirm({
    title: $t('toast.network_error'),
    leftButtonText: $t('confirm.cancel'),
    rightButtonText: $t('alert.exit'),
    useNew: false,
  });
  return !res;
};

export const confirmNotFinished = async (chapterName = '') => {
  const params = newStyleAlertCondition
    ? {
      title: $t('alert.reminder'),
      desc: $t('alert.incomplete_leave_or_not_wrap', { chapterName }),
      leftButtonText: $t('confirm.cancel'),
      rightButtonText: $t('alert.leave'),
      useNew: true,
    }
    : {
      title: $t('alert.incomplete_leave_or_not', { chapterName }),
      leftButtonText: $t('alert.leave'),
      rightButtonText: $t('alert.think_again'),
      useNew: false,
    };
  const res = await jsBridge.confirm(params);
  return res;
};

export const confirmRecordNotFinished = async () => {
  const params = newStyleAlertCondition
    ? {
      title: $t('alert.reminder'),
      desc: $t('alert.record_not_completed_leave_or_not_wrap'),
      leftButtonText: $t('confirm.cancel'),
      rightButtonText: $t('alert.leave'),
      useNew: true,
    }
    : {
      title: $t('alert.record_not_completed_leave_or_not'),
      leftButtonText: $t('alert.leave'),
      rightButtonText: $t('alert.think_again'),
      useNew: false,
    };
  const res = await jsBridge.confirm(params);
  return res;
};

export const confirmClosePageWhileUploading = async () => {
  const res = await jsBridge.confirm({
    title: $t('alert.data_uploading_back_or_not'),
    leftButtonText: $t('confirm.cancel'),
    rightButtonText: $t('alert.confirm'),
    useNew: false,
  });
  return !res;
};

export const confirmReUpload = async () => {
  logger.writeAndSend('retry_upload_alert');
  const res = await jsBridge.confirm({
    title: $t('alert.data_upload_fail_retry_or_not'),
    leftButtonText: $t('confirm.cancel'),
    rightButtonText: $t('alert.confirm'),
    useNew: false,
  });
  logger.writeAndSend(res ? 'retry_upload_alert_cancel' : 'retry_upload_alert_confirm');
  return !res;
};

export const confirmCheckNetwork = async () => {
  const res = await jsBridge.confirm({
    title: $t('confirm.upload_fail_check_network'),
    leftButtonText: $t('confirm.cancel'),
    rightButtonText: $t('confirm.retry'),
    useNew: false,
  });
  return !res;
};

export const confirmClosePageWhileRecordNotSubmit = async () => {
  const res = await jsBridge.confirm({
    title: $t('alert.work_not_submit_back_or_not'),
    leftButtonText: $t('alert.exit'),
    rightButtonText: $t('alert.think_again'),
    useNew: false,
  });
  return res;
};

export const confirmClosePageWhileWorkNotSubmit = async () => {
  const res = await jsBridge.confirm({
    title: $t('alert.work_not_submit_back_or_not'),
    leftButtonText: $t('alert.exit'),
    rightButtonText: $t('alert.think_again'),
    useNew: false,
  });
  return res;
};

export const getReport = async () => {
  return {};
};
