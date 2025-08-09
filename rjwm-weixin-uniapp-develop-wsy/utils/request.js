import store from './../store'
import { baseUrl } from './env'

/**
 * 通用HTTP请求函数
 * @param {Object} options - 请求配置选项
 * @param {string} options.url - 请求地址（相对路径）
 * @param {Object} options.params - 请求参数
 * @param {string} options.method - 请求方法（GET/POST/PUT/DELETE等）
 * @returns {Promise} 返回Promise对象
 */
export function request({url='', params={}, method='GET'}) {
	// 从Vuex store中获取用户认证信息
	const storeInfo = store.state
	
	// 构建请求头
	const header = {
		'Accept': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/json',
		// 用户认证token
		'authentication': storeInfo.token
	}
	
	// 创建并返回Promise对象
	const requestRes = new Promise((resolve, reject) => {
		// 设置加载状态
		store.commit('setLodding', false)
		
		// 发起网络请求
		uni.request({
			url: baseUrl + url,
			data: params,
			header: header,
			method: method,
			timeout: 10000, // 设置请求超时时间为10秒
			success: (res) => {
				const { data } = res
				// 根据响应码判断请求是否成功
				if (data.code == 200 || data.code === 1) {
					resolve(res.data)
				} else {
					// 请求失败，返回错误信息
					reject(res.data)
				}
			},
			fail: (err) => {
				// 网络请求失败处理
				const error = {data:{msg:err.errMsg || '网络请求失败'}}
				reject(error)
			},
			complete: () => {
				// 请求完成，恢复加载状态
				store.commit('setLodding', true)
			}
		})
	})
	
	return requestRes
}

