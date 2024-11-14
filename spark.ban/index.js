const msgbuilder = require('../../handles/msgbuilder');
const packbuilder = require('../../handles/packbuilder');
const configFile = spark.getFileHelper('ban'), JSON5 = require('json5');
const lg = require('../../handles/logger');
const logger = lg.getLogger('ban');
configFile.initFile('config.json', {
    list: [],
    regexlist: [],
    message: {
        enabled: true,
        mute: true,
        mutetime: 600,
        reply: true,
        reply_message: '你的消息中含有违禁词'
    },
    name: {
        enabled: true,
        reply: true,
        reply_message: '你的群昵称中含有违禁词'
    }
});
var conf = JSON5.parse(configFile.getFile("config.json"));
function generateStars(i) {
    return '*'.repeat(i);
}
function replace(str, target, replacement) {
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
function ban(message_id, group_id, user_id) {
    spark.QClient.deleteMsg(message_id);
    if (conf.message.mute) spark.QClient.sendGroupBan(group_id, user_id, conf.message.mutetime);
    if (conf.message.reply) spark.QClient.sendGroupMsg(group_id, [msgbuilder.at(user_id), msgbuilder.text(' ' + conf.message.reply_message)]);
}

function checkname(name, uid, gid) {
    let has = false;
    for (let regex of conf.regexlist) {
        let reg = new RegExp(regex, 'gi');
        if (reg.test(name)) {
            name = name.replace(reg, match => {
                return generateStars(match.length);
            });
            has = true;
        }
    }
    for (let w of conf.list) {
        if (name.toLowerCase().includes(w.toLowerCase())) {
            name = replace(name, w, generateStars(w.length));
            has = true;
        }
    }
    if (has) {
        spark.QClient.sendWSPack(packbuilder.GroupCardSet(gid, uid, name));
        if (conf.name.reply) spark.QClient.sendGroupMsg(gid, [msgbuilder.at(uid), msgbuilder.text(' ' + conf.name.reply_message)]);
    }
}
spark.on('message.group.normal', (e) => {
    const { message, group_id, user_id, message_id, sender } = e;
    if (group_id !== spark.mc.config.group) return;
    if (spark.mc.config.admins.includes(user_id)) return;
    if (conf.name.enabled && sender.card != '') checkname(sender.card, user_id, group_id);
    if (conf.message.enabled) {
        for (let i of message) {
            if (i.type != 'text') continue;
            for (let w of conf.list) {
                if (i.data.text.toLowerCase().includes(w.toLowerCase())) {
                    ban(message_id, group_id, user_id);
                    return;
                }
            }
            for (let regex of conf.regexlist) {
                if (new RegExp(regex).test(i.data.text)) {
                    ban(message_id, group_id, user_id);
                    return;
                }
            }
        }
    }
});
if (spark.telemetry.WebConfigBuilder != null) {
    const WebConfigBuilder = spark.telemetry.WebConfigBuilder;
    let wbc = new WebConfigBuilder("ban");
    wbc.addEditArray("list", conf.list, "违禁词列表");
    wbc.addEditArray("regexlist", conf.regexlist, "正则表达式列表");
    wbc.addSwitch("message_enabled", conf.message.enabled, "是否启用群消息检测");
    wbc.addSwitch("message_mute", conf.message.mute, "检测到违禁词后是否禁言");
    wbc.addNumber("message_mutetime", conf.message.mutetime, "禁言时间，单位:秒");
    wbc.addSwitch("message_reply", conf.message.reply, "群消息检测到违禁词后是否警告");
    wbc.addText("message_reply_message", conf.message.reply_message, "警告的内容，格式为@xxx reply_message");
    wbc.addSwitch("name_enabled", conf.name.enabled, "是否启用群昵称检测");
    wbc.addSwitch("name_reply", conf.name.reply, "群昵称检测到违禁词后是否警告");
    wbc.addText("name_reply_message", conf.name.reply_message, "警告的内容，格式为@xxx reply_message");
    spark.emit("event.telemetry.pushconfig", wbc);
    spark.on("event.telemetry.updateconfig_ban", (plname, K, newV) => {
        if (K.startsWith('message_')) conf.message[K.substring(8)] = newV;
        else if (K.startsWith('name_')) conf.name[K.substring(5)] = newV;
        else conf[K] = newV;
        configFile.updateFile('config.json', conf);
    });
}