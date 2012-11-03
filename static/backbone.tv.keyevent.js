// backbone.tv.keyevent
// extend library of backbone.js for tv keyevent
// 
// version 0.1.0
// copyright 2012, @ragingwind
// use of this source code is governed by a MIT license

(function(root, factory) {
	if (typeof exports !== 'undefined') {
		factory(root, exports, require('underscore'), require('backbone'));
	} 
	else if (typeof define === 'function' && define.amd) {
		define(['underscore', 'backbone', 'jquery'], function(_, Backbone, $) {
			factory(root, _, Backbone, $);
		});
	} 
	else {
		factory(root, root._, root.Backbone, root.$);
	}
}(this, function(root, _, Backbone, $) {
	
	// backbone.tv keyevent explicity supports events below.
	// tv remote doesn't supports combinate keys.
	// if you want to handle an another event you should register
	// event with * (-1, all key events from body).
	var KeyCodes = Backbone.KeyCodes = {
		'left': 37,
		'up': 38,
		'right': 39,
		'down': 40,
		'enter': 13,
		'back': 8,
		'esc': 27,
		'alt': 18,
		'*': -1
	};

	// KeyEvent object. will be pass to event handler
	var KeyEvent = function(event, callback, context) {
		this.keycode = -1;
		this.event = event;
		this.horizon = false;
		this.vertical = false;
		this.type = false;
		this.callback = callback;
		this.keyid = '';
		this.context = context;
		this.cancelBubble = false;

		var props = this.event.split(':');

		if (!props.length || props.length < 2) 
			throw 'Key event has an invalid format, should be like as "keydown:enter"';

		this.type = props[0];
		this.keyid = props[1];
		this.horizon = (this.keyid == 'left' || this.keyid == 'right');
		this.vertical = (this.keyid == 'up' || this.keyid == 'down');
		this.keycode = KeyCodes[this.keyid];

		if (!this.keycode)
			throw 'Key type has an wrong value, should be used in Backbone.KeyCodes';

		return this;
	}

	// key event listener, it's singleton key event.
	var KeyEventListener = Backbone.KeyEventListener = {
		// first(front/focus) responder
		_responder: undefined,
		// last key event
		_event: undefined,
		// hotkyes
		_hotkeys: undefined,
		responder: function() {
			return this._responder;
		},
		event: function() {
			return this._event ? this._event : (this._event = {});
		},
		focusin: function(r) {
			KeyEventListener._responder = r;
		},
		focusout: function(r) {
			KeyEventListener.focused(r) && (KeyEventListener._responder = undefined);
		},
		focused: function(r) {
			return (KeyEventListener.responder() === r);
		},
		_dispatch: function(events, keyevent, responder) {
			_.all(events, function(ke) {
					if (ke.callback && ke.type == keyevent.type) {					
						// save last key event to KeyEventListener
						ke.origin = keyevent;
						KeyEventListener._event = ke;
						var ret = ke.callback.call((ke.context || responder), responder, ke);
						// supports cancel event by return value or cancelBubble property 
						// of origin keyke.origin = keyevent event
						if (ret || ke.origin.cancelBubble) {
							keyevent.stopPropagation();
							return false;
						}
						return true;
					}
				}
			, this);
		},
		trigger: function(keyevent) {
			// the events can handle that occurred at body element only.
			// if (!(keyevent.srcElement instanceof HTMLBodyElement)) return this;
			var r = KeyEventListener.responder()
				,	events = KeyEventListener._hotkeys[keyevent.which];

			// hotkey dispatch first to handler
			KeyEventListener._dispatch(events, keyevent, r);
			
			// dispatch key event to front responder view
			if (r && r.keyEvents && r.$el.is(":visible")) {
				events = r.keyEvents[-1] ? r.keyEvents[-1] : r.keyEvents[keyevent.which];
				KeyEventListener._dispatch(events, keyevent, r);
			}
			return this;
		},
		on: function(events, callback, context) {
			var keyEvents = this.keyEvents || (this.keyEvents = {})
				,	hotKeyEvents = KeyEventListener._hotkeys || (KeyEventListener._hotkeys = {})
				,	event;

			events = events.split(/\s+/);
			while (event = events.shift()) {
				if (event.match(/^hkey.*:/)) {
					event = new KeyEvent(event.substring(1), callback, context ? context : this);
					hotKeyEvents[event.keycode] || (hotKeyEvents[event.keycode] = []);
					hotKeyEvents[event.keycode].push(event);
				}
				else {
					event = new KeyEvent(event, callback, context ? context : this);
					keyEvents[event.keycode] || (keyEvents[event.keycode] = []);
					keyEvents[event.keycode].push(event);
				}
			}
		},
		off: function(events, callback, context) {
			var event;
			events = events.split(/\s+/);
			while (event = events.shift()) {
				event = new KeyEvent(event, callback, context ? context : this);
				var keyEvents = this.keyEvents[event.keycode];
				_.all(keyEvents, function(ke) {
					if (ke.event == event.event && ke.callback === event.callback 
								&& (ke.context && event.context) 
								&& ke.context.cid == event.context.cid) {
						keyEvents = _.without(keyEvents, ke);
						return true;
					}
				}, this);
				this.keyEvents[event.keycode] = keyEvents;
			}
		}
	};

	$(document).ready(function() {
		// register key event.
		
		// document.body.addEventListener('keyup', Backbone.KeyEventListener.trigger);
		// document.body.addEventListener('keydown', Backbone.KeyEventListener.trigger);

		cbox.previousEvent = {
			pX1: 0,
			pY1: 0
		}

		cbox.addEventListener(function(event, context, cbox) {
			if (event.type != 'Down') return;

			var keycode = undefined;
			if (cbox.previousEvent.pX1 < event.pX1)
				keycode = 39;
			else if (cbox.previousEvent.pX1 > event.pX1)
				keycode = 37;
			if (cbox.previousEvent.pY1 < event.pY1)
				keycode = 40;
			else if (cbox.previousEvent.pY1 > event.pY1)
				keycode = 38;
			else if (event.btnA)
				keycode = 13;
			else if (event.btnB)
				keycode = 27;

			// hard copy events
			cbox.previousEvent.pX1 = event.pX1;
			cbox.previousEvent.pY1 = event.pY1;
			cbox.previousEvent.type = event.type;

			if (keycode) {
				var ke = document.createEvent("KeyboardEvent");
				// Chromium Hack, http://goo.gl/QNwqH
	    	Object.defineProperty(ke, 'keyCode', {get : function() {return this.keyCodeVal;}});
	    	Object.defineProperty(ke, 'which', {get : function() {return this.keyCodeVal;}});

				ke.initKeyboardEvent(event.type == 'Down' ? 'keydown' : 'keyup', 
					true, true, null, false, false, false, false, keycode, keycode);
				ke.keyCodeVal = keycode;

				Backbone.KeyEventListener.trigger(ke);
			}
		});
	});
	

	// event extension for tv.keyevent. it will be extended with Backbone.View class
	var Events = {
		_eventcall: function(type, events, callback, context) {
			var keyevent = (events.match(/^(h|)key(down|up):/))
				,	event = keyevent ? Backbone.KeyEventListener : Backbone.Events;
			event[type].call(this, events, callback, context);
		},
		on: function(events, callback, context) {
			this._eventcall('on', events, callback, context);
			return this;
		},
		off: function(events, callback, context) {
			this._eventcall('off', events, callback, context);
			return this;
		},
		_triggerFocus: function(type) {
			(type == 'focusin') ? this.$el.addClass('focus') : this.$el.removeClass('focus');
			this.trigger('keyevent:' + type, {hasFocus:(type == 'focusin')
				, keyevent:KeyEventListener.event()});
		},
		focusin: function() {
			// focus out of prev responder.		
			var responder = Backbone.KeyEventListener.responder();
			if (responder) responder.focusout();

			// focus into current responder.
			KeyEventListener.focusin(this);
			this._triggerFocus('focusin');
			return this;
		},
		focusout: function() {
			this._triggerFocus('focusout');	
			KeyEventListener.focusout(this);
			return this;
		},
		focused: function() {
			return KeyEventListener.focused(this);
		}
	};

	// view extenstion features for Backbone.View
	var ViewExtension = {
		subviews: undefined,
		superview: undefined,
		add: function(v) {
			this.subviews || (this.subviews = (function() {
				var subviews = [];
				subviews.getByCid = function(cid) {
					return _.find(this, function(v) {
						return v.cid == cid;
					}, this);
				}

				return subviews;
			})());

			// set subview information, make list each view
			this.subviews.push(v);			
			var index = this.subviews.length - 1;
			v.subview = {
				index: index,
				prev: (index - 1 >= 0) ? this.subviews[index - 1] : undefined,
				next: undefined
			}

			// set superview
			if (v.subview.prev) v.subview.prev.subview.next = v;
			v.superview = this;

			// append element to the view
			this.$el.append(v.$el);
			return this;
		},
		remove: function() {
			if (this.superview)
				this.superview.subviews[this.cid] = undefined;
			// backbone original remove code
			this.$el.remove();
	    return this;
		},	
		style: {
			append: function(opt) {
				var link = document.createElement('link');
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.href = opt.href;
				link.media = (opt.media) ? opt.media : 'screen';
				document.getElementsByTagName("head")[0].appendChild(link);
			},
			remove: function(opt) {
				$('link[href*="' + opt.href + '"]').remove();
			}
		}
	};

	// view has extended with new event that supports key event.
	_.extend(Backbone.View.prototype, Events, ViewExtension);

  return Backbone;
}));