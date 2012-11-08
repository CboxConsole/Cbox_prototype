/**
 * Created with PyCharm.
 * User: songhun
 * Date: 11/8/12
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */


var gameScript = $("#cboxscript").html();
eval(gameScript);

$(function(){
    pubsub.sub("controlls",function(msg){
        cboxgame.fireEvent(msg.data);
    });
});
