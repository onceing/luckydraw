function addClass(el, className) {
    if (hasClass(el, className)) {
        return
    }
    let newCLass = el.className.split(' ')
    newCLass.push(className)
    el.className = newCLass.join(' ')
}

function hasClass(el, className) {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}

function removeClass(el, className) {
    if (hasClass(el, className)){
        let newCLass = el.className.split(' ')
        newCLass.splice(newCLass.indexOf(className), 1)
        el.className = newCLass.join(' ')
    }
}

function getData(el, name, val) {
    const prefix = 'data-'
    if (val) {
        return el.setAttribute(prefix + name, val)
    } else {
        return el.getAttribute(prefix + name)
    }
}

let elementStyle = document.createElement('div').style

let vendor = (() => {
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standred: 'transform'
    }

    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }

    return false
})()

function prefixStyle(style) {
    if (vendor === false) {
        return false
    }

    if (vendor === 'standard') {
        return style
    }

    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
