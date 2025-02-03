/// <reference path="../../SparkBridgeDevelopTool/index.d.ts"/>
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

const msgbuilder = require('../../handles/msgbuilder');
const configFile = spark.getFileHelper('verify');
configFile.initFile("cache.json", [], false)
function getCache() {
    return JSON.parse(configFile.getFile("cache.json"))
}
function writeCache(o) {
    configFile.updateFile('cache.json', o);
}
spark.on('notice.group_increase', (e) => {
    const { group_id, user_id } = e;
    if (group_id != spark.mc.config.group) return;
    spark.QClient.sendGroupMsg(group_id, [msgbuilder.at(user_id), msgbuilder.text(' 请在一天内添加白名单并进入服务器')]);
    let cache = getCache();
    cache.push({ qq: user_id, time: Date.now() + 86400000 })
    writeCache(cache);
});
setInterval(() => {
    let cache = getCache();
    cache.filter(i => {
        if (Date.now() >= i.time) {
            spark.QClient.sendGroupMsg(spark.mc.config.group, [msgbuilder.at(i.qq), msgbuilder.text(' 未在一天内进入服务器')]);
            spark.QClient.setGroupKick(spark.mc.config.group, i.qq, false);
            return false;
        }
        return true;
    });
    writeCache(cache);
}, 60000);
mc.listen('onJoin', (pl) => {
    if (pl.isSimulatedPlayer()) return;
    let cache = getCache();
    cache = cache.filter(i => {
        if (i.qq == spark.mc.getQQByXbox(pl.realName)) {
            pl.tell('验证成功');
            return false;
        }
        return true;
    });
    writeCache(cache);
});