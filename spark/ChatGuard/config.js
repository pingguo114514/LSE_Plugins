const configFile = spark.getFileHelper("ChatGuard");
const JSON5 = require('json5');
class ConfigFile {
    constructor(name, data) {
        this.name = name;
        configFile.initFile(name, data);
    }
    get() {
        return JSON5.parse(configFile.getFile(this.name));
    }
    set(data) {
        return configFile.updateFile(this.name, data);
    }
}
let config = new ConfigFile('config.json', {
    check: {
        message: {
            enabled: true,
            mute: {
                enabled: true,
                time: 600
            },
            reply: {
                enabled: true,
                message: '你的消息中含有违禁词'
            }
        },
        name: {
            enabled: true,
            reply: {
                enabled: true,
                message: '你的群昵称中含有违禁词'
            }
        },
        blackbe: {
            enabled: true
        }
    },
    antispam: {
        enabled: true,
        maxRate: 20,
        maxSameMsg: 5,
        mute: {
            enabled: true,
            time: 60
        },
        reply: {
            enabled: true,
            toofast: '发送消息的频率过快',
            toomuch: '发送相同消息过多'
        }
    }
});
let cache = new ConfigFile('blackbeCache.json', {})
module.exports = {
    config: config,
    cache: cache
}