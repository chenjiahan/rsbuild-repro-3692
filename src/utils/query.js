/**
 * 查询参数工具函数
 */

const queryUtil = {
  parse(search = window.location.search) {
    const query = {};
    if (search) {
      search = search.trim().replace(/^\?/, '');
      search.split('&').forEach(param => {
        const parts = param.split('=');
        query[parts[0]] = parts[1] ? decodeURIComponent(parts[1]) : null;
      });
    }
    return query;
  },

  toSearch(query) {
    return Object.keys(query)
      .map(key => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(query[key]);
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');
  },
};

export default queryUtil;
