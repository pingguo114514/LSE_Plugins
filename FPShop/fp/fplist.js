const { GetOnlineFp } = require('./fpdata');
const { conf } = require('./config');
function reglistcmd() {
    if (!conf.get('regListCmd')) return;
    let cmd = mc.newCommand("pllist", "列出服务器上的玩家", PermType.GameMasters);
    cmd.overload([]);
    cmd.setCallback((cmd, ori, output, res) => {
        let pllist = mc.getOnlinePlayers().filter((pl => {
            return !pl.isSimulatedPlayer();
        })).map(pl => {
            return pl.realName;
        });
        output.success(`目前有 ${pllist.length}/20 个玩家在线：`);
        output.success(pllist.join(', '));
    });
    cmd.setup();
    let cmd1 = mc.newCommand("fplist", "列出服务器上的假人", PermType.GameMasters);
    cmd1.overload([]);
    cmd1.setCallback((cmd, ori, output, res) => {
        let fplist = GetOnlineFp().map(pl => {
            return pl.realName;
        });
        output.success(`目前有 ${fplist.length}/${conf.get('fpMaxCount')} 个假人在线：`);
        output.success(fplist.join(', '));
    });
    cmd1.setup();
}
module.exports = {
    reglistcmd: reglistcmd
}