const fs = require("fs");
const fetch = require('node-fetch-native');
const msgbuilder = require('../../handles/msgbuilder');
const logger = spark.getLogger('music');
const ConfigFile = require('./config');
let config = new ConfigFile('config.json', {
    plugin: 'https://github.bibk.top/ThomasBy2025/musicfree/raw/refs/heads/main/plugins/wy.js',
    userVariables: {}
});
let conf = config.get();
const pluginUrl = conf.plugin;
let cache = {};
let PLUGIN_DIR;
if (spark.onBDS) {
    if (!fs.existsSync('./plugins/LeviLamina')) PLUGIN_DIR = './plugins/nodejs/sparkbridge2/plugins'
    else PLUGIN_DIR = './plugins/sparkbridge2/plugins'
} else PLUGIN_DIR = './plugins';
spark.on('bot.online', async () => {
    try {
        let res = await fetch(pluginUrl);
        let plugin = await res.text();
        fs.writeFileSync(`${PLUGIN_DIR}/music/plugin.js`, plugin);
    } catch (e) {
        logger.error('更新插件失败');
        console.log(e);
    }
    const { platform, author, version, userVariables } = require('./plugin');
    logger.info(`正在加载 ${platform} v${version}`);
    if (userVariables) {
        if (!conf.userVariables[pluginUrl]) {
            logger.warn('当前插件存在可配置的用户变量，请前往config.json查看，修改完后重启生效');
            conf.userVariables[pluginUrl] = userVariables.map(i => ({ ...i, value: "" }));
        }
        config.set(conf);
        global.env = {
            getUserVariables: () => {
                return Object.fromEntries(
                    config.get().userVariables[pluginUrl].map(({ key, value }) => [key, value])
                );
            }
        };
    }
    const { search, getMediaSource } = require('./plugin');
    if (!search) return logger.error(`${platform}未配置搜索接口，加载失败`);
    logger.info(`${platform} 加载完成，作者：${author}`);
    function isNumber(str) {
        return /^(10|[1-9])$/.test(str);
    }
    spark.on('message.group.normal', async (e) => {
        const { raw_message, group_id, user_id, message_id } = e;
        if (group_id != spark.mc.config.group) return;
        function reply(text) {
            spark.QClient.sendGroupMsg(group_id, [msgbuilder.reply(message_id), msgbuilder.text(text)]);
        }
        if (!cache[user_id]) cache[user_id] = [];
        if (raw_message.startsWith('点歌 ')) {
            try {
                let songs = await search(raw_message.slice(3), 1, 'music');
                songs = songs.data;
                if (!songs || songs.length == 0) {
                    reply('没有找到相关歌曲');
                    return;
                }
                if (songs.length > 10) songs = songs.slice(0, 10);
                cache[user_id] = songs;
                let msg = songs.map((song, index) => {
                    return `${index + 1}. ${song.title} - ${song.artist}`;
                });
                msg.push('发送“选择+序号”即可选择歌曲');
                reply(msg.join('\n'));
            } catch (e) {
                reply('出错了！详情见控制台');
                console.log(e);
                return;
            }
        }
        if (cache[user_id].length !== 0 && raw_message.startsWith('选择')) {
            let id = raw_message.replace('选择', '');
            if (!isNumber(id) || !cache[user_id]) return;
            id = parseInt(id);
            try {
                let url, header = {};
                if (!getMediaSource) url = cache[user_id][id - 1].url;
                else {
                    let res = await getMediaSource(cache[user_id][id - 1], 'standard');
                    url = res.url;
                    if (res.headers != null) header = res.headers;
                    if (res.ua != null) header['User-Agent'] = res.userAgent;
                }
                if (url == '') return reply('获取链接失败');
                const parsedUrl = new URL(url);
                if (parsedUrl.username || parsedUrl.password) { // 仅当有凭证时处理
                    // 生成认证头
                    const auth = Buffer.from(`${parsedUrl.username}:${parsedUrl.password}`).toString('base64');
                    header = { ...header, Authorization: `Basic ${auth}` };

                    // 清理URL中的敏感信息
                    parsedUrl.username = '';
                    parsedUrl.password = '';
                    url = parsedUrl.toString();
                }
                reply('正在下载歌曲，请稍作等待');
                let res = await fetch(url, { headers: header });
                let data = await res.arrayBuffer()
                let base64 = Buffer.from(data).toString('base64');
                spark.QClient.sendGroupMsg(group_id, [{ type: "record", data: { file: `base64://${base64}` } }]);
            } catch (e) {
                reply('出错了！详情见控制台');
                console.log(e);
            }

        }
    });
});