const { cache } = require('./config');
const msgbuilder = require('../../handles/msgbuilder');
async function check(uid, gid) {
    try {
        let c = cache.get();
        if (c[uid] && (Date.now() - c[uid]) <= 86400000) return;
        let params = [`qq=${uid}`];
        const name = spark.mc.getXbox(uid);
        if (name) {
            params.push(`name=${name}`);
            const xuid = data.name2xuid(name);
            if (xuid) params.push(`xuid=${xuid}`);
        }
        const response = await fetch(`http://api.blackbe.work/openapi/v3/check/?${params.join('&')}`);
        const resdata = await response.json();
        if (resdata.status == 2001) {
            c[uid] = Date.now();
            cache.set(c);
        } else if (resdata.status == 2000) {
            let msg = [];
            spark.mc.config.admins.forEach(qq => {
                msg.push(msgbuilder.at(qq), msgbuilder.text(' '));
            });
            msg.push(msgbuilder.text(`\n${uid}在云黑中`));
            resdata.data.info.forEach(i => {
                msg.push(msgbuilder.text('\n=================\n'));
                let t = [];
                t.push(`条目UUID：${i.uuid}`);
                t.push(`违规玩家ID：${i.name}`);
                t.push(`玩家XUID：${i.xuid}`);
                t.push(`玩家违规信息：${i.info}`);
                t.push(`违规等级：${i.level}`);
                if(i.qq) t.push(`玩家QQ：${i.qq}`);
                if(i.photos) t.push('证据图片:');
                msg.push(msgbuilder.text(t.join('\n')));
                if(i.photos) msg.push(...i.photos.map(url => msgbuilder.img('https://'+url)));
            });
            spark.QClient.sendGroupMsg(gid, msg);
        }
        return resdata;
    } catch (e) {
        console.error(e);
    }
}
module.exports = check;