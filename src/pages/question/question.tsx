import React from "react"
import Transition from "@/components/transition"
import {
    $get, $post
} from "@/plugins/ajax"
import { cbetLocal } from "@/common/util"
interface Option {
    content: string
    option: string,
    relateid?: string
}

interface Question {
    Question: Option []
    Title: string
    _id: string
    Ralated?: string
}

class Question extends React.Component {
    state = {
        currentQuestion: {
            Question: [] as Option []
        } as Question,
        questions: [] as Question [],
        notRelateQuestions: [] as Question [],
        paperid: "", // 问卷ID
        pop_help: false,
        pop_submit: false,
        pop_success: false,
        pop_error: false,
        pop_repeat: false,
        progress: 1, // 现在第几题
        total: 5, // 总共的题目数量
        activeIndex: -1, // 现在激活的答案
        anwsers: [] as string [], // 用户的答案
        say: "", // 用户说的话
        lastNotRelateQuestionIndex: 0 // 上一次非relate 题目Index，
    }

    choose = (index:number) => {
        this.setState({ activeIndex: index === this.state.activeIndex ? -1 : index })
    }

    backToApp () {
        cbetLocal({
            func: "closeWebview",
            params: {}
        })
    }

    closePop = () => {
        this.setState({
            pop_help: false,
            pop_submit: false,
            pop_success: false,
            pop_error: false,
            pop_repeat: false
        })
    }

    handleSay = (e:any) => {
        this.setState({ say: e.currentTarget.value })
    }

    nextOrSubmit = () => {
        const {
            currentQuestion, activeIndex, anwsers, progress, total, say
        } = this.state
        const hasQuestion = !!currentQuestion.Question
        const currentAnwser = hasQuestion  && currentQuestion.Question[activeIndex] ? currentQuestion.Question[activeIndex].content : say
        // 记录当前题目答案
        let answer = `${currentQuestion._id}@${say || currentAnwser}`
        if (anwsers.length === progress) {
            // 防止重复提交同一题
            anwsers[anwsers.length - 1] = answer
        } else {
            anwsers.push(answer)
        }
        // 还没有填完答卷，显示下一题
        // 填完答卷, 提交答卷
        progress !== total ? this.next() : this.submit()
    }

    getRelateQuestion (relateId: string):Question {
        return this.state.questions.find(question => question._id === relateId)
    }

    getNextQuestion ():Question {
        const {
            notRelateQuestions,
            lastNotRelateQuestionIndex
        } = this.state
        return notRelateQuestions[lastNotRelateQuestionIndex + 1]
    }

    next () {
        const {
            currentQuestion,
            activeIndex,
            progress,
            lastNotRelateQuestionIndex,
            notRelateQuestions
        } = this.state
        let currentAnwser = currentQuestion.Question[activeIndex]
        let nextQuestion = currentAnwser.relateid ? this.getRelateQuestion(currentAnwser.relateid) : this.getNextQuestion()
        this.setState({
            activeIndex: -1,
            progress: progress + 1,
            say: "",
            lastNotRelateQuestionIndex: currentAnwser.relateid ? lastNotRelateQuestionIndex : notRelateQuestions.indexOf(nextQuestion),
            currentQuestion: nextQuestion
        })
    }

    submit () {
        this.setState({
            pop_submit: true
        })
    }

    submitIt = () => {
        this.closePop()
        $post("/survey/commit", {
            answer: this.state.anwsers.join("$"),
            paperid: this.state.paperid
        }, {
            ignoreError: true
        }).then(res => {
            let status = res.status
            let isSuccess = status === "100"
            if (isSuccess) {
                this.setState({
                    pop_success: true
                })
                return
            }
            this.setState(status === "2102" ? {
                pop_repeat: true
            } : {
                pop_error: true
            })
        }).catch(err => {
            this.setState({
                pop_error: true
            })
        })
    }

    componentDidMount () {
        $get("/survey/paper").then((res:any) => {
            let notRelateQuestions:Question [] = []
            let relateQuestion:object = {}
            res.data.quetions.map((question:Question) => {
                if (!question.Ralated) {
                    notRelateQuestions.push(question)
                } else {
                    relateQuestion[question.Ralated] = 1
                }
            })
            this.setState({
                questions: res.data.quetions,
                paperid: res.data.paperid,
                currentQuestion: notRelateQuestions[0],
                notRelateQuestions,
                progress: 1,
                total: notRelateQuestions.length + Object.keys(relateQuestion).length
            })
        })
    }

