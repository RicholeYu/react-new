import React from "react"
import ReactDOM from "react-dom"
import Transition from "../transition"
import "./toast.less"
interface Message {
    content: string,
    duration: number
}

interface Props {
    show: boolean,
    message: Message
}

class Toast extends React.Component<Props> {
    private timer: number
    state = {
        show: this.props.show
    }
    render () {
        return (
            <Transition className="toast" name="toast" show={this.state.show}>
                <div className="toast_main">
                    <span>{ this.props.message.content }</span>
                </div>
            </Transition>
        )
    }

    autoClose () {
        clearTimeout(this.timer)
        this.timer = Number(setTimeout(() => {
            if (this.state.show) {
                this.setState({
                    show: false
                })
            }
        }, this.props.message.duration))
    }

    componentDidUpdate () {
        this.autoClose()
    }

    componentDidMount () {
        this.autoClose()
    }
}
const $toastEl = document.createElement("div")
$toastEl.className = "__toast__container"
document.body.appendChild($toastEl)

export function error (message:string, duration:number = 2000) {
    ReactDOM.render(<Toast show={true} message={{
        content: message,
        duration
    }} />, $toastEl)
}

