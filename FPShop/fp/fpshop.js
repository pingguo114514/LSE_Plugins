const { GetPlayerFpCnt, SetPlayerFpCnt } = require('./fpdata');
const { conf } = require('./config');
function isNumeric(value) {
    return /^[+-]?\d+$/.test(value);
}
function regfpshopcmd() {
    let cmd = mc.newCommand("fpshop", "假人商店", PermType.Any);
    cmd.overload([]);
    cmd.setCallback((cmd, ori, output, res) => {
        if (!ori.player) return output.error("only player can use");
        let pl = ori.player;
        let fm = mc.newCustomForm();
        fm.setTitle("假人商店");
        fm.addLabel(`一个假人${conf.get('fpPrice')+conf.get('currencyName')}\n每名玩家最多购买2个假人`);
        fm.addInput("请输入要购买的假人的数量", "要购买的假人的数量");
        pl.sendForm(fm, (pla, data) => {
            if (data == null) return;
            let num = data[1];
            if (isNumeric(num) && parseInt(num) > 0) {
                num = parseInt(num);
                let cnt = GetPlayerFpCnt(pla);
                if (cnt + num > conf.get('playerMaxFpCount')) return pla.tell(`每名玩家最多拥有${conf.get('playerMaxFpCount')}个假人`);
                if (pla.getMoney() >= (num) * conf.get('fpPrice')) {
                    pla.reduceMoney((num) * conf.get('fpPrice'));
                    SetPlayerFpCnt(pla, cnt + num);
                    pla.tell(`购买成功，你现在有${cnt + num}个假人`);
                } else {
                    pla.tell('余额不足');
                }
            } else pla.tell('请输入正整数');
        });
    });
    cmd.setup();
}
module.exports = {
    regfpshopcmd: regfpshopcmd
}