/**
* Gumby Fixed
*/
!function() {

	'use strict';

	function Fixed($el) {
		this.$el = $el;
		this.fixedPoint = this.parseAttrValue(Gumby.selectAttr.apply(this.$el, ['fixed']));
		this.pinPoint = Gumby.selectAttr.apply(this.$el, ['pin']) || false;
		this.offset = Number(Gumby.selectAttr.apply(this.$el, ['offset'])) || 0;
		this.top = Number(Gumby.selectAttr.apply(this.$el, ['top'])) || 0;
		this.pinOffset = Number(Gumby.selectAttr.apply(this.$el, ['pinoffset'])) || 0;
		this.$parent = this.$el.parents('.columns, .column, .row').first();
		this.parentRow = !!this.$parent.hasClass('row');
		this.state = false;
		this.measurements = {
			left: 0,
			width: 0
		};

		if(this.pinPoint) {
			this.pinPoint = this.parseAttrValue(this.pinPoint);
		}

		var scope = this,
			$window = $(window);

		$window.scroll(function() {
			scope.monitorScroll();
		});

		if(this.$parent) {
			this.measure();
			$window.resize(function() {
				scope.measure();
				scope.constrain();
			});
		}
	}

	// monitor scroll and trigger changes based on position
	Fixed.prototype.monitorScroll = function() {
		var scrollAmount = $(window).scrollTop(),
			// recalculate selector attributes as position may have changed
			fixedPoint = this.fixedPoint instanceof jQuery ? this.fixedPoint.offset().top : this.fixedPoint,
			pinPoint = false;

		if(this.pinPoint) {
			pinPoint = this.pinPoint instanceof jQuery ? this.pinPoint.offset().top : this.pinPoint;
		}

		if(this.offset) {
			fixedPoint -= this.offset;
		}

		if(this.pinOffset) {
			pinPoint -= this.pinOffset;
		}

		// fix it
		if((scrollAmount >= fixedPoint) && this.state !== 'fixed') {
			if(!pinPoint || scrollAmount < pinPoint) {
				this.fix();
			}
		// unfix it
		} else if(scrollAmount < fixedPoint && this.state === 'fixed') {
			this.unfix();

		// pin it
		} else if(pinPoint && scrollAmount >= pinPoint && this.state !== 'pinned') {
			this.pin();
		}
	};

	// fix the element and update state
	Fixed.prototype.fix = function() {
		this.state = 'fixed';
		this.$el.css({
			'top' : 0 + this.top
		}).addClass('fixed').removeClass('pinned');
		this.constrain();
	};

	// unfix the element and update state
	Fixed.prototype.unfix = function() {
		this.state = 'unfixed';
		this.$el.attr('style', '').removeClass('fixed pinned');
	};

	Fixed.prototype.pin = function() {
		console.log("PIN");
		this.state = 'pinned';
		this.$el.css({
			'top' : this.$el.offset().top
		}).addClass('pinned');
	};

	Fixed.prototype.constrain = function() {
		this.$el.css({
			left: this.measurements.left,
			width: this.measurements.width
		});
	};

	Fixed.prototype.measure = function() {
		var offsets = this.$parent.offset(), parentPadding;

		this.measurements.left = offsets.left;
		this.measurements.width = this.$parent.width();

		if(this.parentRow) {
			parentPadding = Number(this.$parent.css('paddingLeft').replace(/px/, ''));
			if(parentPadding) {
				this.measurements.left += parentPadding;
			}
		}
	};

	// parse attribute values, could be px, top, selector
	Fixed.prototype.parseAttrValue = function(attr) {
		// px value fixed point
		if($.isNumeric(attr)) {
			return Number(attr);
		// 'top' string fixed point
		} else if(attr === 'top') {
			return this.$el.offset().top;
		// selector specified
		} else {
			var $el = $(attr);
			return $el;
		}
	};

	// add initialisation
	Gumby.addInitalisation('fixed', function() {
		$('[data-fixed],[gumby-fixed],[fixed]').each(function() {
			var $this = $(this);
			// this element has already been initialized
			if($this.data('isFixed')) {
				return true;
			}
			// mark element as initialized
			$this.data('isFixed', true);
			new Fixed($this);
		});
	});

	// register UI module
	Gumby.UIModule({
		module: 'fixed',
		events: ['onFixed', 'onUnfixed'],
		init: function() {
			Gumby.initialize('fixed');
		}
	});
}();
