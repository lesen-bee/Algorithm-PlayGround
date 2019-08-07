YourGame = {
    init: function(){

    },
    preload: function(){
    },
    create: function(){
/* 通过背包增加的对象组,和通过地图设定的   对象组,都会自动创建并加入 APG.TargetGroups 中,
*  但是通过地图第三层, 即玩家层,创建的玩家对象组,会加入 APG.CharacterGroups 中
* 两种用法都一样, 只需要从这两个js中的对象拿取相应的组即可
* */
        APG.Assets.playMusic('mu')
        this.exports = APG.methods.getTargetGroup("chukou");
        this.numBlocks = APG.methods.getTargetGroup("numBlock");

        let nums = new Array(7); // = [12,3,45,7,11,425,9];
        for(let i=0;i<nums.length;i++){
            nums[i] = Math.round(Math.random()*200);
        }
        APG.methods.loadTextBitMapBetween(this.numBlocks,nums,'rgb(212,142,0)');

        this.player = APG.methods.getCharacterGroup('player');
        APG.methods.moveGroupUpTo(this.player, this.exports);

        APG.methods.playerMoveAnimations(this.player,{
            /* 方向(大写,或小写 -> frames 或单个数字*/
            right: 0,
            LEFT: [1],
            down: [2],
            up: 3,
        });

        APG.update.listenKey.setMoveKey('up','UP');

        APG.update.setCollideWorldBounds(false);

        APG.update.collision.blockGroupOverlap(this.player, this.numBlocks);
        APG.update.collision.activeGroupOverlap(this.player, this.baoshis, this.getBaoshi, null, this);
        APG.update.collision.activeGroupOverlap(this.player, this.exports, this.export);
        APG.update.listenKey.addKeyEvent('E', this.swapBlock, null, this);
    },
    update: function(){
        // var site = APG.methods.getCharacterSite(this.player);
        APG.update.listenKey.characterMoveEvent(this.player, this.checkMove, null, null, null, null, this);
        var tile = APG.methods.getCharacterTile(this.player);
        if(!tile || APG.methods.getTileId(tile)==3){
            APG.update.listenKey.stopListenKey();
            setTimeout(function(){
                location.reload();
            },100);
        }

        this.checkBlocks();
    },
    checkMove: function(newX,newY){
        /* 无论之前检测是否能通行, 这里都会再次传入坐标执行,
         * 所以记得判断一下前方是什么
         * */
        var tile = APG.methods.getTileFromSite(newX, newY);
        if(!tile){
            return;
        }
        let tileIndex = APG.methods.getTileId(tile);
        let nowSite = APG.methods.getCharacterSite(this.player);
        if(tileIndex == 2 && nowSite.x - 1 == newX){
            return false;
        }else if(tileIndex == 4 && nowSite.x + 1 == newX){
            return false;
        }
    },
    checkBlocks: function(){
        let blocks = APG.methods.getSpriteList(this.numBlocks);
        blocks = blocks.sort(function(a,b){
           return APG.methods.getSpriteSite(a).x < APG.methods.getSpriteSite(b);
        });
        let flag = 1;
        for(let i = 0;i<blocks.length-1;i++){
            let num1 = APG.methods.aboutTextBitMap(blocks[i]).text;
            let num2 = APG.methods.aboutTextBitMap(blocks[i+1]).text;
            num1 = parseInt(num1);
            num2 = parseInt(num2);
            if(num1 > num2){
                flag = 0;
            }
        }
        if(flag){
            APG.methods.setAnimations(this.exports, 'light', [1]);
        }else{
            APG.methods.setAnimations(this.exports, 'dark', [0]);
        }
    },
    swapBlock: function(){
        /* 方向*/
        let dir = APG.methods.getCharacterDirection(this.player);
        /* 当前位置 */
        let site = APG.methods.getCharacterSite(this.player);
        /* 前方的块们 */
        let block = APG.methods.getSpritesFromSite(site.x, site.y+dir.y, this.numBlocks);
        /* 前方的左边的块们 */
        let blockLeft = APG.methods.getSpritesFromSite(site.x+dir.y, site.y+dir.y, this.numBlocks);

        if(block.length){
            let info = APG.methods.aboutTextBitMap(block[0]);
            if(info.text && blockLeft.length){
                let infoLeft = APG.methods.aboutTextBitMap(blockLeft[0]);
                APG.methods.loadTextBitMap(block[0], infoLeft.text);
                APG.methods.loadTextBitMap(blockLeft[0], info.text);
            }
        }
    },
    getBaoshi: function(player, baoshi){
        // 得到宝石
        console.log(this.xinbiaoSite);

        APG.methods.destroySprite(baoshi);
        if(this.xinbiaoSite.length){
            var site = APG.methods.getCharacterSite(player);
            var x = this.xinbiaoSite[this.xinbiaoSite.length-1]['x'];
            var y = this.xinbiaoSite[this.xinbiaoSite.length-1]['y'];
            APG.methods.moveCharacter(player, x, y);
            this.dropDaolu(site);
        }
    },
    export: function(){
        var site = APG.methods.getCharacterSite(this.player);
        var sprite = APG.methods.getSpritesFromSite(site.x,site.y,this.exports);
        var frame = APG.methods.getFrame(sprite[0]);
        if(frame == 1){
            let str = "贡献者:SuCicada\n" +
                "Click to GitHub";
            APG.methods.WIN(str,function(){
                window.location.href="https://github.com/SuCicada/ResetWorld"
            });
        }
    }
}