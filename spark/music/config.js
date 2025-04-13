const configFile = spark.getFileHelper("music");
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

module.exports = ConfigFile