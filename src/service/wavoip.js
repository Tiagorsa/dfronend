import request from 'src/service/request';

export function loginAndFetchCalls(data) {
  return request({
    url: '/auth/login-and-fetch-calls',
    method: 'post',
    data,
  });
}

export function fetchCalls() {
  return request({
    url: '/fetch-calls',
    method: 'post',
  });
}

export function fetchDevices() {
  return request({
    url: '/fetch-devices',
    method: 'post',
  });
}

export function resetWavoip() {
  return request({
    url: '/reset-wavoip',
    method: 'post',
  });
}

