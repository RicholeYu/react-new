// http://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    "parser": 'typescript-eslint-parser',
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true,
            "arrowFunctions": true,
            "classes": true,
            "modules": true,
            "defaultParams": true
        },
    },
    env: {
        browser: true,
    },
    extends: ["react-app", "eslint:recommended", "plugin:react/recommended"],
    plugins: [
        "class-property"
    ],
    "rules": {
        "indent": ["error", 4, { "ignoredNodes": ["TSXElement *"] }],
        "eqeqeq": 0,
        "no-useless-escape": 0,
        "brace-style": 0,//大括号风格
        "curly": [2, "all"], //[2, "all"],//必须使用 if(){} 中的{}
        "no-new": 0,
        "no-return-assign": 0,//return 语句中不能有赋值表达式

        "handle-callback-err": 0,
        "padded-blocks": 0,
        "no-duplicate-imports": 0,
        "operator-linebreak": 0,
        "no-extend-native": 0,
        "no-sequences": 0,

        "no-debugger": 0,
        "no-eval": 0,
        "comma-dangle": [2, "never"],
        "arrow-spacing": [2, { "before": true, "after": true }],
        "no-undef": 2,
        "no-console": 0,
        "space-before-function-paren": [2, "always"],
        "keyword-spacing": [2, { "before": true, "after": true }],
        "space-before-blocks": [2, "always"],
        "spaced-comment": [2, "always", {"exceptions": ['-', '+']}],
        "quotes": [2, "double"],
        "semi": [2, "never"],
        "no-multiple-empty-lines": [2, {"max": 1}],
        "generator-star-spacing": [2, { "before": true, "after": true }],
        "object-curly-newline": ["error", { "consistent": true, "minProperties": 2 }],
        "object-curly-spacing": [2, "always"],
        "key-spacing": [2, { "beforeColon": false, "afterColon": true }],
        "linebreak-style": [2, "windows"],
		"eol-last": [2, "windows"],
        "object-property-newline": [2, {}],
        "space-infix-ops": 2,
        "no-control-regex": 0,
        'react/jsx-indent': [
            'error',
            4
        ],
        "react/jsx-filename-extension": [2, { "extensions": [".js", ".jsx", ".tsx"] }],
        "react/jsx-closing-tag-location": 2,
        "react/self-closing-comp": ["error", {
            "component": true,
            "html": true
        }],
        "react/jsx-tag-spacing": ["error", {
			"closingSlash": "never",
			"beforeSelfClosing": "always",
			"afterOpening": "never",
			"beforeClosing": "never"
        }],
        "react/no-render-return-value": 0
    },
    globals: {
        "_": true,
        "arguments": true,
        "ActiveXObject": true,
        "AndroidLogin": true,
        "FB": true
    }
}
