const msgbuilder = require('../../handles/msgbuilder');
const axios = require('axios'), https = require('https'), JSON5 = require('json5');
const configFile = spark.getFileHelper('blackbe');
const ignoreSSL = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});//忽略证书过期
configFile.initFile('config.json', {
    "MsgDetection": true
});
var conf = JSON5.parse(configFile.getFile("config.json"));
async function check(playerName, group, lg, message_id) {
    try {
        const response = await ignoreSSL.get(`http://api.blackbe.work/openapi/v3/check/?name=${playerName}`);
        const data = response.data;
        let atext = "";
        switch (data.status) {
            case 2000:
                let t = [`${playerName}存在违规行为`];
                data.data.info.forEach(i => {
                    let { uuid, name, xuid, info, level, qq } = i;
                    let detail_url = `https://blackbe.work/detail/${uuid}`;
                    t.push(`玩家ID: ${name}\n条目UUID: ${uuid}\nXUID: ${xuid}\n记录原因: ${info}\n危险等级: ${level}\n玩家QQ: ${qq}\n详细信息: ${detail_url}`);
                });
                atext = t.join('\n================\n');
                break;
            case 2001:
                atext = "对方不存在违规行为记录";
                break;
            case 4000:
                atext = "参数为空";
                break;
            case 5000:
                atext = "服务器出错";
                break;
            default:
                atext = "未知错误";
                break;
        }
        if (lg || data.status == 2000) spark.QClient.sendGroupMsg(group, [msgbuilder.reply(message_id), msgbuilder.text(atext)]);
    } catch (e) {
        console.error(e);
    }
}
spark.on('message.group.normal', (e) => {
    const { raw_message, group_id, user_id, message_id } = e;
    if (group_id !== spark.mc.config.group) return;
    let name = spark.mc.getXbox(user_id.toString());
    if (name && conf.MsgDetection) check(name, group_id, false, message_id);
    let match = raw_message.match("^查云黑\\s?(.+)$");
    if (match) check(match[1], group_id, true, message_id);
});
if (spark.telemetry.WebConfigBuilder != null) {
    const WebConfigBuilder = spark.telemetry.WebConfigBuilder;
    let wbc = new WebConfigBuilder("spark.blackbe");
    wbc.addSwitch("MsgDetection", conf.MsgDetection, "是否开启发送消息自动查询");
    spark.emit("event.telemetry.pushconfig", wbc);
    spark.on("event.telemetry.updateconfig_spark.blackbe", (plname, K, newV) => {
        conf[K] = newV;
        configFile.updateFile('config.json', conf);
    });
}