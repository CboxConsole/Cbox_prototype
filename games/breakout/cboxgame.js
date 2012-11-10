var cboxgame = {
  fireEvent : function(data){
  	var game = $('.game-sandbox').contents().game;
  	console.log(window.frames);
  	console.log(window.frames['game-sandbox']);
  	console.log(window.frames['game-sandbox'].document);
  	// game.onkeypress(data);
  }
};
