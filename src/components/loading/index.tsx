import React from "react"
import ReactDOM from "react-dom"

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
export function showLoading () {
    ReactDOM.render(<Loading isLoading={true} />, $loadingEl)
}

export function hideLoading () {
    ReactDOM.render(<Loading isLoading={false} />, $loadingEl)
}
