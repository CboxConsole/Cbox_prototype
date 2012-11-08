$(document).ready(function() {
	// game list preset.
	var games = [
		{title:'CBox소개', banner:'games/breakout.png', url:'static/game-sample.html'},
		{title:'CBox소개2', banner:'games/penguin-adv.png', url:'http://localhost:5103/testgame.html'},
		{title:'각설탕쌓기', banner:'games/sugarpang.png', url:'static/game-sample.html'},
		{title:'벽돌깨기', banner:'games/breakout.png', url:'static/game-sample.html'},
		{title:'몽대륙', banner:'games/penguin-adv.png', url:'http://localhost:5103/testgame.html'}
	];

	// create a homescreen.
	var hs = window.homescreen = new Homescreen({games:games});

	// bind box selecting event to launch games.
	hs.on('game:select', function(game) {
		// create and show game screen with the game parameter.
		var gl = new GameLauncher({game:game});
		$('body').append(gl.render().$el);		
	});

	$('body').append(hs.render().$el);
})
