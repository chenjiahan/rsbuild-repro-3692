export const initCanvas = (
  canvas,
  width = document.documentElement.clientWidth,
  height = document.documentElement.clientHeight
) => {
  canvas.width = width;
  canvas.height = height;
  return canvas;
};
export const getCtx = (canvas, config = { willReadFrequently: true }) => {
  return canvas.getContext('2d', config);
};
