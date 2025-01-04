// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 
var conf = new JsonConfigFile('plugins\\ProhibitedWords\\config.json'), list, regexlist;
function loadConfig() {
    list = conf.init('list', []);
    regexlist = conf.init('regexlist', []);
}

function check(text) {
    for (let i of list) {
        if (text.includes(i)) {
            return true;
        }
    }
    for (let i of regexlist) {
        if (new RegExp(i).test(text)) {
            return true;
        }
    }
    return false;
}
function getlist(){
    return {
        list: list,
        regexlist: regexlist
    }
}
ll.exports(check,'ProhibitedWords', 'check');
ll.exports(getlist,'ProhibitedWords', 'getlist');