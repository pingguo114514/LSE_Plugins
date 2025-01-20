// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

const { GetOnlineFp, fpdata } = require('./fpdata');
const { conf } = require('./config');
function removeFromArrays(obj, elementToRemove) {
    // 遍历对象的每个键值对
    for (let key in obj) {
        obj[key] = obj[key].filter(item => item !== elementToRemove);
    }
}
function opdeletefp(pla) {
    let deletefp = mc.newCustomForm(), OnlineFp = GetOnlineFp();
    if (GetOnlineFp().length == 0) return pla.tell('服务器内没有假人了');
    deletefp.setTitle('下线假人');
    deletefp.addDropdown('选择要下线的假人', OnlineFp.map(i => {
        return i.name;
    }));
    pla.sendForm(deletefp, (play, data) => {
        try {
            if (data == null) return;
            let fp = OnlineFp[data[0]];
            let id = fp.uniqueId;
            if (fp.simulateDisconnect()) {
                let PlOnlineFp = JSON.parse(fpdata.read());
                removeFromArrays(PlOnlineFp, id);
                fpdata.write(JSON.stringify(PlOnlineFp, null, 4));
                play.tell('下线成功');
            } else play.tell('下线失败');
        } catch (err) {
            throw err;
        }
    });
}
function regfpopcmd() {
    let cmd = mc.newCommand("fpop", "假人管理(op版)", PermType.GameMasters);
    cmd.overload([]);
    cmd.setCallback((cmd, ori, output, res) => {
        if (!ori.player) return output.error("only player can use");
        let pl = ori.player, fm = mc.newSimpleForm();
        fm.setTitle("假人管理(op版)");
        fm.addButton('下线假人');
        fm.addButton('重载配置');
        pl.sendForm(fm, (pla, id) => {
            if (id == null) return;
            switch (id) {
                case 0:
                    opdeletefp(pla);
                    break;
                case 1:
                    if(conf.reload()) pla.tell('重载成功');
                    else pla.tell('重载失败');
                    break;
            }
        });
    });
    cmd.setup();
}
module.exports = {
    regfpopcmd: regfpopcmd
}