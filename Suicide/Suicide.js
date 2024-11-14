// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE/dts/HelperLib-master/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "Suicide",
    /* introduction */ "自杀",
    /* version */ [1,0,2]
); 
mc.listen("onServerStarted",()=>{
    let cmd = mc.newCommand("suicide","自杀",PermType.Any);
    cmd.setAlias("die");
    cmd.overload([]);
    cmd.setCallback((cmd,origin,output,results)=>{
        if(origin.player){
            let pl=origin.player;
            pl.sendModalForm('自杀','确定自杀','确定','取消',(pl,die)=>{
                if(die){
                    if(pl.gameMode==0||pl.gameMode==2) pl.hurt(pl.health,ActorDamageCause.Magic,pl);
                    else pl.kill()
                }
            });
        }else output.error('此命令仅玩家可使用');
    });
    cmd.setup();
    logger.info('Suicide已加载');
});