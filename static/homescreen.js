
// Cbox homescreen
// @ragingwind
// version: 0.0.1

var Slider = Backbone.View.extend({
	className:'slider',
	initialize: function() {
		_.bindAll(this, 'reflect');
	},
	reflect: function() {
		/*
			reflect code from greate article.
			"Cross-Browser CSS Reflections, Glows and Blurs" - http://goo.gl/iH72G
		*/
		var opt = {
			canvas: this.$canvas[0],
			img: this.$img[0],
			reflection: 0.5,
			bgcolor: '#000000',
			height:246,
			width:396
		};

		if (opt.canvas.getContext) {
            var ctx = opt.canvas.getContext("2d")
            ,	gradient = ctx.createLinearGradient(0, 0, 0, opt.height * opt.reflection);

            gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
            gradient.addColorStop(0, "rgba(255, 255, 255, " + (1 - opt.reflection) + ")");

            ctx.save();
            ctx.translate(0, opt.height - 1);
            ctx.scale(1, -1);
            ctx.drawImage(opt.img, 0, 0, opt.width, opt.height);
            ctx.restore();
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = opt.color;
            ctx.fillRect(0, opt.height * 0.5, opt.width, opt.height);
            ctx.fillStyle = gradient;
            ctx.rect(0, 0, opt.width, opt.height);
            ctx.fill();
            delete ctx, gradient;
        }
	},
	render: function() {
		this.$canvas = $('<canvas class="reflect"></canvas>');
		this.$img = $('<img class="banner" src="' + this.options.game.banner + '"></img>');

		this.$img.load(this.reflect);
		this.$el.append(this.$img);
		this.$el.append(this.$canvas);

		return this;
	}
});

var SliderView = Backbone.View.extend({
	max: 5,
	id: 'sliderview',
	top: 0,
	animate: false,
    keyevent: true,
    sounds: [],
	initialize: function() {
		this.on('keydown:left keydown:right', this.navigate, this);
		this.on('keydown:enter', function() {
            if (this.keyevent) {
                var v = this.options.views[this.top - 1];
                this.superview.trigger('game:select', v.options.game);
            }
		}, this);

        for (var i = 0; i < 5; ++i)
            this.sounds.push(new Audio('../sounds/slide.mp3'));
        this.sounds.index = 0;
	},
    playSound: function() {
        if (this.sounds.index >= this.sounds.length)
                this.sounds.index = 0
        this.sounds[this.sounds.index++].play();
    },
	navigate: function(v, e) {
        if (this.keyevent) {
            this.playSound();
            (e.keyid === 'left') ? this.enqueue() : this.dequeue();
        }
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

			// @DEPRECATD performance issue with sdk
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
		var games = this.options.games;
        // bind box selecting event to launch games.
        this.on('game:select', function(game) {
            // create and show game screen with the game parameter.
            if (game.url.indexOf('redirect://') < 0) {
                this.sliderview.keyevent = false;
                var gl = new GameLauncher({game:game, homescreen:this});
                $('body').append(gl.render().$el);
            }
            else
                window.open(game.url.split('redirect://')[1]);

        }, this);

        this.on('game:exit', function() {
            this.sliderview.keyevent = true;
        }, this);
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
	},

});
