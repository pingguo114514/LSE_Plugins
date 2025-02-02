/// <reference path="../../SparkBridgeDevelopTool/index.d.ts"/>
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

const axios = require('axios');
const msgbuilder = require('../../handles/msgbuilder');
var cache = {};
async function searchSong(keyword) {
    try {
        const url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=1&n=10&w=${encodeURIComponent(keyword)}`;
        const response = await axios.get(url);
        return JSON.parse(response.data.slice(9).slice(0, -1)).data.song.list.map(song => {
            let singer = song.singer.map(s => s.name).join('&');
            return { name: song.songname, singer: singer, mid: song.songmid };
        });
    } catch (error) {
        console.error('搜索失败:', error);
    }
}
async function getSongUrl(mid) {
    try {
        const url = `https://api.vkeys.cn/v2/music/tencent/geturl?mid=${mid}`;
        const response = await axios.get(url);
        return response.data.data.url;
    } catch (error) {
        console.error('请求失败:', error);
        return 'error';
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
        let url = await getSongUrl(cache[user_id][id]);
        if (url == 'error' || !url) return reply('获取链接失败');
        cache[user_id] = {};
        reply('获取链接成功，正在下载歌曲，请稍微等待一段时间');
        spark.QClient.sendGroupMsg(group_id, [msgbuilder.record(url)]);
    }
}));