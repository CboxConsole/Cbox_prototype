var game = {
	score:0,
	prevScore:0,
	point:10,
	scoreWeight:0.0,
	timeLimit: 1000 * 60 * 3,
	time:0,
	userName:'도전자',
	gameTimer: undefined,
	keypos:0,
	event: function(e, param) {
		game[e].apply(game, arguments);
	},
	clearall: function() {
		game.stop();
	},
	hitbat: function() {
		game.scoreWeight = 0.0;
	},
	timeover: function() {
		game.stop();
	},
	response: function(res, opt) {},
	hitblock: function() {
		game.score += game.point * game.scoreWeight;
		game.scoreWeight += 0.2;

		document.getElementById('score').innerHTML = game.score;
	},
	outofbound: function() {
		game.breakout.setpos();
	},
	sendScore: function() {
		console.log('sendScore');
		ranking.trigger('breakout', 'score', {user_name:game.userName, score:game.score}, game.response);
		game.scoreTimer = setTimeout(game.sendScore, 3000);
	},
	stop: function() {
		clearTimeout(game.gameTimer);
		clearTimeout(game.scoreTimer);

		game.breakout.stop();
		ranking.trigger('breakout', 'end', {user_name:game.userName, score:game.score}, game.response);
		
		// back to homescreen
	},
	start: function() {
		var opt = {
			view: document.getElementById('surface'),
			fps: true,
			callback: game.event,
		};
		
		game.breakout = new Breakout(opt);
		setTimeout(function() {
			game.breakout.start();
			game.gameTimer = setTimeout(game.timer, 1000);

			game.userName = game.userName + new Date().getSeconds();
			ranking.trigger('breakout', 'start', {user_name:game.userName, score:0}, game.response);
		}, 1000);
	},
	timer: function() {
		game.time += 1000;
		var remain = game.timeLimit - game.time
			,	date = new Date(remain)
			, sec = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds()

		if (game.score > game.prevScore) {
			ranking.trigger('breakout', 'score', {user_name:game.userName, score:game.score}, game.response);
			game.prevScore = game.score;
		}

		document.getElementById('time').innerHTML = date.getMinutes() + ':' + sec;
		(remain > 0) ? (game.gameTimer = setTimeout(game.timer, 1000)) : game.event('timeover');
	},
	onkeypress: function(data) {
		if (data.type != 'Down' || game.keypos == data.pX1) return;
		game.breakout.onkeypress({which:game.keypos > data.pX1 ? 37 : 39});
		game.keypos = data.pX1;
	}
}


document.addEventListener("DOMContentLoaded", function() {
	ranking.host = 'http://192.168.100.73:8080';
	game.start();

	pubsub.sub("controlls",function(msg){
    game.onkeypress(msg.data);
  });
	
}, false);