import {
    setAutoLoading
} from "@/plugins/ajax"
import {
    cookie
} from "@/common/util"
import React from "react"
import ReactDOM from "react-dom"
import Question from "./question"
import "./question.less"
import "@/styles/lib-reset.css"
import "@/styles/lib-public.less"
setAutoLoading()
cookie.set("ck", "MTAwMTU4ODRiZDU3NGFlN2E2NDQxM2MzYzc1YTZhMjRhNTRiNDQ0OA%3D%3D")
cookie.set("appck", "MTAwMTU4ODRiZDU3NGFlN2E2NDQxM2MzYzc1YTZhMjRhNTRiNDQ0OA%3D%3D")
ReactDOM.render(<Question />, document.getElementById("app"))

