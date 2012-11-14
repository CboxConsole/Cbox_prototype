$(document).ready(function() {
	var hs = window.homescreen = new Homescreen({games:GameConfig});
	$('body').append(hs.render().$el);
})
