/// <reference path="../../SparkBridgeDevelopTool/index.d.ts"/>
/// <reference types="@levimc-lse/types" />

const msgbuilder = require('../../handles/msgbuilder');
const packbuilder = require('../../handles/packbuilder');
const logger = spark.getLogger("ChatGuard");
const blackbe = require('./blackbe');
const { config } = require('./config');
let cache = {};

mc.listen('onServerStarted', () => {
    if (!ll.hasExported('ProhibitedWords', 'check')) {
        logger.error('ProhibitedWords未安装');
        return;
    }
    let pw = {
        check: ll.imports('ProhibitedWords', 'check'),
        replace: ll.imports('ProhibitedWords', 'replace'),
    }
    function messageCheck(message, mid, uid, gid, conf) {
        for (let i of message) {
            if (i.type != 'text') continue;
            if (pw.check(i.data.text)) {
                spark.QClient.deleteMsg(mid);
                if (conf.reply.enabled) spark.QClient.sendGroupMsg(gid, [msgbuilder.at(uid), msgbuilder.text(' ' + conf.reply.message)]);
                if (conf.mute.enabled) spark.QClient.sendGroupBan(gid, uid, conf.mute.time);
                return true;
            }
        }
        return false;
    }
    function nameCheck(name, uid, gid, conf) {
        if (name != '' && pw.check(name)) {
            spark.QClient.sendWSPack(packbuilder.GroupCardSet(gid, uid, pw.replace(name, '*')));
            if (conf.reply.enabled) spark.QClient.sendGroupMsg(gid, [msgbuilder.at(uid), msgbuilder.text(' ' + conf.reply.message)]);
            return true;
        }
        return false;
    }
    spark.on('message.group.normal', (e) => {
        const { raw_message, message, group_id, user_id, message_id, sender } = e;
        if (group_id !== spark.mc.config.group) return;
        if (spark.mc.config.admins.includes(user_id)) return;
        let conf = config.get();
        if (conf.check.blackbe.enabled) blackbe(user_id, group_id);
        if (conf.check.name.enabled) nameCheck(sender.card, user_id, group_id, conf.check.name);
        if (conf.check.message.enabled) messageCheck(message, message_id, user_id, group_id, conf.check.message);

        if (!conf.antispam.enabled) return;
        if (!cache[user_id]) cache[user_id] = {
            rate: 1,
            lastmsg: raw_message,
            quantity: 1
        };
        else {
            cache[user_id].rate++;
            if (cache[user_id].lastmsg == raw_message) cache[user_id].quantity++;
            else {
                cache[user_id].quantity = 1;
                cache[user_id].lastmsg = raw_message;
            }
        }
        setTimeout(() => { cache[user_id]-- }, 60000);
        if (cache[user_id].rate > conf.antispam.maxRate) {
            if (conf.antispam.reply.enabled) spark.QClient.sendGroupMsg(group_id, [msgbuilder.reply(message_id), msgbuilder.text(conf.antispam.reply.toofast)]);
            if (conf.antispam.mute.enabled) spark.QClient.sendGroupBan(group_id, user_id, conf.antispam.mute.time);
        } else if (cache[user_id].quantity > conf.antispam.maxSameMsg) {
            if (conf.antispam.reply.enabled) spark.QClient.sendGroupMsg(group_id, [msgbuilder.reply(message_id), msgbuilder.text(conf.antispam.reply.toomuch)]);
            if (conf.antispam.mute.enabled) spark.QClient.sendGroupBan(group_id, user_id, conf.antispam.mute.time);
        }
    });
});