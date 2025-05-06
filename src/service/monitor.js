import request from './request'

export function getSystemMetrics() {
  return request({
    url: '/metrics',
    method: 'get'
  })
} 