// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

var conf = new JsonConfigFile('plugins\\ProhibitedWords\\config.json'), list, regexlist, caseSensitive;
list = conf.init('list', []);
regexlist = conf.init('regexlist', []);
caseSensitive = conf.init('caseSensitive', true);
function check(text) {
    for (let i of list) {
        if (caseSensitive ? text.includes(i) : text.toLowerCase().includes(i.toLowerCase())) {
            return true;
        }
    }
    for (let i of regexlist) {
        if (new RegExp(i, caseSensitive ? '' : 'i').test(text)) {
            return true;
        }
    }
    return false;
}
function getlist() {
    return {
        list: list,
        regexlist: regexlist
    }
}
function generateStars(i, f) {
    return f.repeat(i);
}
function replaceCaseInsensitive(str, target, replacement) {
    let result = '';
    let currentIndex = 0;
    let lowercaseStr = str.toLowerCase();
    let lowercaseTarget = target.toLowerCase();
    let targetLength = target.length;
    while (true) {
        let index = lowercaseStr.indexOf(lowercaseTarget, currentIndex);
        if (index === -1) {
            result += str.substring(currentIndex);
            break;
        }
        result += str.substring(currentIndex, index) + replacement;
        currentIndex = index + targetLength;
    }
    return result;
}
function replace(text, f) {
    if (caseSensitive) {
        regexlist.forEach(i => {
            let reg = new RegExp(i, 'g');
            text = text.replace(reg, match => {
                return generateStars(match.length, f);
            });
        });
        list.forEach(w => {
            text = text.replace(w, generateStars(w.length, f));
        });
    } else {
        regexlist.forEach(i => {
            let reg = new RegExp(i, 'gi');
            text = text.replace(reg, match => {
                return generateStars(match.length, f);
            });
        });
        list.forEach(w => {
            text = replaceCaseInsensitive(text, w, generateStars(w.length, f));
        });
    }
    return text;
}
ll.exports(check, 'ProhibitedWords', 'check');
ll.exports(getlist, 'ProhibitedWords', 'getlist');
ll.exports(replace, 'ProhibitedWords', 'replace');