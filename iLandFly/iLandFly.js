// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "iLandFly",
    /* introduction */ "领地飞行",
    /* version */ [1,0,0]
); 
var trust,landowner,getland;
function FlyOn(pl){
    pl.setAbility(10, true);
    pl.tell('您已进入领地，飞行已开启');
}
function FlyOff(pl){
    pl.setAbility(10, false);
    pl.tell('您已离开领地，飞行已关闭');
}
mc.listen('onServerStarted',()=>{
    trust=ll.import('ILAPI_IsPlayerTrusted');
    landowner=ll.import('ILAPI_IsLandOwner');
    getland=ll.import('ILAPI_PosGetLand');
    logger.info('已加载');
});
mc.listen('onTick',()=>{
    mc.getOnlinePlayers().forEach(pl=>{
        if(pl.isCreative||pl.isSpectator) return;
        let landid=getland(pl.pos);
        if(pl.canFly){
            if(landid==-1) return FlyOff(pl);
            if(!(trust(landid,pl.xuid)||landowner(landid,pl.xuid))) FlyOff(pl);
        }else{
            if(landid==-1) return;
            if(trust(landid,pl.xuid)||landowner(landid,pl.xuid)) FlyOn(pl);
        }
    });
});