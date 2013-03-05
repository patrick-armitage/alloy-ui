AUI.add('aui-scroll', function(A) {
/**
 * The Scroll Event Utility
 *
 * @module aui-scroll
 */

var Lang = A.Lang,
	isNumber = Lang.isNumber,
	isString = Lang.isString,
	HOST = 'host',
	NAME = 'scroll',

	UP = 'up',
	DOWN = 'down',
	RIGHT = 'right',
	LEFT = 'left',

	APPROACHING = '-approaching',
	EDGE = '-edge',
	SNAP = '-snap',
	START = '-start',

	SCROLL = NAME,

	getClassName = A.getClassName,

	CSS_ = getClassName(NAME);
/**
 *
 * Fires events for scroll directions and node boundaries
 *
 * Quick Example:<br/>
 *
 *	<pre><code>
 *		node.plug(A.Scroll);
 *		node.scroll.on('down-edge', function(event) {
 *			alert('we scrolled to the bottom!');
 *		});
 *	</code></pre>
 *
 *
 * @class Scroll
 * @constructor
 * @extends Plugin.Base
 */

var Scroll = A.Component.create(
	{
		/**
		 * Static property provides a string to identify the class.
		 *
		 * @property Scroll.NAME
		 * @type String
		 * @static
		 */
		NAME: NAME,

		/**
		 * Static property provides a string to identify the namespace.
		 *
		 * @property Scroll.NS
		 * @type String
		 * @static
		 */
		NS: NAME,

		/**
		 * Static property used to define the default attribute
		 * configuration for the Scroll.
		 *
		 * @property Scroll.ATTRS
		 * @type Object
		 * @static
		 */
		ATTRS: {
			/**
			 * The number of milliseconds that the _onScroll method should be delayed by.
			 *
			 * @attribute delay
			 * @type Number
			 */
			delay: {
				value: null,
				validator: isNumber
			},

			/**
			 * The state of the previous scroll event.
			 *
			 * @attribute lastState
			 * @type Object
			 */
			lastState: {
				value:
					{
						scrollLeft: 0,
						scrollTop: 0
					}
			},

			/**
			 * The maximum XY-coordinate or Width/Height of the scrollable host node.
			 *
			 * @attribute maxCoordinate
			 * @type Object
			 */
			maxCoordinate: {
				value: null
			},

			/**
			 * The distance between the edge and the beginning of an area whose
			 * scroll instance will fire an "-edge-approaching" event.
			 *
			 * @attribute tolerance
			 */
			tolerance: {
				value: null,
				setter: function(val) {
					var instance = this;

					var value = 0;

					if (isNumber(val)) {
						value = val;
					}
					else if (isString(val)) {
						if (/px$/.test(val)) {
							value = parseInt(val.substring(0, val.length - 2), 10);
						}
						else if (/^\d+$/.test(val)) {
							value = parseInt(val, 10);
						}
					}

					return value;
				}
			}
		},

		EXTENDS: A.Plugin.Base,

		prototype: {
			/**
			 * Construction logic executed during LoadingMask instantiation. Lifecycle.
			 *
			 * @method initializer
			 * @protected
			 */
			initializer: function(config) {
				var instance = this;

				instance.set('tolerance', config.tolerance);

				var host = A.one(config.host);

				instance._host = host;

				host.on(SCROLL, A.bind(instance._onScroll, instance));

				instance._reset();
			},
			_onScroll: function(event) {
				var instance = this;

				var lastState = instance.get('lastState');

				var maxCoordinate = instance.get('maxCoordinate');

				var node = instance._host._node;

				var scrollLeft = (node.scrollX || node.scrollLeft);
				var scrollTop = (node.scrollY || node.scrollTop);
				var scrolledDown = (scrollTop > lastState.scrollTop);
				var scrolledLeft = (scrollLeft < lastState.scrollLeft);
				var scrolledRight = (scrollLeft > lastState.scrollLeft);
				var scrolledUp = (scrollTop < lastState.scrollTop);
				var scrollSnapX = (scrollLeft - maxCoordinate.x);
				var scrollSnapY = (scrollTop - maxCoordinate.y);

				var state = {
					scrolledDown: scrolledDown,
					scrolledLeft: scrolledLeft,
					scrolledRight: scrolledRight,
					scrolledUp: scrolledUp,
					scrollSnapX: scrollSnapX,
					scrollSnapY: scrollSnapY,
					scrollLeft: scrollLeft,
					scrollTop: scrollTop
				};

				var tolerance = instance.get('tolerance');

				// Up

				if (scrolledUp) {
					instance.fire(UP, state);

					if ((scrollTop - tolerance) <= 0) {
						instance.fire(UP + EDGE, state);
					}

					if (scrollTop < 0) {
						instance.fire(UP + SNAP, state);

						if (lastState.scrollSnapY >= 0) {
							instance.fire(UP + SNAP + START, state);
						}
					}

					if (!lastState.scrolledTop) {
						instance.fire(UP + START, state);
					}
				}

				// Down

				if (scrolledDown) {
					instance.fire(DOWN, state);

					if ((scrollSnapY + tolerance) >= 0) {
						instance.fire(DOWN + EDGE, state);
					}

					if (scrollSnapY > 0) {
						instance.fire(DOWN + SNAP, state);

						if (lastState.scrollSnapY < 1) {
							instance.fire(DOWN + SNAP + START, state);
						}
					}

					if (!lastState.scrolledDown) {
						instance.fire(DOWN + START, state);
					}
				}

				// Left

				if (scrolledLeft) {
					instance.fire(LEFT, state);

					if ((scrollLeft - tolerance) <= 0) {
						instance.fire(LEFT + EDGE, state);
					}

					if (scrollSnapX > 0) {
						instance.fire(LEFT + SNAP, state);

						if (lastState.scrollSnapX < 1) {
							instance.fire(LEFT + SNAP + START, state);
						}
					}

					if (!lastState.scroledlLeft) {
						instance.fire(LEFT + START, state);
					}
				}

				// Right

				if (scrolledRight) {
					instance.fire(RIGHT, state);

					if ((scrollSnapX + tolerance) >= 0) {
						instance.fire(RIGHT + EDGE, state);
					}

					if (scrollSnapX > 0) {
						instance.fire(RIGHT + SNAP, state);

						if (lastState.scrollSnapX < 1) {
							instance.fire(RIGHT + SNAP + START, state);
						}
					}

					if (!lastState.scrolledRight) {
						instance.fire(RIGHT + START, state);
					}
				}

				// Reset

				if ((scrollTop < 0) || (scrollSnapX > 0) || (scrollSnapY > 0) || (scrollLeft < 0)) {
					instance._reset();
				}

				instance.set('lastState', state);

				clearTimeout(instance._delay);

				instance._delay = setTimeout(instance._reset.bind(instance), instance.get('delay'));
			},

			_reset: function() {
				var instance = this;

				var lastState = instance.get('lastState');

				lastState.scrollSnapX = 0;
				lastState.scrollSnapY = 0;

				instance.set('lastState', lastState);

				var host = instance._host;

				var node = host._node;

				instance.set(
					'maxCoordinate',
					{
						x: (node.scrollMaxX || node.scrollWidth) - host.innerWidth(),
						y: (node.scrollMaxY || node.scrollHeight) - host.innerHeight()
					}
				);
			}
		}
	}
);

A.Scroll = Scroll;

}, '@VERSION@' ,{requires:['aui-base'], skinnable:false});
