import {
    viewEvent, cookie, getURLParams
} from "@/common/util"
import {
    showLoading, hideLoading
} from "@/components/loading/index"
import { error } from "@/components/toast/index"
const isProduction = (process.env.NODE_ENV === "production")
const isRelease = (process.env.NODE_ENV === "release")
const isDevelopment = (process.env.NODE_ENV === "development")
const URLParams:any = getURLParams()
const cookies:any = cookie.getAll()
const commonParams = {
    platform: "android",
    version: "1.0.0",
    channel: "test",
    language: URLParams.language || cookies.language || "en",
    ...URLParams,
    ...cookies
}

enum Method {
    GET = "GET",
    POST = "POST",
    HEAD = "HEAD",
}

interface HttpOption {
    hideLoading?: boolean,
    ignoreError?: boolean
}

interface ResponseData {
    message: string
    status: string
    data: any
}

declare global {
    interface Window {
        _: Function
    }
}

class Http {
    public autoLoading:boolean = false
    public BASE_URL:string = ""
    public BASE_API_URL:string = ""
    public isProduction:boolean = isProduction
    public isRelease:boolean = isRelease
    public isDevelopment:boolean = isDevelopment
    public URLParams = URLParams
    public commonParams = commonParams
    public cookies = cookies
    private requestQueue:Set<Promise<ResponseData>> = new Set()

    constructor () {
        if (isProduction) {
            this.BASE_URL = window.location.protocol + "//www.madcrickets.com"
        } else if (isRelease) {
            this.BASE_URL = window.location.protocol + "//prewww.madcrickets.com"
        } else if (isDevelopment) {
            // this.BASE_URL = "http://10.0.0.175:8001"
            this.BASE_URL = window.location.protocol + "//10.0.0.171:8001"
        }
        this.BASE_API_URL = `${this.BASE_URL}/api`
    }

    setAutoLoading (autoLoading:boolean = true) {
        this.autoLoading = autoLoading
    }

    // 把请求放进队列
    addRequestQueue (httpPromise: Promise<ResponseData>) {
        this.requestQueue.add(httpPromise)
        this.handleHttpPromise()
        // 请求结束后 从队列中移除
        httpPromise.finally(() => {
            this.removeRequestQueue(httpPromise)
        })
    }

    // 把请求从队列移除
    removeRequestQueue (httpPromise: Promise<ResponseData>) {
        this.requestQueue.delete(httpPromise)
        this.handleHttpPromise()
    }

    // 更新状态，如果有请求正在进行中，就显示loading
    handleHttpPromise () {
        this.requestQueue.size > 0 ? showLoading() : hideLoading()
    }

    formatJsonToUrlData (data:any):string {
        let dataArr = [] as string []
        for (let key in data) {
            dataArr.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        }
        return dataArr.join("&")
    }

    formatUrl (URL:string, data:any = {}) {
        const hasQueryStart = URL.indexOf("?") > -1
        return (`${URL}${hasQueryStart ? "&" : "?"}${this.formatJsonToUrlData(data)}`)
    }

    createXMLHttpRequest (url:string, method:Method, data:any):XMLHttpRequest {
        let xmlHttpRequest = new XMLHttpRequest()
        data = {
            ...data,
            ...this.commonParams
        }
        url = method === Method.GET ? this.formatUrl(url, data) : url
        xmlHttpRequest.open(method, url, true)
        xmlHttpRequest.setRequestHeader("language", this.commonParams.language)
        xmlHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
        return xmlHttpRequest
    }

    errorHandler (responseData: ResponseData) {
        error(responseData.message)
        return Promise.reject(responseData)
    }

    commonHandler (responseData: ResponseData) {
        let isError = responseData.status !== "100"
        isError && error(responseData.message)
        return isError ? Promise.reject(responseData) : Promise.resolve(responseData)
    }

    $http (url:string, method:Method, data:any):Promise<ResponseData> {
        url = `${this.BASE_API_URL}${url}`
        const xmlHttpRequest = this.createXMLHttpRequest(url, method, data)
        const requestPromise:Promise<ResponseData> = new Promise((resolve, reject) => {
            xmlHttpRequest.onreadystatechange = () => {
                let responseData:ResponseData
                let errorData:ResponseData = {
                    message: window._ ? window._("networkError") : "Network Error",
                    status: "",
                    data: {}
                }
                if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status == 200) {
                    responseData = JSON.parse(xmlHttpRequest.responseText)
                    resolve(responseData)
                } else if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status != 200) {
                    errorData.status = xmlHttpRequest.status.toString()
                    console.log(`request failed: url:${url} status: ${errorData.status}`)
                    viewEvent("request_failed", "request_failed", "请求失败")
                    reject(errorData)
                }
            }
        })

        method === Method.GET ? xmlHttpRequest.send(null) : xmlHttpRequest.send(this.formatJsonToUrlData(data))
        return requestPromise
    }

    $get (url:string, data:any = {}, option:HttpOption = {}):Promise<ResponseData> {
        let http = this.$http(url , Method.GET, data)
        if (!option.hideLoading) {
            this.addRequestQueue(http)
        }
        return option.ignoreError ? http : (
            http.catch(this.errorHandler).then(this.commonHandler)
        )
    }

    $post (url:string, data:any = {}, option:HttpOption = {}):Promise<ResponseData> {
        let http = this.$http(url , Method.POST, data)
        if (!option.hideLoading) {
            this.addRequestQueue(http)
        }
        return option.ignoreError ? http : (
            http.catch(this.errorHandler).then(this.commonHandler)
        )
    }
}

const http = new Http()
export default http

