$(document).ready(function() {
	// game list preset.
	var games = [
		{title:'킹콩! 동킹콩!', banner:'dkingkong.jpg', url:'static/game-sample.html'},
		{title:'벽돌깨기', banner:'breakout.jpg', url:'static/game-sample.html'},
		{title:'', banner:'padv.jpg', url:'static/game-sample.html'},
		{title:'늑대인간', banner:'ramface.jpg', url:'static/game-sample.html'},
		{title:'갤러그', banner:'garaga.gif', url:'static/game-sample.html'},
		{title:'슈퍼마리오', banner:'smario.jpg', url:'static/game-sample.html'}
	];

	// create a homescreen.
	var hs = window.homescreen = new Homescreen({games:games});

	// bind box selecting event to launch games.
	hs.on('box:select', function(box, game) {
		// create and show game screen with the game parameter.
		var gl = new GameLauncher({game:game});
		$('body').append(gl.render().$el);		
	});

	$('body').append(hs.render().$el);
})
