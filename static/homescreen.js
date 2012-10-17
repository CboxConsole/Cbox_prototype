var Box = Backbone.View.extend({
	className:'box',
	to:undefined,
	initialize: function() {
		this.on('keydown:up keydown:down keydown:right keydown:left', 
			this.navigate, this);
		this.to = {};
	},
	render: function() {
		if (this.options.game.title)
			this.$el.append('<div class="titlebar">' + this.options.game.title + '</div>');

		this.$el.css('background-image', 'url("games/' + this.options.game.banner + '")');
		return this;
	},
	navigate: function(v, e) {
		if (this.to[e.keyid]) this.to[e.keyid].focusin();
	}
});

var SideBox = Backbone.View.extend({
	className:'side',
	initialize: function() {
		this.boxes = {
			upper: new Box({id:'upper', game:this.options.games[0]}),
			down: new Box({id:'down', game:this.options.games[1]})
		}
		this.on('keyevent:focusin', function() {
			this.boxes.upper.focusin();
		}, this)
	},
	render: function() {
		_.each(this.boxes, function(p) {
			p.on('keydown:enter', function() {
				this.superview.trigger('box:select', p, p.options.game);
			}, this);
			this.add(p.render());}, this);
		return this;
	}
});

var Homescreen = Backbone.View.extend({
	className:'homescreen',
	initialize: function() {
		var games = this.options.games		
		this.boxes = {
			left: new SideBox({id:'left', games:[games[0], games[3]]}),
			center: new Box({id:'center', game:games[2]}),
			right: new SideBox({id:'right', games:[games[1], games[5]]})
		}

		this.boxes.center.on('keydown:enter', function() {
			this.trigger('box:select', this.boxes.center, this.boxes.center.options.game);
		}, this);
	},
	render: function() {
		// sub boxes added to boxes view
		_.each(this.boxes, function(p) {this.add(p.render());}, this);
		
		// mapping for key navigation
		var center = this.boxes.center
			,	left = this.boxes.left.boxes
			,	right = this.boxes.right.boxes;

		left.upper.to.right = center;
		left.upper.to.down = left.down;
		left.down.to.right = center;
		left.down.to.up = left.upper;

		right.upper.to.left = center;
		right.upper.to.down = right.down;
		right.down.to.left = center;
		right.down.to.up = right.upper;

		center.to.left = this.boxes.left;
		center.to.right = this.boxes.right;
		center.focusin();

		this.$el.append('<div class="shadow"></div>')

		return this;
	}
});
