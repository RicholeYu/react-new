import React from "react"

interface Props {
    name: string
    show: boolean
    className?: string
}

interface State {
    isRender: boolean
    animate: boolean
}

class Transition extends React.Component<Props, State> {

    state = {
        isRender: false,
        animate: false
    }

    transitionEndHandler = () => {
        this.setState({
            animate: false
        })
    }

    handleAnimate () {
        if (!this.props.show && this.state.isRender) {
            this.setState({ isRender: false })
        } else if (this.props.show && !this.state.isRender) {
            setTimeout(() => {
                this.setState({ isRender: true })
            }, 0)
        }
    }

    static getDerivedStateFromProps (props: Props, state: State) {
        if ((props.show && !state.isRender) || (!props.show && state.isRender)) {
            state.animate = true
        }
        return state
    }

    render () {
        let name = ""
        if (this.props.show) {
            if (this.state.isRender) {
                name = `${this.props.name}-enter-active ${this.props.name}-enter-to`
            } else {
                name = `${this.props.name}-enter-active ${this.props.name}-enter`
            }
        } else {
            if (this.state.isRender) {
                name = `${this.props.name}-leave-active ${this.props.name}-leave`
            } else {
                name = `${this.props.name}-leave-active ${this.props.name}-leave-to`
            }
        }
        return (!this.props.show && !this.state.isRender && !this.state.animate) ? null : (
            <div className={this.state.animate ? `${this.props.className} ${name}` : this.props.className}
                onAnimationEnd={this.transitionEndHandler}
                onTransitionEnd={this.transitionEndHandler}>
                {this.props.children}
            </div>
        )

    }

    componentDidMount () {
        this.props.show && this.handleAnimate()
    }

    componentDidUpdate () {
        this.handleAnimate()
    }
}

export default Transition
