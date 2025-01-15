var fpdata = new JsonConfigFile('.\\plugins\\FPShop\\data\\fp.json');
var data = new JsonConfigFile('.\\plugins\\FPShop\\data\\data.json');
function GetPlayerOnlineFp(pl) {
    return fpdata.get(pl.uuid);
}
function SetPlayerOnlineFp(pl, i) {
    return fpdata.set(pl.uuid, i);
}
function GetPlayerFpCnt(pl) {
    return data.get(pl.uuid);
}
function SetPlayerFpCnt(pl, num) {
    return data.set(pl.uuid, num);
}
function GetOnlineFp() {
    return mc.getOnlinePlayers().filter((pl => {
        return pl.isSimulatedPlayer();
    }));
}
mc.listen('onJoin', (pl) => {
    if (pl.isSimulatedPlayer()) return;
    data.init(pl.uuid, 0);
    fpdata.init(pl.uuid, []);
});
mc.listen('onServerStarted', () => {
    let OnlineFpId = GetOnlineFp().map(i => {
        return i.uniqueId;
    });
    let PlOnlineFp = JSON.parse(fpdata.read());
    for (let i in PlOnlineFp) {
        PlOnlineFp[i] = PlOnlineFp[i].filter(id => {
            return OnlineFpId.includes(id);
        });
    }
    fpdata.write(JSON.stringify(PlOnlineFp, null, 4));
});
module.exports = {
    fpdata: fpdata,
    data: data,
    GetPlayerOnlineFp: GetPlayerOnlineFp,
    SetPlayerOnlineFp: SetPlayerOnlineFp,
    GetPlayerFpCnt: GetPlayerFpCnt,
    SetPlayerFpCnt: SetPlayerFpCnt,
    GetOnlineFp: GetOnlineFp
};