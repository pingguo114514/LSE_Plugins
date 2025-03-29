/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 
/// <reference path="../../SparkBridgeDevelopTool/index.d.ts"/>
const msgbuilder = require('../../handles/msgbuilder');
const configFile = spark.getFileHelper('JoinNotifier');
class Config {
    constructor(filename, data = {}, autoUpdate) {
        this.filename = filename;
        configFile.initFile(this.filename, data, autoUpdate);
    }
    get() {
        return JSON.parse(configFile.getFile(this.filename));
    }
    set(data) {
        return configFile.updateFile(this.filename, data);
    }
}
let Data = new Config('data.json', {}, false)
spark.on('message.group.normal', (e) => {
    const { raw_message, user_id, group_id, message_id } = e;
    if (group_id != spark.mc.config.group) return;
    function reply(msg) {
        spark.QClient.sendGroupMsg(group_id, [msgbuilder.reply(message_id), msgbuilder.text(msg)]);
    }
    let msg = raw_message.split(" ");
    switch (msg[0]) {
        case '设置提醒':
        case '添加提醒':
            try {
                let data = Data.get();
                let userdata = data[user_id] || [];
                if (userdata.includes(msg.slice(1).join(' '))) {
                    reply('已存在此提醒');
                    return;
                }
                userdata.push(msg.slice(1).join(' '));
                data[user_id] = userdata
                Data.set(data);
                reply('设置成功')
            } catch (e) {
                reply(`设置失败:${e.message}`);
                console.error(e);
            }
            break;
        case '提醒列表':
            try {
                let data = Data.get();
                let userdata = data[user_id] || [];
                reply(`当前提醒列表:\n${userdata.length > 0 ? userdata.join('\n') : '无'}`)
            } catch (e) {
                reply(`获取失败:${e.message}`);
                console.error(e);
            }
            break;
        case '移除提醒':
            try {
                let data = Data.get();
                let userdata = data[user_id] || [];
                if (!userdata.includes(msg.slice(1).join(' '))) {
                    reply('不存在此提醒');
                    return;
                }
                data[user_id] = userdata.filter(name => name != msg.slice(1).join(' '))
                Data.set(data);
                reply('移除成功')
            } catch (e) {
                reply(`移除失败:${e.message}`);
                console.error(e);
            }
            break;
    }
});
mc.listen('onJoin', (pl) => {
    if (pl.isSimulatedPlayer()) return;
    let data = Data.get();
    Object.keys(data).forEach(user_id => {
        let userdata = data[user_id];
        if (userdata.includes(pl.name)) {
            spark.QClient.sendGroupMsg(spark.mc.config.group, [msgbuilder.at(user_id), msgbuilder.text(` ${pl.name}进入了服务器`)]);
        }
    })
})