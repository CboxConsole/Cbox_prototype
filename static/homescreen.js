
// Cbox homescreen
// @ragingwind

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
		var $reflect = $('<canvas class="reflect"></canvas>');
		var $img = $('<img class="banner" src="' + this.options.game.banner + '"></img>');
		
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
			
			// @TODO performance issue with sdk
			if (true) {
				$v.remove()
				self.animate = false;
			}
			else {
				$v.animate({'opacity':0.1}, {
  				duration:150,
  				step: function(now) {if (now > 0.5 && now < 0.6) $v.remove()},
					complete: function() {self.animate = false;}
  			});
  		}
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
	initialize: function() {
		var games = this.options.games
	},
	render: function() {
		this.$el.append('<div id=android></div>');
		var views = [];
		_.each(this.options.games, function(game) {
			views.push(new Slider({game:game}).render())
		});

		this.sliderview = new SliderView({views:views}).render();		
		this.add(this.sliderview);
		this.sliderview.focusin();
		return this;
	}
});
