import React from "react"
import ReactDOM from "react-dom"
import "./loading.less"
const $loadingEl = document.createElement("div")
document.body.appendChild($loadingEl)

interface Props {
    isLoading: boolean
}

export class Loading extends React.Component<Props> {
    render () {
        return (
            <div className={this.props.isLoading ? "loading" : "hide"}>
                <div className="common_loading" />
            </div>
        )
    }
}

let isLoading:boolean = false

export function showLoading () {
    if (!isLoading) {
        isLoading = true
        ReactDOM.render(<Loading isLoading={isLoading} />, $loadingEl)
    }
}

export function hideLoading () {
    if (isLoading) {
        isLoading = false
        ReactDOM.render(<Loading isLoading={isLoading} />, $loadingEl)
    }
}
