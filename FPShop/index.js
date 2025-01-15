// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

const { regfpshopcmd } = require('./FPShop/fp/fpshop');
const { regfpcmd } = require('./FPShop/fp/fp');
const { regfpopcmd } = require('./FPShop/fp/fpop');
const { reglistcmd } = require('./FPShop/fp/fplist');

function RegCmd() {
    regfpshopcmd();
    regfpcmd();
    regfpopcmd();
    reglistcmd();
}

mc.listen('onServerStarted', () => {
    RegCmd();
});