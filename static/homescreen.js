// var Box = Backbone.View.extend({
// 	className:'box',
// 	to:undefined,
// 	initialize: function() {
// 		this.on('keydown:up keydown:down keydown:right keydown:left', 
// 			this.navigate, this);
// 		this.to = {};
// 	},
// 	render: function() {
// 		if (this.options.game.title)
// 			this.$el.append('<div class="titlebar">' + this.options.game.title + '</div>');

// 		this.$el.css('background-image', 'url("games/' + this.options.game.banner + '")');
// 		return this;
// 	},
// 	navigate: function(v, e) {
// 		if (this.to[e.keyid]) this.to[e.keyid].focusin();
// 	}
// });

// var SideBox = Backbone.View.extend({
// 	className:'side',
// 	initialize: function() {
// 		this.boxes = {
// 			upper: new Box({id:'upper', game:this.options.games[0]}),
// 			down: new Box({id:'down', game:this.options.games[1]})
// 		}
// 		this.on('keyevent:focusin', function() {
// 			this.boxes.upper.focusin();
// 		}, this)
// 	},
// 	render: function() {
// 		_.each(this.boxes, function(p) {
// 			p.on('keydown:enter', function() {
// 				this.superview.trigger('box:select', p, p.options.game);
// 			}, this);
// 			this.add(p.render());}, this);
// 		return this;
// 	}
// });

var Slider = Backbone.View.extend({
	className:'slider',
	initialize: function() {
		_.bindAll(this, 'reflect');
	},
	reflect: function(can, arg) {
		var i = arg.img.clone()[0];
		if (can.getContext) {
        var ctx = can.getContext("2d");
        ctx.save();
        ctx.translate(0, arg.height - 1);
        ctx.scale(1, -1);
        ctx.drawImage(i, 0, 0, arg.width, arg.height);
        ctx.restore();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = arg.color;
        ctx.fillRect(0, arg.height * 0.5, arg.width, arg.height);
        var gra = ctx.createLinearGradient(0, 0, 0, arg.height * arg.ref);
        gra.addColorStop(1, "rgba(255, 255, 255, 1.0)");
        gra.addColorStop(0, "rgba(255, 255, 255, " + (1 - arg.ref) + ")");
        ctx.fillStyle = gra;
        ctx.rect(0, 0, arg.width, arg.height);
        ctx.fill();
        delete ctx, gra;
      }
	},
	render: function() {
		var bg = 'url(' + this.options.game.banner + ')';
		var $reflect = $('<canvas class="reflect"></canvas>');
		var $img = $('<img class="banner"></img>');
		$img.attr('src', this.options.game.banner);
		this.$el.append($img);
		this.$el.append($reflect[0]);

		this.options.reflection = 0.5;
		this.options.bgColor =  '#00F';
		var self = this;
		$img.load(function() {
      self.reflect($reflect[0], {
      'img': $img,
      'ref': self.options.reflection,
      'height': 246, // this.$el.height(),
      'width': 396, //this.$el.width(),
      'color': self.options.bgColor});
    });

		
	// 	setTimeout(function() {
	// 		var c=document.getElementById("myCanvas2");
	// 	var ctx=c.getContext("2d");
	// 	console.log(ctx);
	// 	ctx.fillRect(20,20,150,100);
	// }, 100);
		

		return this;
	}
});

var SliderView = Backbone.View.extend({
	max: 5,
	id: 'sliderview',
	top: 0,
	animate: false,
	initialize: function() {
		this.on('keydown:left keydown:right', this.navigate, this);
		this.on('keydown:enter', function() {
			var v = this.options.views[this.top - 1];
			this.superview.trigger('game:select', v.options.game);
		}, this);
	},
	navigate: function(v, e) {
		(e.keyid === 'right') ? this.enqueue() : this.dequeue();
	},
	enqueue: function() {
		var v = this.options.views[this.top];
		if (v) {
			var $s = this.$el.children('.slider');
			if ($s.length >= this.max)
				$($s[$s.length - 1]).remove();

			v.$el.css('opacity', 1);
			this.$el.prepend(v.$el);

			this.top++;
		}
	},
	dequeue: function() {
		if (this.animate) return;
		if (this.top > 1) {
			var self = this
				,	$v = $(self.$el.children('.slider')[0]);
			
			this.top--;
			self.animate = true;

			$v.animate({'opacity':0.5}, {
  			duration:150,
  			step: function(now) {!(now > 0.5 && now < 0.6) || $v.remove()},
				complete: function() {self.animate = false;}
  		});
		}
	},
	render: function() {
		this.top = 0;
		for (var i = 0; i < this.options.views.length; ++i) {
			this.enqueue();
		}
		
		return this;
	}
});

var Homescreen = Backbone.View.extend({
	className:'homescreen',
	boxes: undefined,
	initialize: function() {
		var games = this.options.games
		this.boxes = undefined;

		// this.boxes = {
		// 	left: new SideBox({id:'left', games:[games[0], games[3]]}),
		// 	center: new Box({id:'center', game:games[2]}),
		// 	right: new SideBox({id:'right', games:[games[1], games[5]]})
		// }

		// this.boxes.center.on('keydown:enter', function() {
		// 	this.trigger('box:select', this.boxes.center, this.boxes.center.options.game);
		// }, this);
	},
	render: function() {
		this.$el.append('<div id=android></div>');
		var views = [];
		_.each(this.options.games, function(game) {
			views.push(new Slider({game:game}).render())
		});

		this.sliderview = new SliderView({views:views}).render();
		

		// this.focusBox(0);

		// sub boxes added to boxes view
			// _.each(this.boxes, function(p) {this.add(p.render());}, this);
			
			// // mapping for key navigation
			// var center = this.boxes.center
			// 	,	left = this.boxes.left.boxes
			// 	,	right = this.boxes.right.boxes;

			// left.upper.to.right = center;
			// left.upper.to.down = left.down;
			// left.down.to.right = center;
			// left.down.to.up = left.upper;

			// right.upper.to.left = center;
			// right.upper.to.down = right.down;
			// right.down.to.left = center;
			// right.down.to.up = right.upper;

			// center.to.left = this.boxes.left;
			// center.to.right = this.boxes.right;
			// center.focusin();

			// this.$el.append('<div class="shadow"></div>')
		this.$el.append(this.sliderview.$el);
		this.sliderview.focusin();
		return this;
	}
});
