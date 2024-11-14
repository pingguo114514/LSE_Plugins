// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

const OpenAI = require('openai');
var openai, conf, model, api_url, api_key, word_limit, prompt, cc, cmd, message = {}, cnt = {};
function init() {
    conf = new JsonConfigFile('.\\plugins\\AiChat\\config.json');
    api_url = conf.init('openai_api_url', 'https://api.openai.com/v1');
    api_key = conf.init('api_key', '');
    model = conf.init('model', 'gpt-3.5-turbo');
    prompt = conf.init('prompt', '');
    word_limit = conf.init('word_limit', 100);
    cc = conf.init('continuousConversation', {
        enabled: true,
        type: 1,
        maxCount: 20
    });
    cmd = conf.init('cmd', {
        name: 'chat',
        description: '与AI对话'
    });
    openai = new OpenAI({
        apiKey: api_key,
        baseURL: api_url
    });
}
async function chat(msg, id) {
    if (msg.length > word_limit) return '消息过长';
    // logger.info(msg, ' ', id);
    if (!cnt[id]) cnt[id] = 0;
    if (!message[id] || !cc.enabled) message[id] = [{ role: 'system', content: prompt }];
    if (cc.enabled && cc.maxCount != 0 && cnt[id] >= cc.maxCount) {
        message[id] = [{ role: 'system', content: prompt }];
        cnt[id] = 0;
    }
    message[id].push({ role: 'user', content: msg });
    try {
        let chatCompletion = await openai.chat.completions.create({
            messages: message[id],
            model: model,
        });
        let replyMsg = chatCompletion.choices[0].message.content;
        message[id].push({ role: 'assistant', content: replyMsg });
        if (cc.maxCount != 0 && cc.enabled) replyMsg += `\n(${++cnt[id]}/${cc.maxCount})`
        return replyMsg;
    } catch (e) {
        // console.error(e);
        logger.error(e.message);
        return '出错了！报错信息见控制台';
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
mc.listen('onServerStarted', () => {
    init();
    mc.regPlayerCmd(cmd.name, cmd.description, wrapAsyncFunc(async (pl, args) => {
        msg = await chat(args.join(' '), pl.uuid);
        pl.tell(msg);
    }));
});
if (ll.hasExported("SparkAPI", "GetEventID")) {
    const CallEvent = ll.imports("SparkAPI", "callCustomEvent");
    const GetEventID = ll.imports("SparkAPI", "GetEventID");
    const GroupId = ll.imports('SparkAPI', 'GetGroupId')();
    const reply = ll.imports('SparkAPI', 'msgbuilder.reply');
    const text = ll.imports('SparkAPI', 'msgbuilder.text');
    const send = ll.imports('SparkAPI', 'sendGroupMsg');
    function on(event, callback) {
        let eventId = GetEventID();
        ll.exports(callback, event, eventId);
        CallEvent(event, eventId);
    }
    on('message.group.normal', wrapAsyncFunc(async (e) => {
        const { message, group_id, message_id, self_id, user_id } = e;
        if (group_id != GroupId) return;
        if (message[0].type == 'at' && message[0].data.qq == self_id) {
            let msg = '';
            message.forEach(i => {
                if (i.type == 'text') msg += i.data.text;
            });
            if (msg == '') return;
            msg = await chat(msg, (cc.type == 1) ? user_id : 'qq');
            send(group_id, [reply(message_id), text(msg)]);
        }
    }));
} else if (ll.listPlugins().includes('sparkbridge2')) {
    logger.error('sparkbridge版本过低');
}