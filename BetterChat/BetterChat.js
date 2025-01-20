// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

var conf = new JsonConfigFile('plugins/BetterChat/config.json');
conf.init('showPlatform', true);
conf.init('showGmode', true);
conf.init('showDimension', true);
conf.init('showOrganization', true);
conf.init('showLatency', true);
conf.init('badWordsFilter', true);
conf.init('sparkbridge2', false);
var language = new JsonConfigFile('plugins/BetterChat/language.json', JSON.stringify({
    device: {
        "Android": "安卓",
        "Google": "安卓",
        "iOS": "iOS",
        "IOS": "iOS",
        "OSX": "MacOS",
        "Amazon": "平板/电视亚马逊FireOS",
        "GearVR": "VR",
        "Hololens": "VR",
        "Windows10": "电脑",
        "Win32": "电脑",
        "Uwp": "电脑",
        "TVOS": "TVOS",
        "PlayStation": "PS",
        "Nintendo": "Switch",
        "Xbox": "Xbox",
        "WindowsPhone": "WindowsPhone",
        "Unknown": "未知设备"
    },
    gamemode: {
        "0": "生存",
        "1": "创造",
        "2": "冒险",
        "6": "旁观"
    },
    dimension: {
        "0": "主世界",
        "1": "地狱",
        "2": "末地"
    },
    noOrg: "无"
}));
if (conf.get('badWordsFilter')) var check = ll.imports('ProhibitedWords', 'check'), replace = ll.imports('ProhibitedWords', 'replace');
if (conf.get('showOrganization')) var orgNameQuery = ll.imports('orgEX', 'orgEX_getPlayerOrgName');
if (conf.get('sparkbridge2')) var send = ll.imports('SparkAPI', 'sendGroupMessage');
mc.listen('onChat', (pl, msg) => {
    if (conf.get('badWordsFilter') && check(msg)) {
        pl.tell('§c§l你的消息包含敏感词汇');
        msg = replace(msg, '*');
    }
    let t = [], dv = pl.getDevice();
    let latency = dv.lastPing;
    let orgName = (ll.hasExported('orgEX', 'orgEX_getPlayerOrgName') ? orgNameQuery(pl.xuid) : 'orgEX未安装') || language.get('noOrg');
    if (latency <= 100) latency = '§a' + latency;
    else if (latency <= 400) latency = '§e' + latency;
    else latency = '§c' + latency;
    if (conf.get('showPlatform')) t.push(`§a${language.get('device')[(dv.os in language.get('device')) ? dv.os : 'Unknown']}`);
    if (conf.get('showDimension')) t.push(`§6${language.get('dimension')[pl.pos.dimid]}`);
    if (conf.get('showGmode')) t.push(`§b${language.get('gamemode')[pl.gameMode]}`);
    if (conf.get('showLatency')) t.push(`${latency}ms`);
    if (conf.get('showOrganization')) t.push(`§d${orgName}`);
    let preMsg = `§r[${t.join('§r|')}§r]<${pl.name}> `;
    mc.broadcast(preMsg + msg);
    if (conf.get('sparkbridge2')) send(`${pl.name}:${msg}`);
    // logger.info(preMsg + msg);
    return false;
});