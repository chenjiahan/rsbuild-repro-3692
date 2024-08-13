import uaUtil from './ua';
import queryUtil from './query';

export const ua = uaUtil.parse();

export const query = queryUtil.parse();

export function serializeObj(obj) {
  const allProps = {};
  // 获取对象上的所有自有属性，包括不可枚举的
  Object.getOwnPropertyNames(obj).forEach(propName => {
    allProps[propName] = obj[propName];
  });

  // 使用一个自定义 replacer 来确保能序列化包含循环引用的对象
  const cache = new WeakSet();
  const replacer = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // 忽略重复的或循环引用的对象
        return;
      }
      cache.add(value);
    }
    return value;
  };

  return JSON.stringify(allProps, replacer);
}

export const sleep = timeout => {
  return new Promise(resolve => {
    let tmp = setTimeout(() => {
      clearTimeout(tmp);
      resolve();
    }, timeout);
  });
};

// 创建一个指定宽高颜色的图片
export const createCanvasImage = (width, height, color = '#fff') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  return canvas;
};

export const createImage = (src, width, height, color = '#fff') => {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = '';
    img.src = src;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = e => {
      console.log('load_image_error', serializeObj(e), { src });
      resolve(createCanvasImage(width, height, color));
    };
  });
};


export function getHintFromResourcesByIndexNum(resources, indexNum) {
  let step = indexNum;
  while (!resources[`hint${step}`] && step >= 1) {
    step--;
  }
  return resources[`hint${step}`];
}
