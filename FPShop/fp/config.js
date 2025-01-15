var conf = new JsonConfigFile('.\\plugins\\FPShop\\config.json');
conf.init('fpPrice', 200000);
conf.init('currencyName', '金币');
conf.init('fpMaxCount', 5);
conf.init('playerMaxFpCount', 2);
conf.init('allowFPTakeItem', false);
conf.init('regListCmd', true);

module.exports = {
    conf: conf
}