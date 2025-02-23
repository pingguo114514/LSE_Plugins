const msgbuilder = require('../../handles/msgbuilder');
var cache = {};
async function searchSong(keyword) {
    try {
        const url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=1&n=10&w=${encodeURIComponent(keyword)}`;
        const response = await fetch(url);
        const data = await response.text();
        return JSON.parse(data.slice(9).slice(0, -1)).data.song.list.map(song => {
            let singer = song.singer.map(s => s.name).join('&');
            return { name: song.songname, singer: singer, mid: song.songmid };
        });
    } catch (error) {
        console.error('搜索失败:', error);
    }
}
// 作者：Copcin
//https://github.com/copws/qq-music-api
async function getSongUrl(songmid, quality = "m4a", server = 0, origin = false) {
    let res = await fetch(
        "https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data={%22req_0%22:{%22module%22:%22vkey.GetVkeyServer%22,%22method%22:%22CgiGetVkey%22,%22param%22:{%22filename%22:[%22PREFIXSONGMIDSONGMID.SUFFIX%22],%22guid%22:%2210000%22,%22songmid%22:[%22SONGMID%22],%22songtype%22:[0],%22uin%22:%220%22,%22loginflag%22:1,%22platform%22:%2220%22}},%22loginUin%22:%220%22,%22comm%22:{%22uin%22:%220%22,%22format%22:%22json%22,%22ct%22:24,%22cv%22:0}}"
            .replaceAll("SONGMID", songmid)
            .replaceAll(
                "PREFIX",
                quality.toLowerCase() == "m4a"
                    ? "C400"
                    : quality == "128"
                        ? "M500"
                        : "M800"
            )
            .replaceAll("SUFFIX", quality.toLowerCase() == "m4a" ? "m4a" : "mp3")
    );
    let data = await res.json();
    if (origin) return data;
    else {
        purl = data.req_0.data.midurlinfo[0].purl;
        switch (server) {
            case 0:
                return "http://ws.stream.qqmusic.qq.com/" + purl;
            case 1:
                return "http://isure.stream.qqmusic.qq.com/" + purl;
            case 2:
                return "http://dl.stream.qqmusic.qq.com/" + purl;
        }
    }
}
function wrapAsyncFunc(func) {
    return (...args) => {
        setTimeout(() => {
            func(...args).catch((e) => {
                throw e;
            })
        }, 0);
    };
}
function isNumber(str) {
    return /^(10|[1-9])$/.test(str);
}
spark.on('message.group.normal', wrapAsyncFunc(async (e) => {
    const { raw_message, group_id, user_id, message_id } = e;
    if (group_id != spark.mc.config.group) return;
    function reply(text) {
        spark.QClient.sendGroupMsg(spark.mc.config.group, [msgbuilder.reply(message_id), msgbuilder.text(text)]);
    }
    if (!cache[user_id]) cache[user_id] = {};
    if (raw_message.startsWith('点歌 ')) {
        let msg = await searchSong(raw_message.replace('点歌 ', ''));
        let t = 1;
        if (msg.length == 0) return reply('未找到歌曲');
        msg = msg.map(i => {
            cache[user_id][t] = i.mid;
            return `${t++}. ${i.name} - ${i.singer}`
        });
        msg.push('发送“选择+序号”即可选择歌曲');
        reply(msg.join('\n'), message_id);
    }
    if (raw_message.startsWith('选择')) {
        let id = raw_message.replace('选择', '');
        if (!isNumber(id) || !cache[user_id] || JSON.stringify(cache[user_id]) == '{}') return;
        try{
            let res = await getSongUrl(cache[user_id][id]);
            cache[user_id] = {};
            reply('获取链接成功，正在下载歌曲，请稍微等待一段时间');
            spark.QClient.sendGroupMsg(group_id, [msgbuilder.record(res)]);
        }catch(e){
            reply('获取链接失败');
            console.log(e);
        }

    }
}));