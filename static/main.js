$(document).ready(function() {
	// create a homescreen.
	var hs = window.homescreen = new Homescreen({games:GameConfig});

	// bind box selecting event to launch games.
	hs.on('game:select', function(game) {
		// create and show game screen with the game parameter.
		var gl = new GameLauncher({game:game});
		$('body').append(gl.render().$el);		
	});

	$('body').append(hs.render().$el);
})