    render () {
        const {
            activeIndex, currentQuestion, pop_help, pop_submit, pop_success, pop_error, pop_repeat, progress, total
        } = this.state
        const pop_layer = pop_help || pop_submit || pop_success || pop_error || pop_repeat
        const Question = currentQuestion.Question
        const hasQuestion = !!Question
        const canNext = (hasQuestion && activeIndex !== -1) || (!hasQuestion && this.state.say !== "")
        return (
            <div className="page_questionnaire">
                <div className="header">
                    <button className="btn_back" onClick={this.backToApp} />
                    <h1>Prize Survey</h1>
                    <button className="btn_help" onClick={() => this.setState({ pop_help: true })} />
                </div>
                <div className="main">
                    <p className="msg_thank">
                        {"Hey, thanks for filling this form, you'll get"} <i className="yellow">10,000 coins</i> {"when the survey's done."}
                    </p>
                    {
                        currentQuestion._id ? (
                            <div className="msg_progress">
                                <ul className="questSort" style={{ transform: `translateY(-${(progress - 1) * 40 * 10 / 75}vw)` }}>
                                    {
                                        new Array(total).fill(0).map((item, index) => (
                                            <li key={index}>{index + 1}</li>
                                        ))
                                    }
                                </ul>/{total}
                            </div>) : null
                    }
                    {
                        currentQuestion._id ? (
                            <div className="question_modules on">
                                <p className="quest_title">
                                    {progress}.{currentQuestion.Title || ""}
                                </p>
                                <ul className="quest_lists">
                                    {
                                        hasQuestion && Question.map((anwser, index) => (
                                            <li className={`quest_list ${activeIndex === index ? "on" : ""} ${anwser.content.length > 35 ? "small" : ""} icon${anwser.content.replace(/\s/g, "")}`} key={anwser.option}
                                                onClick={() => this.choose(index)}>
                                                {anwser.content}
                                            </li>
                                        ))
                                    }
                                    {
                                        !hasQuestion || (hasQuestion && Question[activeIndex] && Question[activeIndex].content === "Other") ? (
                                            <li className="quest_list textarea">
                                                <textarea placeholder="I think…" onKeyUp={this.handleSay} />
                                            </li>
                                        ) : null
                                    }
                                </ul>
                                <button className={`btn_scale btn_quest ${canNext ? "on" : ""}`} onClick={() => canNext && this.nextOrSubmit()}>
                                    Next
                                </button>
                            </div>
                        ) : null
                    }
                </div>
                {pop_layer ? <div className="pop_layer" /> : null}
                <Transition className="pop_quest pop_help" name="pop_animate" show={pop_help}>
                    <p className="msg">
                        1. User shall fill out the form with true and accurate information.
                    </p>
                    <p className="msg">
                        2. Each account can only submit one form, repeating submission is invalid.
                    </p>
                    <p className="msg">
                        3. User will get 10,000 coins rewards after successful submission.
                    </p>
                    <button className="btn btn_confirm" onClick={this.closePop}>
                        OK
                    </button>
                </Transition>

                <Transition className="pop_quest pop_submit" name="pop_animate" show={pop_submit}>
                    <p className="msg">
                        Form submitted cannot be modified, confirm to submit?
                    </p>
                    <button className="btn btn_confirm" onClick={this.submitIt}>
                        Submit
                    </button>
                    <button className="btn btn_cancel" onClick={this.closePop}>
                        Later
                    </button>
                </Transition>

                <Transition className="pop_quest pop_success" name="pop_animate" show={pop_success}>
                    <p className="title">
                        Submission Successful
                    </p>
                    <img src="./img/icon_success.png" alt="" />
                    <p className="msg">
                        Thank you for your feedback, <i className="yellow">10,000 coins </i>has been sent to your account.
                    </p>
                    <button className="btn btn_confirm" onClick={this.backToApp}>
                        Got it
                    </button>
                </Transition>

                <Transition className="pop_quest pop_error" name="pop_animate" show={pop_error}>
                    <p className="title">
                        Oops! <br />
                        Something went wrong
                    </p>
                    <img src="./img/icon_error.png" alt="" />
                    <p className="msg">
                        Please check your network connection and retry.
                    </p>
                    <button className="btn btn_confirm" onClick={this.submitIt}>
                        Retry
                    </button>
                </Transition>

                <Transition className="pop_quest pop_repeat" name="pop_animate" show={pop_repeat}>
                    <p className="msg">
                        {"We've received your feedback, please don't repeat submission."}
                    </p>
                    <button className="btn btn_confirm" onClick={this.backToApp}>
                        Got it
                    </button>
                </Transition>
            </div>
        )
    }
}

export default Question
