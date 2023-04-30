import * as GlobalPopupHelper from "./globalPopup.helper";
export {
  GlobalPopupHelper,
};
export const buildEndUrl = (stringQuery: any) => {
  if (stringQuery === void 0) return '';

  const params: any = [];

  if (typeof stringQuery !== 'object') return '';
  for (let key in stringQuery) {
    let value = (stringQuery[key] !== undefined && stringQuery[key] !== null) ? stringQuery[key] : '';
    params.push({'key': key, 'value': value})
  }

  if (params.length > 0) {
    return '?' + params.map(({key, value}) => `${key}=${value}`).join('&');
  }
  return '';
};
