var GameLauncher = Backbone.View.extend({
	className:'game-launcher',
	initialize: function() {
		this.on('hkeydown:esc', function() {
			this.remove();
			this.trigger('launcher:exit');
		}, this);
	},
	render: function() {
		var frame = ['<iframe class="game-sandbox" src="', this.options.game.url, '" >'].join('');
		this.$el.append(frame);
		return this;
	},
	navigate: function(v, e) {
		if (this.to[e.keyid]) this.to[e.keyid].focusin();
	}
});