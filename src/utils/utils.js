export function setCookies(object, options) {
    var _date = new Date();
    _date.setDate(_date.getDate() + 30);

    const keys = Object.keys(object);
    for (let key of keys) {
        document.cookie = `${key}=${object[key]}; expires=${(options && options.date.toGMTString()) || _date.toGMTString()}`
    }
}

export function getCookies() {
    const cookies = document.cookie.split(/\;[\s]*/g)
    let obj = {}
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=')
        obj[key] = value
    }
    return obj
}

export const fetch_url = 'http://127.0.0.1:3000/'