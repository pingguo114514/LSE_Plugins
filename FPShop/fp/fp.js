const { GetPlayerOnlineFp, SetPlayerOnlineFp, GetPlayerFpCnt, GetOnlineFp, } = require('./fpdata');
const { conf } = require('./config');
function addfp(pl) {
    let fpcnt = GetOnlineFp().length;
    if (fpcnt >= conf.get('fpMaxCount')) return pl.tell(`服务器内最多只能同时存在${conf.get('fpMaxCount')}个假人`);
    // if(ll.import("GMLIB_API", "getServerCurrentTps")()<10) return pl.tell('TPS都跌到个位数了,就别放假人了');
    if (GetPlayerOnlineFp(pl).length == GetPlayerFpCnt(pl)) return pl.tell('你没有假人可以上线了');
    let fpl = mc.spawnSimulatedPlayer(`FP_${pl.realName}`, pl.pos);
    if (fpl == null) pl.tell('上线失败');
    else {
        fpl.setGameMode(1);
        let fp = GetPlayerOnlineFp(pl);
        fp.push(fpl.uniqueId);
        SetPlayerOnlineFp(pl, fp);
        pl.tell('上线成功');
    }
}
function deletefp(pla) {
    let plonlinefp = GetPlayerOnlineFp(pla)
    if (plonlinefp.length == 0) {
        pla.tell('你没有已经上线的假人了');
        return;
    }
    let deletefp = mc.newCustomForm()
    deletefp.setTitle('下线假人');
    deletefp.addDropdown('选择要下线的假人', plonlinefp.map(i => {
        return mc.getPlayer(i).realName;
    }));
    pla.sendForm(deletefp, (play, data) => {
        if (data == null) return;
        if (mc.getPlayer(plonlinefp[data[0]]).simulateDisconnect()) {
            let fp = GetPlayerOnlineFp(play);
            fp.splice(data[0], 1);
            SetPlayerOnlineFp(play, fp);
            play.tell('下线成功');
        } else play.tell('下线失败');
    });
}
function tpfp(pla) {
    let plonlinefp1 = GetPlayerOnlineFp(pla);
    if (plonlinefp1.length == 0) {
        pla.tell('你没有已经上线的假人了');
        return;
    }
    let tpfp = mc.newCustomForm()
    tpfp.setTitle('移动假人');
    tpfp.addLabel('将假人传送到你当前的位置');
    tpfp.addDropdown('选择要移动的假人', plonlinefp1.map(i => {
        return mc.getPlayer(i).realName;
    }));
    pla.sendForm(tpfp, (play, data) => {
        if (data == null) return;
        if (mc.getPlayer(plonlinefp1[data[1]]).teleport(play.pos)) {
            play.tell('移动成功');
        } else play.tell('移动失败');
    });
}
function fplook(pla) {
    let plonlinefp2 = GetPlayerOnlineFp(pla)
    if (plonlinefp2.length == 0) {
        pla.tell('你没有已经上线的假人了');
        return;
    }
    let fplook = mc.newCustomForm()
    fplook.setTitle('调整假人朝向');
    fplook.addLabel('使假人看向你');
    fplook.addDropdown('选择要调整的假人', plonlinefp2.map(i => {
        return mc.getPlayer(i).realName;
    }));
    pla.sendForm(fplook, (play, data) => {
        if (data == null) return;
        if (mc.getPlayer(plonlinefp2[data[1]]).simulateLookAt(play.pos)) {
            play.tell('调整成功');
        } else play.tell('调整失败');
    });
}
function regfpcmd() {
    let cmd1 = mc.newCommand("fp", "假人管理", PermType.Any);
    cmd1.overload([]);
    cmd1.setCallback((cmd, ori, output, res) => {
        if (!ori.player) return output.error("only player can use");
        let pl = ori.player, fm = mc.newSimpleForm();
        fm.setTitle("假人管理");
        fm.setContent(`你拥有${GetPlayerFpCnt(pl)}个假人，上线了${GetPlayerOnlineFp(pl).length}个`);
        fm.addButton('上线假人');
        fm.addButton('下线假人');
        fm.addButton('移动假人');
        fm.addButton('调整假人朝向');
        pl.sendForm(fm, (pla, id) => {
            if (id == null) return;
            switch (id) {
                case 0:
                    addfp(pla);
                    break;
                case 1:
                    deletefp(pla);
                    break;
                case 2:
                    tpfp(pla);
                    break;
                case 3:
                    fplook(pla);
                    break;
            }
        });
    });
    cmd1.setup();
}
if (!conf.get('allowFPTakeItem')) {
    mc.listen('onTakeItem', (pl => {
        if (pl.isSimulatedPlayer()) return false;
    }));
}

module.exports = {
    regfpcmd: regfpcmd
}