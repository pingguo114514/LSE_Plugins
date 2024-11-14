// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "iLandHelper",
    /* introduction */ "修护ILand的些问题",
    /* version */ [1,0,1]
); 

var trust,landowner,GetLand,landop,CheckPerm;

//火焰附加修复
mc.listen("onMobHurt",(mob,s)=>{
	if(s == null) return;
    if(!s.isPlayer()) return;
    let pl = mc.getPlayer(s.name);
    let landId = GetLand(mob.pos);
    if(landId == -1 || pl.xuid == undefined) return;
    if(trust(landId,pl.xuid) || landowner(landId,pl.xuid) || landop(pl.xuid)) return;
    mob.stopFire();
});
mc.listen("onAttackEntity",(pl,e)=>{
    let landId = GetLand(e.pos);
    if(landId == -1 || pl.xuid == undefined) return;
    if(trust(landId,pl.xuid) || landowner(landId,pl.xuid) || landop(pl.xuid)) return;
    e.stopFire();
});

mc.listen("onOpenContainer",(pl,bl)=>{
    let landId = GetLand(bl.pos);
    if(landId == -1) return;
    if(pl.xuid == undefined) return;
    if(trust(landId,pl.xuid) || landowner(landId,pl.xuid) || landop(pl.xuid)) return;
    if(bl.type.includes("shulker_box") && CheckPerm(landId,'use_shulker_box') != true) return false;//彩色潜影盒修复
});

mc.listen("onUseItemOn",(pl,item,bl,side,pos)=>{
    //logger.info(bl.type,' ',item.type);
    let landId = GetLand(bl.pos);
    if(landId == -1||pl.xuid == undefined) return;
    if(trust(landId,pl.xuid) || landowner(landId,pl.xuid) || landop(pl.xuid)) return;
    if(item.type=='minecraft:bone_meal') return false;//骨粉修复
    if((bl.type == "minecraft:grass_block"||bl.type=="minecraft:dirt")&&(item.type.includes('_shovel')||item.type.includes('_hoe'))) return false;//铲除修复
    if(bl.type.includes("_sign")) return false; //告示牌修复
    if(bl.type.includes("_trapdoor")&&CheckPerm(landId,'use_trapdoor')!=true) return false;//活板门修复
    if(bl.type.includes("_door")&&CheckPerm(landId,'use_door')!=true) return false;//门修复
    if(bl.type.includes("_button")&&CheckPerm(landId,'use_button')!=true) return false;//按钮修复
    if(bl.type.includes("_fence_gate")&&CheckPerm(landId,'use_fence_gate')!=true) return false;//栅栏门修复
});

mc.listen("onServerStarted",()=>{
    trust=ll.import('ILAPI_IsPlayerTrusted');
    landowner=ll.import('ILAPI_IsLandOwner');
    GetLand=ll.import('ILAPI_PosGetLand');
    landop=ll.import('ILAPI_IsLandOperator');
    CheckPerm=ll.import('ILAPI_CheckPerm');
    logger.setTitle('ILand');
    logger.info(`Helper已加载`);
});