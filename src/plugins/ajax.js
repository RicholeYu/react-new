import {
    viewEvent, cookie, getURLParams
} from "@/common/util"
import {
    showLoading, hideLoading
} from "@/components/loading/index"
import { error } from "@/components/toast/index"
export const isProduction = (process.env.NODE_ENV === "production")
export const isRelease = (process.env.NODE_ENV === "release")
export const isDevelopment = (process.env.NODE_ENV === "development")

let requestArray = new Set()
let BASEURL = ""
let params = getURLParams()
let commonParams = {
    platform: "android",
    version: "1.0.0",
    channel: "test",
    ...params,
    ...cookie.getAll()
}
let autoLoading = null

if (isProduction) {
    BASEURL = window.location.protocol + "//www.madcrickets.com"
} else if (isRelease) {
    BASEURL = window.location.protocol + "//prewww.madcrickets.com"
    // BASEURL = "http://10.0.0.175:8001"
} else if (isDevelopment) {
    // BASEURL = "http://10.0.1.41:8001"
    // BASEURL = "http://10.0.0.171:8001"
    // BASEURL = "http://149.129.138.180"
    // BASEURL = "http://147.139.3.102"
    // BASEURL = "http://10.0.0.175:8001"
    BASEURL = window.location.protocol + "//10.0.0.171:8001"
}
export const URL = BASEURL
BASEURL = `${BASEURL}/api`

// 对象转get字符串
function jsonToString (data) {
    let dataArr = []
    for (let key in data) {
        dataArr.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    }
    return dataArr.join("&")
}

function formatUrl (url, data = {}, type) {
    url = `${BASEURL}${url}`
    return type === "GET" ? (`${url}${url.indexOf("?") > -1 ? "&" : "?"}${jsonToString(data)}`) : url
}

function handleHttpPromise () {
    requestArray.size > 0 ? showLoading() : hideLoading()
}

function commonHandler (res) {
    let isError = res.status !== "100"
    isError && error(res.message)
    return isError ? Promise.reject(res) : res
}
function errorHandler (err) {
    error(window._ ? window._("networkError") : "Network Error")
    return Promise.reject(err)
}

export const $http = ({
    url = "",
    data = {},
    dataType = "JSON",
    type = "GET"
}, autoLoading = false) => {
    let httpPromise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest()
        data = {
            ...data,
            ...commonParams
        }
        url = formatUrl(url, data, type)
        xhr.onreadystatechange = function () {
            let responseData = ""
            if (xhr.readyState === 4 && xhr.status == 200) {
                if (dataType === "TEXT") {
                    responseData = xhr.responseXML.toString()
                } else if (dataType === "XML") {
                    responseData = xhr.responseText.toString()
                } else if (dataType === "JSON") {
                    responseData = JSON.parse(xhr.responseText)
                }
                resolve(responseData)
            } else if (xhr.readyState === 4 && xhr.status != 200) {
                console.warn("请求有误")
                viewEvent("request_failed", "request_failed", "请求失败")
                reject(xhr.status)
            }
        }
        xhr.open(type, url, true)
        xhr.setRequestHeader("language", data.language || "en")
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
        type === "GET" ? xhr.send(null) : xhr.send(jsonToString(data))
    })
    // 如果开启自动显示加载
    if (autoLoading) {
        // 往Set里添加一个promise，并在请求结束时删除
        requestArray.add(httpPromise)
        httpPromise.finally(() => {
            // 删除Promise，并更新loading组件
            requestArray.delete(httpPromise)
            handleHttpPromise()
        })
        // 请求发出，更新loading组件
        handleHttpPromise()
    }
    return httpPromise
}

export const $post = (url = "", data = {}, option = {}) => {
    let http = $http({
        url,
        data,
        type: "POST"
    }, option.hideLoading ? false : autoLoading)
    return option.ignoreError ? http : (
        http.catch(errorHandler).then(commonHandler)
    )
}

export const $get = (url = "", data = {}, option = {}) => {
    let http = $http({
        url,
        data,
        type: "GET"
    }, option.hideLoading ? false : autoLoading)
    return option.ignoreError ? http : (
        http.catch(errorHandler).then(commonHandler)
    )
}

export function setAutoLoading (isLoading = true) {
    autoLoading = isLoading
}
const Ajax = {
    $get,
    $post
}
export default Ajax

