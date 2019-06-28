import { cookie } from "@/common/util"
import common from "./common"

const _lang = cookie.get("language") || "en"
const _isEn = (_lang === "en")
let lang = {
    ...common
}

window._ = function (string) {
    return (
        _isEn ?
            _format(lang.en[string], arguments) :
            _format(lang.hi[string], arguments)
    )
}

function _format (string, argu) {
    if (argu.length > 1) {
        let thisString = string || ""
        for (let index = 1; index < argu.length; index++) {
            thisString = thisString.replace(new RegExp(`\\{${index - 1}\\}`, "g"), argu[index])
        }
        return thisString
    }
    return string
}

export default {
    use: function (language) {
        if (language && language.length && language.length) {
            language.map((item) => {
                lang = {
                    en: {
                        ...lang.en,
                        ...item.en
                    },
                    hi: {
                        ...lang.hi,
                        ...item.india
                    }
                }
            })
        } else if (language) {
            lang = {
                en: {
                    ...lang.en,
                    ...language.en
                },
                hi: {
                    ...lang.hi,
                    ...language.india
                }
            }
        }
    }
}
