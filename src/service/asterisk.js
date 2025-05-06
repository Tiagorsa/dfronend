import request from './request';

export function makeCall(data) {
  return request({
    url: '/asterisk/calls',
    method: 'post',
    data
  });
}

export function getActiveCalls(params) {
  return request({
    url: '/asterisk/calls',
    method: 'get',
    params
  });
} 