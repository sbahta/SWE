'use strict';

/**
 * Accordion block functionality
 *
 * @author Shannon MacMillan, Corey Collins
 */
window.accordionBlockToggle = {};
(function (window, $, app) {

	// Constructor
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things
	app.cache = function () {
		app.$c = {
			window: $(window),
			html: $('html'),
			accordion: $('.accordion'),
			items: $('.accordion-item'),
			headers: $('.accordion-item-header'),
			contents: $('.accordion-item-content'),
			button: $('.accordion-item-toggle'),
			anchorID: $(window.location.hash)
		};
	};

	// Combine all events
	app.bindEvents = function () {
		app.$c.headers.on('click touchstart', app.toggleAccordion);
		app.$c.button.on('click touchstart', app.toggleAccordion);
		app.$c.window.on('load', app.openHashAccordion);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.accordion.length;
	};

	app.toggleAccordion = function () {

		// Add the open class to the item.
		$(this).parents('.accordion-item').toggleClass('open');

		// Is this one expanded?
		var isExpanded = $(this).parents('.accordion-item').hasClass('open');

		// Set this button's aria-expanded value.
		$(this).parents('.accordion-item').find('.accordion-item-toggle').attr('aria-expanded', isExpanded ? 'true' : 'false');

		// Set all other items in this block to aria-hidden=true.
		$(this).parents('.accordion-block').find('.accordion-item-content').not($(this).parents('.accordion-item')).attr('aria-hidden', 'true');

		// Set this item to aria-hidden=false.
		$(this).parents('.accordion-item').find('.accordion-item-content').attr('aria-hidden', isExpanded ? 'false' : 'true');

		// Hide the other panels.
		$(this).parents('.accordion-block').find('.accordion-item').not($(this).parents('.accordion-item')).removeClass('open');
		$(this).parents('.accordion-block').find('.accordion-item-toggle').not($(this)).attr('aria-expanded', 'false');

		return false;
	};

	app.openHashAccordion = function () {

		if (!app.$c.anchorID.selector) {
			return;
		}

		// Trigger a click on the button closest to this accordion.
		app.$c.anchorID.parents('.accordion-item').find('.accordion-item-toggle').trigger('click');

		// Not setting a cached variable as it doesn't seem to grab the height properly.
		var adminBarHeight = $('#wpadminbar').length ? $('#wpadminbar').height() : 0;

		// Animate to the div for a nicer experience.
		app.$c.html.animate({
			scrollTop: app.$c.anchorID.offset().top - adminBarHeight
		}, 'slow');
	};

	// Engage
	app.init();
})(window, jQuery, window.accordionBlockToggle);
'use strict';

/**
 * File carousel.js
 *
 * Deal with the Slick carousel.
 */
window.wdsCarousel = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			window: $(window),
			theCarousel: $('.carousel')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.doSlick);
		app.$c.window.on('load', app.doFirstAnimation);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.theCarousel.length;
	};

	// Animate the first slide on window load.
	app.doFirstAnimation = function () {

		// Get the first slide content area and animation attribute.
		var firstSlide = app.$c.theCarousel.find('[data-slick-index=0]'),
		    firstSlideContent = firstSlide.find('.slide-content'),
		    firstAnimation = firstSlideContent.attr('data-animation');

		// Add the animation class to the first slide.
		firstSlideContent.addClass(firstAnimation);
	};

	// Animate the slide content.
	app.doAnimation = function () {
		var slides = $('.slide'),
		    activeSlide = $('.slick-current'),
		    activeContent = activeSlide.find('.slide-content'),


		// This is a string like so: 'animated someCssClass'.
		animationClass = activeContent.attr('data-animation'),
		    splitAnimation = animationClass.split(' '),


		// This is the 'animated' class.
		animationTrigger = splitAnimation[0];

		// Go through each slide to see if we've already set animation classes.
		slides.each(function () {
			var slideContent = $(this).find('.slide-content');

			// If we've set animation classes on a slide, remove them.
			if (slideContent.hasClass('animated')) {

				// Get the last class, which is the animate.css class.
				var lastClass = slideContent.attr('class').split(' ').pop();

				// Remove both animation classes.
				slideContent.removeClass(lastClass).removeClass(animationTrigger);
			}
		});

		// Add animation classes after slide is in view.
		activeContent.addClass(animationClass);
	};

	// Allow background videos to autoplay.
	app.playBackgroundVideos = function () {

		// Get all the videos in our slides object.
		$('video').each(function () {

			// Let them autoplay. TODO: Possibly change this later to only play the visible slide video.
			this.play();
		});
	};

	// Kick off Slick.
	app.doSlick = function () {
		app.$c.theCarousel.on('init', app.playBackgroundVideos);

		app.$c.theCarousel.slick({
			autoplay: true,
			autoplaySpeed: 5000,
			arrows: true,
			dots: true,
			focusOnSelect: true,
			waitForAnimate: true
		});

		app.$c.theCarousel.on('afterChange', app.doAnimation);
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsCarousel);
'use strict';

/**
 * File: events.js
 *
 * Adjusts the date to correct format on event archive page.
 */
window.wdsEvents = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things, but mostly the header.
	app.cache = function () {
		app.$c = {
			document: $(document),
			window: $(window),
			eventPage: $('.post-type-archive-tribe_events, .single-tribe_events'),
			locationField: $('#tribe-bar-form .search input'),
			categoryField: $('#tribe-bar-form .category select'),
			flagEvent: $('.flag-event'),
			tribeBar: $('#tribe-bar-form')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.inifiteScroll);
		app.$c.locationField.on('keyup', app.debounce(app.searchEvents, 500));
		app.$c.categoryField.on('change', app.searchEvents);
		app.$c.eventPage.on('click', '.button-share-this', app.showShareButtons);
		app.$c.eventPage.on('click', '.button-flag-this', app.showFlagModal);
		app.$c.flagEvent.on('submit', 'form', app.flagEventReport);

		// Reset for tabindex.
		$.featherlight._callbackChain.beforeOpen = function () {

			// http://stackoverflow.com/q/42234790/470749.
			// By overriding this function, I can prevent the messing up of tabindex values done by: https://github.com/noelboss/featherlight/blob/master/src/featherlight.js#L559
		};

		$.featherlight._callbackChain.afterClose = function () {

			// See note above in $.featherlight._callbackChain.beforeOpen.
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.eventPage.length;
	};

	app.inifiteScroll = function () {
		$('.tribe-events-loop').infiniteScroll({
			path: '.tribe-events-nav-right a',
			append: '.event-post',
			status: '.page-load-status',
			history: false
		});
	};

	// Search events.
	app.searchEvents = function () {
		app.$c.tribeBar.submit();
	};

	// Show social warefare share buttons.
	app.showShareButtons = function (event) {
		event.preventDefault();

		var eventPost = $(this).parents('.event-post');

		eventPost.find('.swp_social_panel').slideToggle();
	};

	// Show flagging modal.
	app.showFlagModal = function (event) {
		event.preventDefault();

		var eventPost = $(this).parents('.event-post');
		var title = eventPost.find('.event-post-title').text();
		var url = eventPost.find('.event-post-title a').attr('href');

		$.featherlight('.flag-event', {
			afterOpen: function afterOpen() {
				var content = $(this.$content);
				var recaptcha = content.find('.google-recaptcha');
				content.find('input[name=url]').val(url);
				content.find('input[name=title]').val(title);

				if (recaptcha.length) {
					window.grecaptcha.render(recaptcha[0], { sitekey: recaptcha.attr('data-sitekey') });
				}
			}
		});
	};

	// Submit flag event report.
	app.flagEventReport = function (event) {
		event.preventDefault();

		var swe = window.swe;
		var name = $(this).find('input[name=username]').val();
		var email = $(this).find('input[name=email]').val();
		var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		var recaptcha = ' ';

		if ('undefined' !== typeof window.grecaptcha) {
			recaptcha = window.grecaptcha.getResponse();
		}

		if ('' === name.trim() || '' === email.trim()) {
			alert('Name and email is required.');
			return;
		}

		if (!emailRegex.test(email)) {
			alert('Please enter a valid email address.');
			return;
		}

		if (0 === recaptcha.length) {
			alert('Please complete the reCaptcha.');
			return;
		}

		var form = $(this).serialize();

		var data = form + '&action=wds_swe_flag_event&nonce=' + swe.flagEventNonce;

		$.post(swe.ajaxUrl, data, function () {
			$('.featherlight .flag-event form').fadeOut();
			$('.featherlight .flag-event .flag-event-success').fadeIn('fast');
		});
	};

	// Debounce: https://davidwalsh.name/javascript-debounce-function
	app.debounce = function (func, wait, immediate) {
		var timeout;
		return function () {
			var context = this,
			    args = arguments;

			/**
    * The later function.
    */
			function later() {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};

			var callNow = immediate && !timeout;

			clearTimeout(timeout);

			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args);
			}
		};
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsEvents);
'use strict';

/**
 * File: flyout-menu.js
 *
 * Controls the flyout menu in the header.
 */
window.wdsFlyoutMenu = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			body: $('body'),
			window: $(window),
			flyOutMenu: $('.flyout-menu'),
			navDrawerButton: $('.nav-drawer-button'),
			closeButton: $('.close-button')
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.flyOutMenu.length;
	};

	// Combine all events.
	app.bindEvents = function () {

		// Open Flyout Menu when 3 dots icon in header is clicked/touched.
		app.$c.navDrawerButton.on('click', app.openFlyout);

		// Close Flyout Menu when the close X button in the menu is clicked/touched.
		app.$c.closeButton.on('click', app.closeFlyout);

		// Close the Flyout Menu when the user clicks/touches outside the menu.
		app.$c.body.on('click', app.closeFlyoutByClick);

		app.$c.flyOutMenu.on('transitionend', app.resetFlyoutMenu);
	};

	// Open the Flyout Menu.
	app.openFlyout = function () {

		// Open the flyout menu, and set the corresponding button aria to true.
		app.$c.flyOutMenu.addClass('is-visible animated slideInRight').find('.nav-drawer-button').attr('aria-expanded', true);
	};

	// Close the Flyout Menu.
	app.closeFlyout = function () {

		app.$c.flyOutMenu.each(function () {

			// Only close the flyout if it's open.
			if (app.$c.flyOutMenu.hasClass('is-visible')) {

				// Close the flyout.
				$(this).removeClass('is-visible slideInRight').addClass('slideOutRight').find('.nav-drawer-button').attr('aria-expanded', false);
			}

			// Set a timeout for adding/removing these classes or else they won't have time to fire.
			setTimeout(function () {

				// Remove the classes from the flyout menu so it is ready to toggle again.
				if (!$('.flyout-menu').hasClass('is-visible')) {
					$('.flyout-menu').removeClass('slideOutRight');
				}
			}, 1000);
		});
	};

	// Close if the user clicks outside of the flyout.
	app.closeFlyoutByClick = function (event) {

		if (!$(event.target).parents('section').hasClass('is-visible') && !$(event.target).hasClass('nav-drawer-button') && !$(event.target).hasClass('is-visible')) {
			app.closeFlyout();
		}
	};

	// Reset the flyout menu classes after it's closed.
	app.resetFlyoutMenu = function () {

		// Remove the classes from the flyout menu so it is ready to toggle again.
		if (!$('.flyout-menu').hasClass('is-visible')) {
			$('.flyout-menu').removeClass('slideOutRight');
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsFlyoutMenu);
'use strict';

/**
 * Show/Hide the Search Form in the header.
 *
 * @author Corey Collins
 */
window.ShowHideSearchForm = {};
(function (window, $, app) {

	// Constructor
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things
	app.cache = function () {
		app.$c = {
			window: $(window),
			body: $('body'),
			headerSearchForm: $('.site-header-action .search-button')
		};
	};

	// Combine all events
	app.bindEvents = function () {
		app.$c.headerSearchForm.on('keyup touchstart click', app.showHideSearchForm);
		app.$c.body.on('keyup touchstart click', app.hideSearchForm);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.headerSearchForm.length;
	};

	// Adds the toggle class for the search form.
	app.showHideSearchForm = function () {
		app.$c.body.toggleClass('search-form-visible');

		return false;
	};

	// Hides the search form if we click outside of its container.
	app.hideSearchForm = function (event) {

		if (!$(event.target).parents('div').hasClass('site-header-action')) {
			app.$c.body.removeClass('search-form-visible');
		}
	};

	// Engage
	$(app.init);
})(window, jQuery, window.ShowHideSearchForm);
'use strict';

/**
 * File js-enabled.js
 *
 * If Javascript is enabled, replace the <body> class "no-js".
 */
document.body.className = document.body.className.replace('no-js', 'js');
'use strict';

/**
 * File: mobile-menu.js
 *
 * Functionality for the hamburger menu.
 */
window.wdsMobileMenu = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			body: $('body'),
			window: $(window),
			subMenuContainer: $('.mobile-menu .sub-menu, .utility-navigation .sub-menu'),
			subSubMenuContainer: $('.mobile-menu .sub-menu .sub-menu'),
			subMenuParentItem: $('.mobile-menu li.menu-item-has-children, .utility-navigation li.menu-item-has-children'),
			subMenuParentItemLink: $('.mobile-menu .menu-item-has-children > a'),
			offCanvasContainer: $('.off-canvas-container'),
			offCanvasOpen: $('.off-canvas-open')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.addDownArrow);
		app.$c.subMenuParentItem.on('click', app.toggleSubmenu);
		app.$c.subMenuParentItem.on('transitionend', app.resetSubMenu);
		app.$c.offCanvasContainer.on('transitionend', app.forceCloseSubmenus);
		app.$c.offCanvasOpen.on('click', app.openSubmenusByDefault);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.subMenuContainer.length;
	};

	// Reset the submenus after it's done closing.
	app.resetSubMenu = function () {

		// When the list item is done transitioning in height,
		// remove the classes from the submenu so it is ready to toggle again.
		if ($(this).is('li.menu-item-has-children') && !$(this).hasClass('is-visible')) {
			$(this).find('ul.sub-menu').removeClass('slideOutLeft is-visible');
		}
	};

	// Slide out the submenu items.
	app.slideOutSubMenus = function (el) {

		// If this item's parent is visible and this is not, bail.
		if (el.parent().hasClass('is-visible') && !el.hasClass('is-visible')) {
			return;
		}

		// If this item's parent is visible and this item is visible, hide its submenu then bail.
		if (el.parent().hasClass('is-visible') && el.hasClass('is-visible')) {
			el.removeClass('is-visible').find('.sub-menu').removeClass('slideInLeft').addClass('slideOutLeft');
			return;
		}

		app.$c.subMenuContainer.each(function () {

			// Only try to close submenus that are actually open.
			if ($(this).hasClass('slideInLeft')) {

				// Close the parent list item, and set the corresponding button aria to false.
				$(this).parent().removeClass('is-visible').find('.parent-indicator').attr('aria-expanded', false);

				// Slide out the submenu.
				$(this).removeClass('slideInLeft').addClass('slideOutLeft');
			}
		});
	};

	// Add the down arrow to submenu parents.
	app.addDownArrow = function () {
		app.$c.subMenuParentItemLink.append('<button type="button" aria-expanded="false" class="parent-indicator" aria-label="Open submenu"><span class="down-arrow">></span></button>');
	};

	// Deal with the submenu.
	app.toggleSubmenu = function (e) {

		var el = $(this),
		    // The menu element which was clicked on.
		subMenu = el.children('ul.sub-menu'),
		    // The nearest submenu.
		$target = $(e.target); // the element that's actually being clicked (child of the li that triggered the click event).

		// Figure out if we're clicking the button or its arrow child,
		// if so, we can just open or close the menu and bail.
		if ($target.hasClass('down-arrow') || $target.hasClass('parent-indicator')) {

			// First, collapse any already opened submenus.
			app.slideOutSubMenus(el);

			if (!subMenu.hasClass('is-visible')) {

				// Open the submenu.
				app.openSubmenu(el, subMenu);
			}

			return false;
		}
	};

	// Open a submenu.
	app.openSubmenu = function (parent, subMenu) {

		// Expand the list menu item, and set the corresponding button aria to true.
		parent.addClass('is-visible').find('.parent-indicator').attr('aria-expanded', true);

		// Slide the menu in.
		subMenu.addClass('is-visible animated slideInLeft');
	};

	// Open submenus by default.
	app.openSubmenusByDefault = function () {

		// Expand the list menu item, and set the corresponding button aria to true.
		$('.mobile-menu li.menu-item-has-children').addClass('is-visible').find('.parent-indicator').attr('aria-expanded', true);

		// Set submenu class to 'open'.
		$('ul.sub-menu').addClass('is-visible animated slideInLeft');
	};

	// Force close all the submenus when the main menu container is closed.
	app.forceCloseSubmenus = function () {

		// The transitionend event triggers on open and on close, need to make sure we only do this on close.
		if (!$(this).hasClass('is-visible')) {
			app.$c.subMenuParentItem.removeClass('is-visible').find('.parent-indicator').attr('aria-expanded', false);
			app.$c.subMenuContainer.removeClass('is-visible slideInLeft');
			app.$c.body.css('overflow', 'visible');
			app.$c.body.unbind('touchstart');
		}

		if ($(this).hasClass('is-visible')) {
			app.$c.body.css('overflow', 'hidden');
			app.$c.body.bind('touchstart', function (e) {
				if (!$(e.target).parents('.contact-modal')[0]) {
					e.preventDefault();
				}
			});
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsMobileMenu);
'use strict';

/**
 * File modal.js
 *
 * Deal with multiple modals and their media.
 */
window.wdsModal = {};
(function (window, $, app) {

	var $modalToggle = void 0,
	    $focusableChildren = void 0,
	    $player = void 0,
	    $tag = document.createElement('script'),
	    $firstScriptTag = document.getElementsByTagName('script')[0],
	    YT = void 0;

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			$firstScriptTag.parentNode.insertBefore($tag, $firstScriptTag);
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			'body': $('body')
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return $('.modal-trigger').length;
	};

	// Combine all events.
	app.bindEvents = function () {

		// Trigger a modal to open.
		app.$c.body.on('click touchstart', '.modal-trigger', app.openModal);

		// Trigger the close button to close the modal.
		app.$c.body.on('click touchstart', '.close', app.closeModal);

		// Allow the user to close the modal by hitting the esc key.
		app.$c.body.on('keydown', app.escKeyClose);

		// Allow the user to close the modal by clicking outside of the modal.
		app.$c.body.on('click touchstart', 'div.modal-open', app.closeModalByClick);

		// Listen to tabs, trap keyboard if we need to
		app.$c.body.on('keydown', app.trapKeyboardMaybe);
	};

	// Open the modal.
	app.openModal = function () {

		// Store the modal toggle element
		$modalToggle = $(this);

		// Figure out which modal we're opening and store the object.
		var $modal = $($(this).data('target'));

		// Display the modal.
		$modal.addClass('modal-open');

		// Add body class.
		app.$c.body.addClass('modal-open');

		// Find the focusable children of the modal.
		// This list may be incomplete, really wish jQuery had the :focusable pseudo like jQuery UI does.
		// For more about :input see: https://api.jquery.com/input-selector/
		$focusableChildren = $modal.find('a, :input, [tabindex]');

		// Ideally, there is always one (the close button), but you never know.
		if (0 < $focusableChildren.length) {

			// Shift focus to the first focusable element.
			$focusableChildren[0].focus();
		}
	};

	// Close the modal.
	app.closeModal = function () {

		// Figure the opened modal we're closing and store the object.
		var $modal = $($('div.modal-open .close').data('target')),


		// Find the iframe in the $modal object.
		$iframe = $modal.find('iframe');

		// Only do this if there are any iframes.
		if ($iframe.length) {

			// Get the iframe src URL.
			var url = $iframe.attr('src');

			// Removing/Readding the URL will effectively break the YouTube API.
			// So let's not do that when the iframe URL contains the enablejsapi parameter.
			if (!url.includes('enablejsapi=1')) {

				// Remove the source URL, then add it back, so the video can be played again later.
				$iframe.attr('src', '').attr('src', url);
			} else {

				// Use the YouTube API to stop the video.
				$player.stopVideo();
			}
		}

		// Finally, hide the modal.
		$modal.removeClass('modal-open');

		// Remove the body class.
		app.$c.body.removeClass('modal-open');

		// Revert focus back to toggle element
		$modalToggle.focus();
	};

	// Close if "esc" key is pressed.
	app.escKeyClose = function (event) {
		if (27 === event.keyCode) {
			app.closeModal();
		}
	};

	// Close if the user clicks outside of the modal
	app.closeModalByClick = function (event) {

		// If the parent container is NOT the modal dialog container, close the modal
		if (!$(event.target).parents('div').hasClass('modal-dialog')) {
			app.closeModal();
		}
	};

	// Trap the keyboard into a modal when one is active.
	app.trapKeyboardMaybe = function (event) {

		// We only need to do stuff when the modal is open and tab is pressed.
		if (9 === event.which && 0 < $('.modal-open').length) {
			var $focused = $(':focus'),
			    focusIndex = $focusableChildren.index($focused);

			if (0 === focusIndex && event.shiftKey) {

				// If this is the first focusable element, and shift is held when pressing tab, go back to last focusable element.
				$focusableChildren[$focusableChildren.length - 1].focus();
				event.preventDefault();
			} else if (!event.shiftKey && focusIndex === $focusableChildren.length - 1) {

				// If this is the last focusable element, and shift is not held, go back to the first focusable element.
				$focusableChildren[0].focus();
				event.preventDefault();
			}
		}
	};

	// Hook into YouTube <iframe>.
	app.onYouTubeIframeAPIReady = function () {
		var $modal = $('div.modal'),
		    $iframeid = $modal.find('iframe').attr('id');

		$player = new YT.Player($iframeid, {
			events: {
				'onReady': app.onPlayerReady,
				'onStateChange': app.onPlayerStateChange
			}
		});
	};

	// Do something on player ready.
	app.onPlayerReady = function () {};

	// Do something on player state change.
	app.onPlayerStateChange = function () {

		// Set focus to the first focusable element inside of the modal the player is in.
		$(event.target.a).parents('.modal').find('a, :input, [tabindex]').first().focus();
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsModal);
'use strict';

/**
 * File: navigation-primary.js
 *
 * Helpers for the primary navigation.
 */
window.wdsPrimaryNavigation = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			window: $(window),
			subMenuContainer: $('.main-navigation .sub-menu'),
			subMenuParentItem: $('.main-navigation li.menu-item-has-children')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.addDownArrow);
		app.$c.subMenuParentItem.find('a').on('focusin focusout', app.toggleFocus);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.subMenuContainer.length;
	};

	// Add the down arrow to submenu parents.
	app.addDownArrow = function () {
		app.$c.subMenuParentItem.find('> a').append('<span class="caret-down" aria-hidden="true"></span>');
	};

	// Toggle the focus class on the link parent.
	app.toggleFocus = function () {
		$(this).parents('li.menu-item-has-children').toggleClass('focus');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsPrimaryNavigation);
'use strict';

/**
 * File: off-canvas.js
 *
 * Help deal with the off-canvas mobile menu.
 */
window.wdsoffCanvas = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			body: $('body'),
			offCanvasClose: $('.off-canvas-close'),
			offCanvasContainer: $('.off-canvas-container'),
			offCanvasOpen: $('.off-canvas-open'),
			offCanvasScreen: $('.off-canvas-screen')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.body.on('keydown', app.escKeyClose);
		app.$c.offCanvasClose.on('click', app.closeoffCanvas);
		app.$c.offCanvasOpen.on('click', app.toggleoffCanvas);
		app.$c.offCanvasScreen.on('click', app.closeoffCanvas);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.offCanvasContainer.length;
	};

	// To show or not to show?
	app.toggleoffCanvas = function () {

		if ('true' === $(this).attr('aria-expanded')) {
			app.closeoffCanvas();
		} else {
			app.openoffCanvas();
		}
	};

	// Show that drawer!
	app.openoffCanvas = function () {
		app.$c.offCanvasContainer.addClass('is-visible');
		app.$c.offCanvasOpen.addClass('is-visible');
		app.$c.offCanvasScreen.addClass('is-visible');

		app.$c.offCanvasOpen.attr('aria-expanded', true);
		app.$c.offCanvasContainer.attr('aria-hidden', false);

		app.$c.offCanvasContainer.find('button').first().focus();
	};

	// Close that drawer!
	app.closeoffCanvas = function () {
		app.$c.offCanvasContainer.removeClass('is-visible');
		app.$c.offCanvasOpen.removeClass('is-visible');
		app.$c.offCanvasScreen.removeClass('is-visible');

		app.$c.offCanvasOpen.attr('aria-expanded', false);
		app.$c.offCanvasContainer.attr('aria-hidden', true);

		app.$c.offCanvasOpen.focus();
	};

	// Close drawer if "esc" key is pressed.
	app.escKeyClose = function (event) {
		if (27 === event.keyCode) {
			app.closeoffCanvas();
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsoffCanvas);
'use strict';

/**
 * File partners-carousel.js
 *
 * Deal with the Slick carousel for Partners widget.
 */
window.wdsPartnersCarousel = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			window: $(window),
			theCarousel: $('.partners-carousel')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.doSlick);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.theCarousel.length;
	};

	// Kick off Slick.
	app.doSlick = function () {
		app.$c.theCarousel.slick({
			adaptiveHeight: true,
			autoplay: false,
			autoplaySpeed: 5000,
			arrows: true,
			dots: false,
			focusOnSelect: true,
			waitForAnimate: true,
			prevArrow: '<button type="button" class="slick-prev"><svg class="icon icon-arrow-circle-left"><use xlink:href="#icon-arrow-circle-left"></use></svg></button>',
			nextArrow: '<button type="button" class="slick-next"><svg class="icon icon-arrow-circle-right"><use xlink:href="#icon-arrow-circle-right"></use></svg></button>',
			responsive: [{
				breakpoint: 900,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1
				}
			}, {
				breakpoint: 600,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1
				}
			}]
		});

		app.$c.theCarousel.fadeTo(400, 1);
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsPartnersCarousel);
'use strict';

/**
 * File skip-link-focus-fix.js.
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://git.io/vWdr2
 */
(function () {
	var isWebkit = -1 < navigator.userAgent.toLowerCase().indexOf('webkit'),
	    isOpera = -1 < navigator.userAgent.toLowerCase().indexOf('opera'),
	    isIe = -1 < navigator.userAgent.toLowerCase().indexOf('msie');

	if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) {
		window.addEventListener('hashchange', function () {
			var id = location.hash.substring(1),
			    element;

			if (!/^[A-z0-9_-]+$/.test(id)) {
				return;
			}

			element = document.getElementById(id);

			if (element) {
				if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
					element.tabIndex = -1;
				}

				element.focus();
			}
		}, false);
	}
})();
'use strict';

/**
 * File social-menu.js
 *
 * Allows menu items to have their content wrapped in screen-reader-text class.
 */
window.wdsSocialMenu = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache document elements.
	app.cache = function () {
		app.$c = {
			window: $(window),
			'socialMenu': $('#menu-social-networks'),
			'menuItems': $('#menu-social-networks .menu-item')
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.on('load', app.wrapMenuItems);
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return app.$c.socialMenu.length;
	};

	// Wrap menu items in screen reader text.
	app.wrapMenuItems = function () {
		app.$c.menuItems.find('a').wrapInner('<span class="screen-reader-text">', '</span>').css('visibility', 'visible');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsSocialMenu);
'use strict';

/**
 * File: sticky-nav.js
 *
 * Fix the header to the top of the screen when the user scrolls.
 */
window.wdsScrollToFixed = {};
(function (window, $, app) {

    // Constructor.
    app.init = function () {
        app.cache();

        if (app.meetsRequirements()) {
            app.bindEvents();
        }
    };

    // Cache all the things, but mostly the header.
    app.cache = function () {
        app.$c = {
            window: $(window),
            fixedHeader: $('.fixed-header'),
            micrositePage: $('body.page-template-template-microsite, body.page-template-template-slim-header')
        };
    };

    // Combine all events.
    app.bindEvents = function () {
        app.$c.window.on('scroll', app.toggleFixedHeader);
    };

    // Do we meet the requirements?
    app.meetsRequirements = function () {
        return app.$c.fixedHeader.length && !app.$c.micrositePage.length;
    };

    // Toggle the fixed version of the header.
    app.toggleFixedHeader = function () {
        var headerHeight = app.$c.fixedHeader.height() / 2;

        if (app.$c.window.scrollTop() > headerHeight) {
            app.$c.fixedHeader.addClass('solid-header');
        } else {
            app.$c.fixedHeader.removeClass('solid-header');
        }
    };

    // Engage!
    $(app.init);
})(window, jQuery, window.wdsScrollToFixed);
'use strict';

/**
 * File window-ready.js
 *
 * Add a "ready" class to <body> when window is ready.
 */
window.wdsWindowReady = {};
(function (window, $, app) {

	// Constructor.
	app.init = function () {
		app.cache();
		app.bindEvents();
	};

	// Cache document elements.
	app.cache = function () {
		app.$c = {
			'window': $(window),
			'body': $(document.body)
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.load(app.addBodyClass);
	};

	// Add a class to <body>.
	app.addBodyClass = function () {
		app.$c.body.addClass('ready');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsWindowReady);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjY29yZGlvbi5qcyIsImNhcm91c2VsLmpzIiwiZXZlbnRzLmpzIiwiZmx5b3V0LW1lbnUuanMiLCJoZWFkZXItYnV0dG9uLmpzIiwianMtZW5hYmxlZC5qcyIsIm1vYmlsZS1tZW51LmpzIiwibW9kYWwuanMiLCJuYXZpZ2F0aW9uLXByaW1hcnkuanMiLCJvZmYtY2FudmFzLmpzIiwicGFydG5lcnMtY2Fyb3VzZWwuanMiLCJza2lwLWxpbmstZm9jdXMtZml4LmpzIiwic29jaWFsLW1lbnUuanMiLCJzdGlja3ktbmF2LmpzIiwid2luZG93LXJlYWR5LmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFjY29yZGlvbkJsb2NrVG9nZ2xlIiwiJCIsImFwcCIsImluaXQiLCJjYWNoZSIsIm1lZXRzUmVxdWlyZW1lbnRzIiwiYmluZEV2ZW50cyIsIiRjIiwiaHRtbCIsImFjY29yZGlvbiIsIml0ZW1zIiwiaGVhZGVycyIsImNvbnRlbnRzIiwiYnV0dG9uIiwiYW5jaG9ySUQiLCJsb2NhdGlvbiIsImhhc2giLCJvbiIsInRvZ2dsZUFjY29yZGlvbiIsIm9wZW5IYXNoQWNjb3JkaW9uIiwibGVuZ3RoIiwicGFyZW50cyIsInRvZ2dsZUNsYXNzIiwiaXNFeHBhbmRlZCIsImhhc0NsYXNzIiwiZmluZCIsImF0dHIiLCJub3QiLCJyZW1vdmVDbGFzcyIsInNlbGVjdG9yIiwidHJpZ2dlciIsImFkbWluQmFySGVpZ2h0IiwiaGVpZ2h0IiwiYW5pbWF0ZSIsInNjcm9sbFRvcCIsIm9mZnNldCIsInRvcCIsImpRdWVyeSIsIndkc0Nhcm91c2VsIiwidGhlQ2Fyb3VzZWwiLCJkb1NsaWNrIiwiZG9GaXJzdEFuaW1hdGlvbiIsImZpcnN0U2xpZGUiLCJmaXJzdFNsaWRlQ29udGVudCIsImZpcnN0QW5pbWF0aW9uIiwiYWRkQ2xhc3MiLCJkb0FuaW1hdGlvbiIsInNsaWRlcyIsImFjdGl2ZVNsaWRlIiwiYWN0aXZlQ29udGVudCIsImFuaW1hdGlvbkNsYXNzIiwic3BsaXRBbmltYXRpb24iLCJzcGxpdCIsImFuaW1hdGlvblRyaWdnZXIiLCJlYWNoIiwic2xpZGVDb250ZW50IiwibGFzdENsYXNzIiwicG9wIiwicGxheUJhY2tncm91bmRWaWRlb3MiLCJwbGF5Iiwic2xpY2siLCJhdXRvcGxheSIsImF1dG9wbGF5U3BlZWQiLCJhcnJvd3MiLCJkb3RzIiwiZm9jdXNPblNlbGVjdCIsIndhaXRGb3JBbmltYXRlIiwid2RzRXZlbnRzIiwiZG9jdW1lbnQiLCJldmVudFBhZ2UiLCJsb2NhdGlvbkZpZWxkIiwiY2F0ZWdvcnlGaWVsZCIsImZsYWdFdmVudCIsInRyaWJlQmFyIiwiaW5pZml0ZVNjcm9sbCIsImRlYm91bmNlIiwic2VhcmNoRXZlbnRzIiwic2hvd1NoYXJlQnV0dG9ucyIsInNob3dGbGFnTW9kYWwiLCJmbGFnRXZlbnRSZXBvcnQiLCJmZWF0aGVybGlnaHQiLCJfY2FsbGJhY2tDaGFpbiIsImJlZm9yZU9wZW4iLCJhZnRlckNsb3NlIiwiaW5maW5pdGVTY3JvbGwiLCJwYXRoIiwiYXBwZW5kIiwic3RhdHVzIiwiaGlzdG9yeSIsInN1Ym1pdCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJldmVudFBvc3QiLCJzbGlkZVRvZ2dsZSIsInRpdGxlIiwidGV4dCIsInVybCIsImFmdGVyT3BlbiIsImNvbnRlbnQiLCIkY29udGVudCIsInJlY2FwdGNoYSIsInZhbCIsImdyZWNhcHRjaGEiLCJyZW5kZXIiLCJzaXRla2V5Iiwic3dlIiwibmFtZSIsImVtYWlsIiwiZW1haWxSZWdleCIsImdldFJlc3BvbnNlIiwidHJpbSIsImFsZXJ0IiwidGVzdCIsImZvcm0iLCJzZXJpYWxpemUiLCJkYXRhIiwiZmxhZ0V2ZW50Tm9uY2UiLCJwb3N0IiwiYWpheFVybCIsImZhZGVPdXQiLCJmYWRlSW4iLCJmdW5jIiwid2FpdCIsImltbWVkaWF0ZSIsInRpbWVvdXQiLCJjb250ZXh0IiwiYXJncyIsImFyZ3VtZW50cyIsImxhdGVyIiwiYXBwbHkiLCJjYWxsTm93IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsIndkc0ZseW91dE1lbnUiLCJib2R5IiwiZmx5T3V0TWVudSIsIm5hdkRyYXdlckJ1dHRvbiIsImNsb3NlQnV0dG9uIiwib3BlbkZseW91dCIsImNsb3NlRmx5b3V0IiwiY2xvc2VGbHlvdXRCeUNsaWNrIiwicmVzZXRGbHlvdXRNZW51IiwidGFyZ2V0IiwiU2hvd0hpZGVTZWFyY2hGb3JtIiwiaGVhZGVyU2VhcmNoRm9ybSIsInNob3dIaWRlU2VhcmNoRm9ybSIsImhpZGVTZWFyY2hGb3JtIiwiY2xhc3NOYW1lIiwicmVwbGFjZSIsIndkc01vYmlsZU1lbnUiLCJzdWJNZW51Q29udGFpbmVyIiwic3ViU3ViTWVudUNvbnRhaW5lciIsInN1Yk1lbnVQYXJlbnRJdGVtIiwic3ViTWVudVBhcmVudEl0ZW1MaW5rIiwib2ZmQ2FudmFzQ29udGFpbmVyIiwib2ZmQ2FudmFzT3BlbiIsImFkZERvd25BcnJvdyIsInRvZ2dsZVN1Ym1lbnUiLCJyZXNldFN1Yk1lbnUiLCJmb3JjZUNsb3NlU3VibWVudXMiLCJvcGVuU3VibWVudXNCeURlZmF1bHQiLCJpcyIsInNsaWRlT3V0U3ViTWVudXMiLCJlbCIsInBhcmVudCIsImUiLCJzdWJNZW51IiwiY2hpbGRyZW4iLCIkdGFyZ2V0Iiwib3BlblN1Ym1lbnUiLCJjc3MiLCJ1bmJpbmQiLCJiaW5kIiwid2RzTW9kYWwiLCIkbW9kYWxUb2dnbGUiLCIkZm9jdXNhYmxlQ2hpbGRyZW4iLCIkcGxheWVyIiwiJHRhZyIsImNyZWF0ZUVsZW1lbnQiLCIkZmlyc3RTY3JpcHRUYWciLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsIllUIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsIm9wZW5Nb2RhbCIsImNsb3NlTW9kYWwiLCJlc2NLZXlDbG9zZSIsImNsb3NlTW9kYWxCeUNsaWNrIiwidHJhcEtleWJvYXJkTWF5YmUiLCIkbW9kYWwiLCJmb2N1cyIsIiRpZnJhbWUiLCJpbmNsdWRlcyIsInN0b3BWaWRlbyIsImtleUNvZGUiLCJ3aGljaCIsIiRmb2N1c2VkIiwiZm9jdXNJbmRleCIsImluZGV4Iiwic2hpZnRLZXkiLCJvbllvdVR1YmVJZnJhbWVBUElSZWFkeSIsIiRpZnJhbWVpZCIsIlBsYXllciIsImV2ZW50cyIsIm9uUGxheWVyUmVhZHkiLCJvblBsYXllclN0YXRlQ2hhbmdlIiwiYSIsImZpcnN0Iiwid2RzUHJpbWFyeU5hdmlnYXRpb24iLCJ0b2dnbGVGb2N1cyIsIndkc29mZkNhbnZhcyIsIm9mZkNhbnZhc0Nsb3NlIiwib2ZmQ2FudmFzU2NyZWVuIiwiY2xvc2VvZmZDYW52YXMiLCJ0b2dnbGVvZmZDYW52YXMiLCJvcGVub2ZmQ2FudmFzIiwid2RzUGFydG5lcnNDYXJvdXNlbCIsImFkYXB0aXZlSGVpZ2h0IiwicHJldkFycm93IiwibmV4dEFycm93IiwicmVzcG9uc2l2ZSIsImJyZWFrcG9pbnQiLCJzZXR0aW5ncyIsInNsaWRlc1RvU2hvdyIsInNsaWRlc1RvU2Nyb2xsIiwiZmFkZVRvIiwiaXNXZWJraXQiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ0b0xvd2VyQ2FzZSIsImluZGV4T2YiLCJpc09wZXJhIiwiaXNJZSIsImdldEVsZW1lbnRCeUlkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImlkIiwic3Vic3RyaW5nIiwiZWxlbWVudCIsInRhZ05hbWUiLCJ0YWJJbmRleCIsIndkc1NvY2lhbE1lbnUiLCJ3cmFwTWVudUl0ZW1zIiwic29jaWFsTWVudSIsIm1lbnVJdGVtcyIsIndyYXBJbm5lciIsIndkc1Njcm9sbFRvRml4ZWQiLCJmaXhlZEhlYWRlciIsIm1pY3Jvc2l0ZVBhZ2UiLCJ0b2dnbGVGaXhlZEhlYWRlciIsImhlYWRlckhlaWdodCIsIndkc1dpbmRvd1JlYWR5IiwibG9hZCIsImFkZEJvZHlDbGFzcyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7QUFLQUEsT0FBT0Msb0JBQVAsR0FBOEIsRUFBOUI7QUFDRSxXQUFVRCxNQUFWLEVBQWtCRSxDQUFsQixFQUFxQkMsR0FBckIsRUFBMkI7O0FBRTVCO0FBQ0FBLEtBQUlDLElB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LENBQWxCLEVBQXFCQyxHQUFyQixFQUEyQjs7QUFFNUI7QUFDQUEsS0FBSUMsSUFBSixHQUFXLFlBQVc7QUFDckJELE1BQUlFLEtBQUo7QUFDQUYsTUFBSUksVUFBSjtBQUNBLEVBSEQ7O0FBS0E7QUFDQUosS0FBSUUsS0FBSixHQUFZLFlBQVc7QUFDdEJGLE1BQUlLLEVBQUosR0FBUztBQUNSLGFBQVVOLEVBQUdGLE1BQUgsQ0FERjtBQUVSLFdBQVFFLEVBQUdtRSxTQUFTa0UsSUFBWjtBQUZBLEdBQVQ7QUFJQSxFQUxEOztBQU9BO0FBQ0FwSSxLQUFJSSxVQUFKLEdBQWlCLFlBQVc7QUFDM0JKLE1BQUlLLEVBQUosQ0FBT1IsTUFBUCxDQUFjNFAsSUFBZCxDQUFvQnpQLElBQUkwUCxZQUF4QjtBQUNBLEVBRkQ7O0FBSUE7QUFDQTFQLEtBQUkwUCxZQUFKLEdBQW1CLFlBQVc7QUFDN0IxUCxNQUFJSyxFQUFKLENBQU8rSCxJQUFQLENBQVl6RixRQUFaLENBQXNCLE9BQXRCO0FBQ0EsRUFGRDs7QUFJQTtBQUNBNUMsR0FBR0MsSUFBSUMsSUFBUDtBQUNBLENBNUJDLEVBNEJDSixNQTVCRCxFQTRCU3NDLE1BNUJULEVBNEJpQnRDLE9BQU8yUCxjQTVCeEIsQ0FBRiIsImZpbGUiOiJwcm9qZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBY2NvcmRpb24gYmxvY2sgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgU2hhbm5vbiBNYWNNaWxsYW4sIENvcmV5IENvbGxpbnNcbiAqL1xud2luZG93LmFjY29yZGlvbkJsb2NrVG9nZ2xlID0ge307XG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcblxuXHQvLyBDb25zdHJ1Y3RvclxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5jYWNoZSgpO1xuXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXG5cdFx0XHRodG1sOiAkKCAnaHRtbCcgKSxcblx0XHRcdGFjY29yZGlvbjogJCggJy5hY2NvcmRpb24nICksXG5cdFx0XHRpdGVtczogJCggJy5hY2NvcmRpb24taXRlbScgKSxcblx0XHRcdGhlYWRlcnM6ICQoICcuYWNjb3JkaW9uLWl0ZW0taGVhZGVyJyApLFxuXHRcdFx0Y29udGVudHM6ICQoICcuYWNjb3JkaW9uLWl0ZW0tY29udGVudCcgKSxcblx0XHRcdGJ1dHRvbjogJCggJy5hY2NvcmRpb24taXRlbS10b2dnbGUnICksXG5cdFx0XHRhbmNob3JJRDogJCggd2luZG93LmxvY2F0aW9uLmhhc2ggKVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLiRjLmhlYWRlcnMub24oICdjbGljayB0b3VjaHN0YXJ0JywgYXBwLnRvZ2dsZUFjY29yZGlvbiApO1xuXHRcdGFwcC4kYy5idXR0b24ub24oICdjbGljayB0b3VjaHN0YXJ0JywgYXBwLnRvZ2dsZUFjY29yZGlvbiApO1xuXHRcdGFwcC4kYy53aW5kb3cub24oICdsb2FkJywgYXBwLm9wZW5IYXNoQWNjb3JkaW9uICk7XG5cdH07XG5cblx0Ly8gRG8gd2UgbWVldCB0aGUgcmVxdWlyZW1lbnRzP1xuXHRhcHAubWVldHNSZXF1aXJlbWVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gYXBwLiRjLmFjY29yZGlvbi5sZW5ndGg7XG5cdH07XG5cblx0YXBwLnRvZ2dsZUFjY29yZGlvbiA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gQWRkIHRoZSBvcGVuIGNsYXNzIHRvIHRoZSBpdGVtLlxuXHRcdCQoIHRoaXMgKS5wYXJlbnRzKCAnLmFjY29yZGlvbi1pdGVtJyApLnRvZ2dsZUNsYXNzKCAnb3BlbicgKTtcblxuXHRcdC8vIElzIHRoaXMgb25lIGV4cGFuZGVkP1xuXHRcdGxldCBpc0V4cGFuZGVkID0gJCggdGhpcyApLnBhcmVudHMoICcuYWNjb3JkaW9uLWl0ZW0nICkuaGFzQ2xhc3MoICdvcGVuJyApO1xuXG5cdFx0Ly8gU2V0IHRoaXMgYnV0dG9uJ3MgYXJpYS1leHBhbmRlZCB2YWx1ZS5cblx0XHQkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24taXRlbScgKS5maW5kKCAnLmFjY29yZGlvbi1pdGVtLXRvZ2dsZScgKS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIGlzRXhwYW5kZWQgPyAndHJ1ZScgOiAnZmFsc2UnICk7XG5cblx0XHQvLyBTZXQgYWxsIG90aGVyIGl0ZW1zIGluIHRoaXMgYmxvY2sgdG8gYXJpYS1oaWRkZW49dHJ1ZS5cblx0XHQkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24tYmxvY2snICkuZmluZCggJy5hY2NvcmRpb24taXRlbS1jb250ZW50JyApLm5vdCggJCggdGhpcyApLnBhcmVudHMoICcuYWNjb3JkaW9uLWl0ZW0nICkgKS5hdHRyKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKTtcblxuXHRcdC8vIFNldCB0aGlzIGl0ZW0gdG8gYXJpYS1oaWRkZW49ZmFsc2UuXG5cdFx0JCggdGhpcyApLnBhcmVudHMoICcuYWNjb3JkaW9uLWl0ZW0nICkuZmluZCggJy5hY2NvcmRpb24taXRlbS1jb250ZW50JyApLmF0dHIoICdhcmlhLWhpZGRlbicsIGlzRXhwYW5kZWQgPyAnZmFsc2UnIDogJ3RydWUnICk7XG5cblx0XHQvLyBIaWRlIHRoZSBvdGhlciBwYW5lbHMuXG5cdFx0JCggdGhpcyApLnBhcmVudHMoICcuYWNjb3JkaW9uLWJsb2NrJyApLmZpbmQoICcuYWNjb3JkaW9uLWl0ZW0nICkubm90KCAkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24taXRlbScgKSApLnJlbW92ZUNsYXNzKCAnb3BlbicgKTtcblx0XHQkKCB0aGlzICkucGFyZW50cyggJy5hY2NvcmRpb24tYmxvY2snICkuZmluZCggJy5hY2NvcmRpb24taXRlbS10b2dnbGUnICkubm90KCAkKCB0aGlzICkgKS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICdmYWxzZScgKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXHRhcHAub3Blbkhhc2hBY2NvcmRpb24gPSBmdW5jdGlvbigpIHtcblxuXHRcdGlmICggISBhcHAuJGMuYW5jaG9ySUQuc2VsZWN0b3IgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gVHJpZ2dlciBhIGNsaWNrIG9uIHRoZSBidXR0b24gY2xvc2VzdCB0byB0aGlzIGFjY29yZGlvbi5cblx0XHRhcHAuJGMuYW5jaG9ySUQucGFyZW50cyggJy5hY2NvcmRpb24taXRlbScgKS5maW5kKCAnLmFjY29yZGlvbi1pdGVtLXRvZ2dsZScgKS50cmlnZ2VyKCAnY2xpY2snICk7XG5cblx0XHQvLyBOb3Qgc2V0dGluZyBhIGNhY2hlZCB2YXJpYWJsZSBhcyBpdCBkb2Vzbid0IHNlZW0gdG8gZ3JhYiB0aGUgaGVpZ2h0IHByb3Blcmx5LlxuXHRcdGNvbnN0IGFkbWluQmFySGVpZ2h0ID0gJCggJyN3cGFkbWluYmFyJyApLmxlbmd0aCA/ICQoICcjd3BhZG1pbmJhcicgKS5oZWlnaHQoKSA6IDA7XG5cblx0XHQvLyBBbmltYXRlIHRvIHRoZSBkaXYgZm9yIGEgbmljZXIgZXhwZXJpZW5jZS5cblx0XHRhcHAuJGMuaHRtbC5hbmltYXRlKCB7XG5cdFx0XHRzY3JvbGxUb3A6IGFwcC4kYy5hbmNob3JJRC5vZmZzZXQoKS50b3AgLSBhZG1pbkJhckhlaWdodFxuXHRcdH0sICdzbG93JyApO1xuXHR9O1xuXG5cdC8vIEVuZ2FnZVxuXHRhcHAuaW5pdCgpO1xuXG59ICggd2luZG93LCBqUXVlcnksIHdpbmRvdy5hY2NvcmRpb25CbG9ja1RvZ2dsZSApICk7XG4iLCIvKipcbiAqIEZpbGUgY2Fyb3VzZWwuanNcbiAqXG4gKiBEZWFsIHdpdGggdGhlIFNsaWNrIGNhcm91c2VsLlxuICovXG53aW5kb3cud2RzQ2Fyb3VzZWwgPSB7fTtcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xuXG5cdC8vIENvbnN0cnVjdG9yLlxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5jYWNoZSgpO1xuXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzLlxuXHRhcHAuY2FjaGUgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMgPSB7XG5cdFx0XHR3aW5kb3c6ICQoIHdpbmRvdyApLFxuXHRcdFx0dGhlQ2Fyb3VzZWw6ICQoICcuY2Fyb3VzZWwnIClcblx0XHR9O1xuXHR9O1xuXG5cdC8vIENvbWJpbmUgYWxsIGV2ZW50cy5cblx0YXBwLmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMud2luZG93Lm9uKCAnbG9hZCcsIGFwcC5kb1NsaWNrICk7XG5cdFx0YXBwLiRjLndpbmRvdy5vbiggJ2xvYWQnLCBhcHAuZG9GaXJzdEFuaW1hdGlvbiApO1xuXHR9O1xuXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cblx0YXBwLm1lZXRzUmVxdWlyZW1lbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGFwcC4kYy50aGVDYXJvdXNlbC5sZW5ndGg7XG5cdH07XG5cblx0Ly8gQW5pbWF0ZSB0aGUgZmlyc3Qgc2xpZGUgb24gd2luZG93IGxvYWQuXG5cdGFwcC5kb0ZpcnN0QW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBHZXQgdGhlIGZpcnN0IHNsaWRlIGNvbnRlbnQgYXJlYSBhbmQgYW5pbWF0aW9uIGF0dHJpYnV0ZS5cblx0XHRsZXQgZmlyc3RTbGlkZSA9IGFwcC4kYy50aGVDYXJvdXNlbC5maW5kKCAnW2RhdGEtc2xpY2staW5kZXg9MF0nICksXG5cdFx0XHRmaXJzdFNsaWRlQ29udGVudCA9IGZpcnN0U2xpZGUuZmluZCggJy5zbGlkZS1jb250ZW50JyApLFxuXHRcdFx0Zmlyc3RBbmltYXRpb24gPSBmaXJzdFNsaWRlQ29udGVudC5hdHRyKCAnZGF0YS1hbmltYXRpb24nICk7XG5cblx0XHQvLyBBZGQgdGhlIGFuaW1hdGlvbiBjbGFzcyB0byB0aGUgZmlyc3Qgc2xpZGUuXG5cdFx0Zmlyc3RTbGlkZUNvbnRlbnQuYWRkQ2xhc3MoIGZpcnN0QW5pbWF0aW9uICk7XG5cdH07XG5cblx0Ly8gQW5pbWF0ZSB0aGUgc2xpZGUgY29udGVudC5cblx0YXBwLmRvQW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG5cdFx0bGV0IHNsaWRlcyA9ICQoICcuc2xpZGUnICksXG5cdFx0XHRhY3RpdmVTbGlkZSA9ICQoICcuc2xpY2stY3VycmVudCcgKSxcblx0XHRcdGFjdGl2ZUNvbnRlbnQgPSBhY3RpdmVTbGlkZS5maW5kKCAnLnNsaWRlLWNvbnRlbnQnICksXG5cblx0XHRcdC8vIFRoaXMgaXMgYSBzdHJpbmcgbGlrZSBzbzogJ2FuaW1hdGVkIHNvbWVDc3NDbGFzcycuXG5cdFx0XHRhbmltYXRpb25DbGFzcyA9IGFjdGl2ZUNvbnRlbnQuYXR0ciggJ2RhdGEtYW5pbWF0aW9uJyApLFxuXHRcdFx0c3BsaXRBbmltYXRpb24gPSBhbmltYXRpb25DbGFzcy5zcGxpdCggJyAnICksXG5cblx0XHRcdC8vIFRoaXMgaXMgdGhlICdhbmltYXRlZCcgY2xhc3MuXG5cdFx0XHRhbmltYXRpb25UcmlnZ2VyID0gc3BsaXRBbmltYXRpb25bMF07XG5cblx0XHQvLyBHbyB0aHJvdWdoIGVhY2ggc2xpZGUgdG8gc2VlIGlmIHdlJ3ZlIGFscmVhZHkgc2V0IGFuaW1hdGlvbiBjbGFzc2VzLlxuXHRcdHNsaWRlcy5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBzbGlkZUNvbnRlbnQgPSAkKCB0aGlzICkuZmluZCggJy5zbGlkZS1jb250ZW50JyApO1xuXG5cdFx0XHQvLyBJZiB3ZSd2ZSBzZXQgYW5pbWF0aW9uIGNsYXNzZXMgb24gYSBzbGlkZSwgcmVtb3ZlIHRoZW0uXG5cdFx0XHRpZiAoIHNsaWRlQ29udGVudC5oYXNDbGFzcyggJ2FuaW1hdGVkJyApICkge1xuXG5cdFx0XHRcdC8vIEdldCB0aGUgbGFzdCBjbGFzcywgd2hpY2ggaXMgdGhlIGFuaW1hdGUuY3NzIGNsYXNzLlxuXHRcdFx0XHRsZXQgbGFzdENsYXNzID0gc2xpZGVDb250ZW50XG5cdFx0XHRcdFx0LmF0dHIoICdjbGFzcycgKVxuXHRcdFx0XHRcdC5zcGxpdCggJyAnIClcblx0XHRcdFx0XHQucG9wKCk7XG5cblx0XHRcdFx0Ly8gUmVtb3ZlIGJvdGggYW5pbWF0aW9uIGNsYXNzZXMuXG5cdFx0XHRcdHNsaWRlQ29udGVudC5yZW1vdmVDbGFzcyggbGFzdENsYXNzICkucmVtb3ZlQ2xhc3MoIGFuaW1hdGlvblRyaWdnZXIgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHQvLyBBZGQgYW5pbWF0aW9uIGNsYXNzZXMgYWZ0ZXIgc2xpZGUgaXMgaW4gdmlldy5cblx0XHRhY3RpdmVDb250ZW50LmFkZENsYXNzKCBhbmltYXRpb25DbGFzcyApO1xuXHR9O1xuXG5cdC8vIEFsbG93IGJhY2tncm91bmQgdmlkZW9zIHRvIGF1dG9wbGF5LlxuXHRhcHAucGxheUJhY2tncm91bmRWaWRlb3MgPSBmdW5jdGlvbigpIHtcblxuXHRcdC8vIEdldCBhbGwgdGhlIHZpZGVvcyBpbiBvdXIgc2xpZGVzIG9iamVjdC5cblx0XHQkKCAndmlkZW8nICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIExldCB0aGVtIGF1dG9wbGF5LiBUT0RPOiBQb3NzaWJseSBjaGFuZ2UgdGhpcyBsYXRlciB0byBvbmx5IHBsYXkgdGhlIHZpc2libGUgc2xpZGUgdmlkZW8uXG5cdFx0XHR0aGlzLnBsYXkoKTtcblx0XHR9ICk7XG5cdH07XG5cblx0Ly8gS2ljayBvZmYgU2xpY2suXG5cdGFwcC5kb1NsaWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLiRjLnRoZUNhcm91c2VsLm9uKCAnaW5pdCcsIGFwcC5wbGF5QmFja2dyb3VuZFZpZGVvcyApO1xuXG5cdFx0YXBwLiRjLnRoZUNhcm91c2VsLnNsaWNrKCB7XG5cdFx0XHRhdXRvcGxheTogdHJ1ZSxcblx0XHRcdGF1dG9wbGF5U3BlZWQ6IDUwMDAsXG5cdFx0XHRhcnJvd3M6IHRydWUsXG5cdFx0XHRkb3RzOiB0cnVlLFxuXHRcdFx0Zm9jdXNPblNlbGVjdDogdHJ1ZSxcblx0XHRcdHdhaXRGb3JBbmltYXRlOiB0cnVlXG5cdFx0fSApO1xuXG5cdFx0YXBwLiRjLnRoZUNhcm91c2VsLm9uKCAnYWZ0ZXJDaGFuZ2UnLCBhcHAuZG9BbmltYXRpb24gKTtcblx0fTtcblxuXHQvLyBFbmdhZ2UhXG5cdCQoIGFwcC5pbml0ICk7XG59ICggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNDYXJvdXNlbCApICk7XG4iLCIvKipcbiAqIEZpbGU6IGV2ZW50cy5qc1xuICpcbiAqIEFkanVzdHMgdGhlIGRhdGUgdG8gY29ycmVjdCBmb3JtYXQgb24gZXZlbnQgYXJjaGl2ZSBwYWdlLlxuICovXG53aW5kb3cud2RzRXZlbnRzID0ge307XG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcblxuICAgIC8vIENvbnN0cnVjdG9yLlxuICAgIGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcC5jYWNoZSgpO1xuXG4gICAgICAgIGlmICggYXBwLm1lZXRzUmVxdWlyZW1lbnRzKCkgKSB7XG4gICAgICAgICAgICBhcHAuYmluZEV2ZW50cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzLCBidXQgbW9zdGx5IHRoZSBoZWFkZXIuXG4gICAgYXBwLmNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcC4kYyA9IHtcblx0XHRcdGRvY3VtZW50OiAkICggZG9jdW1lbnQgKSxcbiAgICAgICAgICAgIHdpbmRvdzogJCggd2luZG93ICksXG5cdFx0XHRldmVudFBhZ2U6ICQoICcucG9zdC10eXBlLWFyY2hpdmUtdHJpYmVfZXZlbnRzLCAuc2luZ2xlLXRyaWJlX2V2ZW50cycgKSxcblx0XHRcdGxvY2F0aW9uRmllbGQ6ICQoICcjdHJpYmUtYmFyLWZvcm0gLnNlYXJjaCBpbnB1dCcgKSxcblx0XHRcdGNhdGVnb3J5RmllbGQ6ICQoICcjdHJpYmUtYmFyLWZvcm0gLmNhdGVnb3J5IHNlbGVjdCcgKSxcblx0XHRcdGZsYWdFdmVudDogJCggJy5mbGFnLWV2ZW50JyApLFxuXHRcdFx0dHJpYmVCYXI6ICQoICcjdHJpYmUtYmFyLWZvcm0nIClcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLy8gQ29tYmluZSBhbGwgZXZlbnRzLlxuICAgIGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLiRjLndpbmRvdy5vbiggJ2xvYWQnLCBhcHAuaW5pZml0ZVNjcm9sbCApO1xuXHRcdGFwcC4kYy5sb2NhdGlvbkZpZWxkLm9uKCAna2V5dXAnLCBhcHAuZGVib3VuY2UoIGFwcC5zZWFyY2hFdmVudHMsIDUwMCApICk7XG5cdFx0YXBwLiRjLmNhdGVnb3J5RmllbGQub24oICdjaGFuZ2UnLCAgYXBwLnNlYXJjaEV2ZW50cyApO1xuXHRcdGFwcC4kYy5ldmVudFBhZ2Uub24oICdjbGljaycsICcuYnV0dG9uLXNoYXJlLXRoaXMnLCBhcHAuc2hvd1NoYXJlQnV0dG9ucyApO1xuXHRcdGFwcC4kYy5ldmVudFBhZ2Uub24oICdjbGljaycsICcuYnV0dG9uLWZsYWctdGhpcycsIGFwcC5zaG93RmxhZ01vZGFsICk7XG5cdFx0YXBwLiRjLmZsYWdFdmVudC5vbiggJ3N1Ym1pdCcsICdmb3JtJywgYXBwLmZsYWdFdmVudFJlcG9ydCApO1xuXG5cdFx0Ly8gUmVzZXQgZm9yIHRhYmluZGV4LlxuXHRcdCQuZmVhdGhlcmxpZ2h0Ll9jYWxsYmFja0NoYWluLmJlZm9yZU9wZW4gPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3EvNDIyMzQ3OTAvNDcwNzQ5LlxuXHRcdFx0Ly8gQnkgb3ZlcnJpZGluZyB0aGlzIGZ1bmN0aW9uLCBJIGNhbiBwcmV2ZW50IHRoZSBtZXNzaW5nIHVwIG9mIHRhYmluZGV4IHZhbHVlcyBkb25lIGJ5OiBodHRwczovL2dpdGh1Yi5jb20vbm9lbGJvc3MvZmVhdGhlcmxpZ2h0L2Jsb2IvbWFzdGVyL3NyYy9mZWF0aGVybGlnaHQuanMjTDU1OVxuXHRcdH07XG5cblx0XHQkLmZlYXRoZXJsaWdodC5fY2FsbGJhY2tDaGFpbi5hZnRlckNsb3NlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIFNlZSBub3RlIGFib3ZlIGluICQuZmVhdGhlcmxpZ2h0Ll9jYWxsYmFja0NoYWluLmJlZm9yZU9wZW4uXG5cdFx0fTtcbiAgICB9O1xuXG4gICAgLy8gRG8gd2UgbWVldCB0aGUgcmVxdWlyZW1lbnRzP1xuICAgIGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXBwLiRjLmV2ZW50UGFnZS5sZW5ndGg7XG5cdH07XG5cblx0YXBwLmluaWZpdGVTY3JvbGwgPSBmdW5jdGlvbigpIHtcblx0XHQkKCAnLnRyaWJlLWV2ZW50cy1sb29wJyApLmluZmluaXRlU2Nyb2xsKFxuXHRcdFx0e1xuXHRcdFx0XHRwYXRoOiAnLnRyaWJlLWV2ZW50cy1uYXYtcmlnaHQgYScsXG5cdFx0XHRcdGFwcGVuZDogJy5ldmVudC1wb3N0Jyxcblx0XHRcdFx0c3RhdHVzOiAnLnBhZ2UtbG9hZC1zdGF0dXMnLFxuXHRcdFx0XHRoaXN0b3J5OiBmYWxzZVxuXHRcdFx0fVxuXHRcdCk7XG5cdH07XG5cblx0Ly8gU2VhcmNoIGV2ZW50cy5cblx0YXBwLnNlYXJjaEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy50cmliZUJhci5zdWJtaXQoKTtcblx0fTtcblxuXHQvLyBTaG93IHNvY2lhbCB3YXJlZmFyZSBzaGFyZSBidXR0b25zLlxuXHRhcHAuc2hvd1NoYXJlQnV0dG9ucyA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0Y29uc3QgZXZlbnRQb3N0ID0gJCggdGhpcyApLnBhcmVudHMoICcuZXZlbnQtcG9zdCcgKTtcblxuXHRcdGV2ZW50UG9zdC5maW5kKCAnLnN3cF9zb2NpYWxfcGFuZWwnICkuc2xpZGVUb2dnbGUoKTtcblx0fTtcblxuXHQvLyBTaG93IGZsYWdnaW5nIG1vZGFsLlxuXHRhcHAuc2hvd0ZsYWdNb2RhbCA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0Y29uc3QgZXZlbnRQb3N0ID0gJCggdGhpcyApLnBhcmVudHMoICcuZXZlbnQtcG9zdCcgKTtcblx0XHRjb25zdCB0aXRsZSAgICAgPSBldmVudFBvc3QuZmluZCggJy5ldmVudC1wb3N0LXRpdGxlJyApLnRleHQoKTtcblx0XHRjb25zdCB1cmwgICAgICAgPSBldmVudFBvc3QuZmluZCggJy5ldmVudC1wb3N0LXRpdGxlIGEnICkuYXR0ciggJ2hyZWYnICk7XG5cblxuXHRcdCQuZmVhdGhlcmxpZ2h0KCAnLmZsYWctZXZlbnQnLCB7XG5cdFx0XHRhZnRlck9wZW46IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zdCBjb250ZW50ID0gJCggdGhpcy4kY29udGVudCApO1xuXHRcdFx0XHRjb25zdCByZWNhcHRjaGEgPSBjb250ZW50LmZpbmQoICcuZ29vZ2xlLXJlY2FwdGNoYScgKTtcblx0XHRcdFx0Y29udGVudC5maW5kKCAnaW5wdXRbbmFtZT11cmxdJyApLnZhbCggdXJsICk7XG5cdFx0XHRcdGNvbnRlbnQuZmluZCggJ2lucHV0W25hbWU9dGl0bGVdJyApLnZhbCggdGl0bGUgKTtcblxuXHRcdFx0XHRpZiAoIHJlY2FwdGNoYS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0d2luZG93LmdyZWNhcHRjaGEucmVuZGVyKCByZWNhcHRjaGFbMF0sIHsgc2l0ZWtleTogcmVjYXB0Y2hhLmF0dHIoICdkYXRhLXNpdGVrZXknICkgfSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9O1xuXG5cdC8vIFN1Ym1pdCBmbGFnIGV2ZW50IHJlcG9ydC5cblx0YXBwLmZsYWdFdmVudFJlcG9ydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0Y29uc3Qgc3dlICAgICAgICA9IHdpbmRvdy5zd2U7XG5cdFx0Y29uc3QgbmFtZSAgICAgICA9ICQoIHRoaXMgKS5maW5kKCAnaW5wdXRbbmFtZT11c2VybmFtZV0nICkudmFsKCk7XG5cdFx0Y29uc3QgZW1haWwgICAgICA9ICQoIHRoaXMgKS5maW5kKCAnaW5wdXRbbmFtZT1lbWFpbF0nICkudmFsKCk7XG5cdFx0Y29uc3QgZW1haWxSZWdleCA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xuXG5cdFx0bGV0IHJlY2FwdGNoYSAgICA9ICcgJztcblxuXHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiggd2luZG93LmdyZWNhcHRjaGEgKSAgKSB7XG5cdFx0XHRyZWNhcHRjaGEgPSB3aW5kb3cuZ3JlY2FwdGNoYS5nZXRSZXNwb25zZSgpO1xuXHRcdH1cblxuXHRcdGlmICggJycgPT09IG5hbWUudHJpbSgpIHx8ICcnID09PSBlbWFpbC50cmltKCkgKSB7XG5cdFx0XHRhbGVydCggJ05hbWUgYW5kIGVtYWlsIGlzIHJlcXVpcmVkLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoICEgZW1haWxSZWdleC50ZXN0KCBlbWFpbCApICkge1xuXHRcdFx0YWxlcnQoICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIDAgPT09IHJlY2FwdGNoYS5sZW5ndGggKSB7XG5cdFx0XHRhbGVydCggJ1BsZWFzZSBjb21wbGV0ZSB0aGUgcmVDYXB0Y2hhLicgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBmb3JtID0gJCggdGhpcyApLnNlcmlhbGl6ZSgpO1xuXG5cdFx0Y29uc3QgZGF0YSA9IGAke2Zvcm19JmFjdGlvbj13ZHNfc3dlX2ZsYWdfZXZlbnQmbm9uY2U9JHtzd2UuZmxhZ0V2ZW50Tm9uY2V9YDtcblxuXHRcdCQucG9zdCggc3dlLmFqYXhVcmwsIGRhdGEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCggJy5mZWF0aGVybGlnaHQgLmZsYWctZXZlbnQgZm9ybScgKS5mYWRlT3V0KCk7XG5cdFx0XHQkKCAnLmZlYXRoZXJsaWdodCAuZmxhZy1ldmVudCAuZmxhZy1ldmVudC1zdWNjZXNzJyApLmZhZGVJbiggJ2Zhc3QnICk7XG5cdFx0fSApO1xuXHR9O1xuXG5cdC8vIERlYm91bmNlOiBodHRwczovL2Rhdmlkd2Fsc2gubmFtZS9qYXZhc2NyaXB0LWRlYm91bmNlLWZ1bmN0aW9uXG5cdGFwcC5kZWJvdW5jZSA9IGZ1bmN0aW9uKCBmdW5jLCB3YWl0LCBpbW1lZGlhdGUgKSB7XG5cdFx0dmFyIHRpbWVvdXQ7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGNvbnRleHQgPSB0aGlzLFxuXHRcdFx0XHRhcmdzID0gYXJndW1lbnRzO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBsYXRlciBmdW5jdGlvbi5cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gbGF0ZXIoKSB7XG5cdFx0XHRcdHRpbWVvdXQgPSBudWxsO1xuXHRcdFx0XHRpZiAoICEgaW1tZWRpYXRlICkge1xuXHRcdFx0XHRcdGZ1bmMuYXBwbHkoIGNvbnRleHQsIGFyZ3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0dmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgISB0aW1lb3V0O1xuXG5cdFx0XHRjbGVhclRpbWVvdXQoIHRpbWVvdXQgKTtcblxuXHRcdFx0dGltZW91dCA9IHNldFRpbWVvdXQoIGxhdGVyLCB3YWl0ICk7XG5cblx0XHRcdGlmICggY2FsbE5vdyApIHtcblx0XHRcdFx0ZnVuYy5hcHBseSggY29udGV4dCwgYXJncyApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH07XG5cbiAgICAvLyBFbmdhZ2UhXG4gICAgJCggYXBwLmluaXQgKTtcblxufSAoIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzRXZlbnRzICkgKTtcbiIsIi8qKlxuICogRmlsZTogZmx5b3V0LW1lbnUuanNcbiAqXG4gKiBDb250cm9scyB0aGUgZmx5b3V0IG1lbnUgaW4gdGhlIGhlYWRlci5cbiAqL1xud2luZG93Lndkc0ZseW91dE1lbnUgPSB7fTtcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xuXG5cdC8vIENvbnN0cnVjdG9yLlxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5jYWNoZSgpO1xuXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzLlxuXHRhcHAuY2FjaGUgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMgPSB7XG5cdFx0XHRib2R5OiAkKCAnYm9keScgKSxcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXG5cdFx0XHRmbHlPdXRNZW51OiAkKCAnLmZseW91dC1tZW51JyApLFxuXHRcdFx0bmF2RHJhd2VyQnV0dG9uOiAkKCAnLm5hdi1kcmF3ZXItYnV0dG9uJyApLFxuXHRcdFx0Y2xvc2VCdXR0b246ICQoICcuY2xvc2UtYnV0dG9uJyApXG5cdFx0fTtcblx0fTtcblxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBhcHAuJGMuZmx5T3V0TWVudS5sZW5ndGg7XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gT3BlbiBGbHlvdXQgTWVudSB3aGVuIDMgZG90cyBpY29uIGluIGhlYWRlciBpcyBjbGlja2VkL3RvdWNoZWQuXG5cdFx0YXBwLiRjLm5hdkRyYXdlckJ1dHRvbi5vbiggJ2NsaWNrJywgYXBwLm9wZW5GbHlvdXQgKTtcblxuXHRcdC8vIENsb3NlIEZseW91dCBNZW51IHdoZW4gdGhlIGNsb3NlIFggYnV0dG9uIGluIHRoZSBtZW51IGlzIGNsaWNrZWQvdG91Y2hlZC5cblx0XHRhcHAuJGMuY2xvc2VCdXR0b24ub24oICdjbGljaycsIGFwcC5jbG9zZUZseW91dCApO1xuXG5cdFx0Ly8gQ2xvc2UgdGhlIEZseW91dCBNZW51IHdoZW4gdGhlIHVzZXIgY2xpY2tzL3RvdWNoZXMgb3V0c2lkZSB0aGUgbWVudS5cblx0XHRhcHAuJGMuYm9keS5vbiggJ2NsaWNrJywgYXBwLmNsb3NlRmx5b3V0QnlDbGljayApO1xuXG5cdFx0YXBwLiRjLmZseU91dE1lbnUub24oICd0cmFuc2l0aW9uZW5kJywgYXBwLnJlc2V0Rmx5b3V0TWVudSApO1xuXG5cdH07XG5cblx0Ly8gT3BlbiB0aGUgRmx5b3V0IE1lbnUuXG5cdGFwcC5vcGVuRmx5b3V0ID0gZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBPcGVuIHRoZSBmbHlvdXQgbWVudSwgYW5kIHNldCB0aGUgY29ycmVzcG9uZGluZyBidXR0b24gYXJpYSB0byB0cnVlLlxuXHRcdGFwcC4kYy5mbHlPdXRNZW51LmFkZENsYXNzKCAnaXMtdmlzaWJsZSBhbmltYXRlZCBzbGlkZUluUmlnaHQnICkuZmluZCggJy5uYXYtZHJhd2VyLWJ1dHRvbicgKS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIHRydWUgKTtcblxuXHR9O1xuXG5cdC8vIENsb3NlIHRoZSBGbHlvdXQgTWVudS5cblx0YXBwLmNsb3NlRmx5b3V0ID0gZnVuY3Rpb24oKSB7XG5cblx0XHRhcHAuJGMuZmx5T3V0TWVudS5lYWNoKCBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gT25seSBjbG9zZSB0aGUgZmx5b3V0IGlmIGl0J3Mgb3Blbi5cblx0XHRcdGlmICggYXBwLiRjLmZseU91dE1lbnUuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICkge1xuXG5cdFx0XHRcdC8vIENsb3NlIHRoZSBmbHlvdXQuXG5cdFx0XHRcdCQoIHRoaXMgKS5yZW1vdmVDbGFzcyggJ2lzLXZpc2libGUgc2xpZGVJblJpZ2h0JyApLmFkZENsYXNzKCAnc2xpZGVPdXRSaWdodCcgKS5maW5kKCAnLm5hdi1kcmF3ZXItYnV0dG9uJyApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZXQgYSB0aW1lb3V0IGZvciBhZGRpbmcvcmVtb3ZpbmcgdGhlc2UgY2xhc3NlcyBvciBlbHNlIHRoZXkgd29uJ3QgaGF2ZSB0aW1lIHRvIGZpcmUuXG5cdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHQvLyBSZW1vdmUgdGhlIGNsYXNzZXMgZnJvbSB0aGUgZmx5b3V0IG1lbnUgc28gaXQgaXMgcmVhZHkgdG8gdG9nZ2xlIGFnYWluLlxuXHRcdFx0XHRpZiAoICEgJCggJy5mbHlvdXQtbWVudScgKS5oYXNDbGFzcyggJ2lzLXZpc2libGUnICkgKSB7XG5cdFx0XHRcdFx0JCggJy5mbHlvdXQtbWVudScgKS5yZW1vdmVDbGFzcyggJ3NsaWRlT3V0UmlnaHQnICk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDEwMDAgKTtcblxuXHRcdH0gKTtcblxuXHR9O1xuXG5cdC8vIENsb3NlIGlmIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIG9mIHRoZSBmbHlvdXQuXG5cdGFwcC5jbG9zZUZseW91dEJ5Q2xpY2sgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRpZiAoICEgJCggZXZlbnQudGFyZ2V0ICkucGFyZW50cyggJ3NlY3Rpb24nICkuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICYmICEgJCggZXZlbnQudGFyZ2V0ICkuaGFzQ2xhc3MoICduYXYtZHJhd2VyLWJ1dHRvbicgKSAmJiAhICQoIGV2ZW50LnRhcmdldCApLmhhc0NsYXNzKCAnaXMtdmlzaWJsZScgKSApIHtcblx0XHRcdGFwcC5jbG9zZUZseW91dCgpO1xuXHRcdH1cblxuXHR9O1xuXG5cdC8vIFJlc2V0IHRoZSBmbHlvdXQgbWVudSBjbGFzc2VzIGFmdGVyIGl0J3MgY2xvc2VkLlxuXHRhcHAucmVzZXRGbHlvdXRNZW51ID0gZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBSZW1vdmUgdGhlIGNsYXNzZXMgZnJvbSB0aGUgZmx5b3V0IG1lbnUgc28gaXQgaXMgcmVhZHkgdG8gdG9nZ2xlIGFnYWluLlxuXHRcdGlmICggISAkKCAnLmZseW91dC1tZW51JyApLmhhc0NsYXNzKCAnaXMtdmlzaWJsZScgKSApIHtcblx0XHRcdCQoICcuZmx5b3V0LW1lbnUnICkucmVtb3ZlQ2xhc3MoICdzbGlkZU91dFJpZ2h0JyApO1xuXHRcdH1cblxuXHR9O1xuXG5cdC8vIEVuZ2FnZSFcblx0JCggYXBwLmluaXQgKTtcblxufSggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNGbHlvdXRNZW51ICkgKTtcbiIsIi8qKlxuICogU2hvdy9IaWRlIHRoZSBTZWFyY2ggRm9ybSBpbiB0aGUgaGVhZGVyLlxuICpcbiAqIEBhdXRob3IgQ29yZXkgQ29sbGluc1xuICovXG53aW5kb3cuU2hvd0hpZGVTZWFyY2hGb3JtID0ge307XG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcblxuXHQvLyBDb25zdHJ1Y3RvclxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5jYWNoZSgpO1xuXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXG5cdFx0XHRib2R5OiAkKCAnYm9keScgKSxcblx0XHRcdGhlYWRlclNlYXJjaEZvcm06ICQoICcuc2l0ZS1oZWFkZXItYWN0aW9uIC5zZWFyY2gtYnV0dG9uJyApXG5cdFx0fTtcblx0fTtcblxuXHQvLyBDb21iaW5lIGFsbCBldmVudHNcblx0YXBwLmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMuaGVhZGVyU2VhcmNoRm9ybS5vbiggJ2tleXVwIHRvdWNoc3RhcnQgY2xpY2snLCBhcHAuc2hvd0hpZGVTZWFyY2hGb3JtICk7XG5cdFx0YXBwLiRjLmJvZHkub24oICdrZXl1cCB0b3VjaHN0YXJ0IGNsaWNrJywgYXBwLmhpZGVTZWFyY2hGb3JtICk7XG5cdH07XG5cblx0Ly8gRG8gd2UgbWVldCB0aGUgcmVxdWlyZW1lbnRzP1xuXHRhcHAubWVldHNSZXF1aXJlbWVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gYXBwLiRjLmhlYWRlclNlYXJjaEZvcm0ubGVuZ3RoO1xuXHR9O1xuXG5cdC8vIEFkZHMgdGhlIHRvZ2dsZSBjbGFzcyBmb3IgdGhlIHNlYXJjaCBmb3JtLlxuXHRhcHAuc2hvd0hpZGVTZWFyY2hGb3JtID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLiRjLmJvZHkudG9nZ2xlQ2xhc3MoICdzZWFyY2gtZm9ybS12aXNpYmxlJyApO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cdC8vIEhpZGVzIHRoZSBzZWFyY2ggZm9ybSBpZiB3ZSBjbGljayBvdXRzaWRlIG9mIGl0cyBjb250YWluZXIuXG5cdGFwcC5oaWRlU2VhcmNoRm9ybSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdGlmICggISAkKCBldmVudC50YXJnZXQgKS5wYXJlbnRzKCAnZGl2JyApLmhhc0NsYXNzKCAnc2l0ZS1oZWFkZXItYWN0aW9uJyApICkge1xuXHRcdFx0YXBwLiRjLmJvZHkucmVtb3ZlQ2xhc3MoICdzZWFyY2gtZm9ybS12aXNpYmxlJyApO1xuXHRcdH1cblx0fTtcblxuXHQvLyBFbmdhZ2Vcblx0JCggYXBwLmluaXQgKTtcblxufSAoIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cuU2hvd0hpZGVTZWFyY2hGb3JtICkgKTtcbiIsIi8qKlxuICogRmlsZSBqcy1lbmFibGVkLmpzXG4gKlxuICogSWYgSmF2YXNjcmlwdCBpcyBlbmFibGVkLCByZXBsYWNlIHRoZSA8Ym9keT4gY2xhc3MgXCJuby1qc1wiLlxuICovXG5kb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLnJlcGxhY2UoICduby1qcycsICdqcycgKTtcbiIsIi8qKlxuICogRmlsZTogbW9iaWxlLW1lbnUuanNcbiAqXG4gKiBGdW5jdGlvbmFsaXR5IGZvciB0aGUgaGFtYnVyZ2VyIG1lbnUuXG4gKi9cbndpbmRvdy53ZHNNb2JpbGVNZW51ID0ge307XG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcblxuXHQvLyBDb25zdHJ1Y3Rvci5cblx0YXBwLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuY2FjaGUoKTtcblxuXHRcdGlmICggYXBwLm1lZXRzUmVxdWlyZW1lbnRzKCkgKSB7XG5cdFx0XHRhcHAuYmluZEV2ZW50cygpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBDYWNoZSBhbGwgdGhlIHRoaW5ncy5cblx0YXBwLmNhY2hlID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLiRjID0ge1xuXHRcdFx0Ym9keTogJCggJ2JvZHknICksXG5cdFx0XHR3aW5kb3c6ICQoIHdpbmRvdyApLFxuXHRcdFx0c3ViTWVudUNvbnRhaW5lcjogJCggJy5tb2JpbGUtbWVudSAuc3ViLW1lbnUsIC51dGlsaXR5LW5hdmlnYXRpb24gLnN1Yi1tZW51JyApLFxuXHRcdFx0c3ViU3ViTWVudUNvbnRhaW5lcjogJCggJy5tb2JpbGUtbWVudSAuc3ViLW1lbnUgLnN1Yi1tZW51JyApLFxuXHRcdFx0c3ViTWVudVBhcmVudEl0ZW06ICQoICcubW9iaWxlLW1lbnUgbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbiwgLnV0aWxpdHktbmF2aWdhdGlvbiBsaS5tZW51LWl0ZW0taGFzLWNoaWxkcmVuJyApLFxuXHRcdFx0c3ViTWVudVBhcmVudEl0ZW1MaW5rOiAkKCAnLm1vYmlsZS1tZW51IC5tZW51LWl0ZW0taGFzLWNoaWxkcmVuID4gYScgKSxcblx0XHRcdG9mZkNhbnZhc0NvbnRhaW5lcjogJCggJy5vZmYtY2FudmFzLWNvbnRhaW5lcicgKSxcblx0XHRcdG9mZkNhbnZhc09wZW46ICQoICcub2ZmLWNhbnZhcy1vcGVuJyApXG5cdFx0fTtcblx0fTtcblxuXHQvLyBDb21iaW5lIGFsbCBldmVudHMuXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLiRjLndpbmRvdy5vbiggJ2xvYWQnLCBhcHAuYWRkRG93bkFycm93ICk7XG5cdFx0YXBwLiRjLnN1Yk1lbnVQYXJlbnRJdGVtLm9uKCAnY2xpY2snLCBhcHAudG9nZ2xlU3VibWVudSApO1xuXHRcdGFwcC4kYy5zdWJNZW51UGFyZW50SXRlbS5vbiggJ3RyYW5zaXRpb25lbmQnLCBhcHAucmVzZXRTdWJNZW51ICk7XG5cdFx0YXBwLiRjLm9mZkNhbnZhc0NvbnRhaW5lci5vbiggJ3RyYW5zaXRpb25lbmQnLCBhcHAuZm9yY2VDbG9zZVN1Ym1lbnVzICk7XG5cdFx0YXBwLiRjLm9mZkNhbnZhc09wZW4ub24oICdjbGljaycsIGFwcC5vcGVuU3VibWVudXNCeURlZmF1bHQgKTtcblx0fTtcblxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBhcHAuJGMuc3ViTWVudUNvbnRhaW5lci5sZW5ndGg7XG5cdH07XG5cblx0Ly8gUmVzZXQgdGhlIHN1Ym1lbnVzIGFmdGVyIGl0J3MgZG9uZSBjbG9zaW5nLlxuXHRhcHAucmVzZXRTdWJNZW51ID0gZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBXaGVuIHRoZSBsaXN0IGl0ZW0gaXMgZG9uZSB0cmFuc2l0aW9uaW5nIGluIGhlaWdodCxcblx0XHQvLyByZW1vdmUgdGhlIGNsYXNzZXMgZnJvbSB0aGUgc3VibWVudSBzbyBpdCBpcyByZWFkeSB0byB0b2dnbGUgYWdhaW4uXG5cdFx0aWYgKCAkKCB0aGlzICkuaXMoICdsaS5tZW51LWl0ZW0taGFzLWNoaWxkcmVuJyApICYmICEgJCggdGhpcyApLmhhc0NsYXNzKCAnaXMtdmlzaWJsZScgKSApIHtcblx0XHRcdCQoIHRoaXMgKS5maW5kKCAndWwuc3ViLW1lbnUnICkucmVtb3ZlQ2xhc3MoICdzbGlkZU91dExlZnQgaXMtdmlzaWJsZScgKTtcblx0XHR9XG5cblx0fTtcblxuXHQvLyBTbGlkZSBvdXQgdGhlIHN1Ym1lbnUgaXRlbXMuXG5cdGFwcC5zbGlkZU91dFN1Yk1lbnVzID0gZnVuY3Rpb24oIGVsICkge1xuXG5cdFx0Ly8gSWYgdGhpcyBpdGVtJ3MgcGFyZW50IGlzIHZpc2libGUgYW5kIHRoaXMgaXMgbm90LCBiYWlsLlxuXHRcdGlmICggZWwucGFyZW50KCkuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICYmICEgZWwuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoaXMgaXRlbSdzIHBhcmVudCBpcyB2aXNpYmxlIGFuZCB0aGlzIGl0ZW0gaXMgdmlzaWJsZSwgaGlkZSBpdHMgc3VibWVudSB0aGVuIGJhaWwuXG5cdFx0aWYgKCBlbC5wYXJlbnQoKS5oYXNDbGFzcyggJ2lzLXZpc2libGUnICkgJiYgZWwuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICkge1xuXHRcdFx0ZWwucmVtb3ZlQ2xhc3MoICdpcy12aXNpYmxlJyApLmZpbmQoICcuc3ViLW1lbnUnICkucmVtb3ZlQ2xhc3MoICdzbGlkZUluTGVmdCcgKS5hZGRDbGFzcyggJ3NsaWRlT3V0TGVmdCcgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRhcHAuJGMuc3ViTWVudUNvbnRhaW5lci5lYWNoKCBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gT25seSB0cnkgdG8gY2xvc2Ugc3VibWVudXMgdGhhdCBhcmUgYWN0dWFsbHkgb3Blbi5cblx0XHRcdGlmICggJCggdGhpcyApLmhhc0NsYXNzKCAnc2xpZGVJbkxlZnQnICkgKSB7XG5cblx0XHRcdFx0Ly8gQ2xvc2UgdGhlIHBhcmVudCBsaXN0IGl0ZW0sIGFuZCBzZXQgdGhlIGNvcnJlc3BvbmRpbmcgYnV0dG9uIGFyaWEgdG8gZmFsc2UuXG5cdFx0XHRcdCQoIHRoaXMgKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyggJ2lzLXZpc2libGUnICkuZmluZCggJy5wYXJlbnQtaW5kaWNhdG9yJyApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKTtcblxuXHRcdFx0XHQvLyBTbGlkZSBvdXQgdGhlIHN1Ym1lbnUuXG5cdFx0XHRcdCQoIHRoaXMgKS5yZW1vdmVDbGFzcyggJ3NsaWRlSW5MZWZ0JyApLmFkZENsYXNzKCAnc2xpZGVPdXRMZWZ0JyApO1xuXHRcdFx0fVxuXG5cdFx0fSApO1xuXHR9O1xuXG5cdC8vIEFkZCB0aGUgZG93biBhcnJvdyB0byBzdWJtZW51IHBhcmVudHMuXG5cdGFwcC5hZGREb3duQXJyb3cgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMuc3ViTWVudVBhcmVudEl0ZW1MaW5rLmFwcGVuZCggJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiIGNsYXNzPVwicGFyZW50LWluZGljYXRvclwiIGFyaWEtbGFiZWw9XCJPcGVuIHN1Ym1lbnVcIj48c3BhbiBjbGFzcz1cImRvd24tYXJyb3dcIj4+PC9zcGFuPjwvYnV0dG9uPicgKTtcblx0fTtcblxuXHQvLyBEZWFsIHdpdGggdGhlIHN1Ym1lbnUuXG5cdGFwcC50b2dnbGVTdWJtZW51ID0gZnVuY3Rpb24oIGUgKSB7XG5cblx0XHRsZXQgZWwgPSAkKCB0aGlzICksIC8vIFRoZSBtZW51IGVsZW1lbnQgd2hpY2ggd2FzIGNsaWNrZWQgb24uXG5cdFx0XHRzdWJNZW51ID0gZWwuY2hpbGRyZW4oICd1bC5zdWItbWVudScgKSwgLy8gVGhlIG5lYXJlc3Qgc3VibWVudS5cblx0XHRcdCR0YXJnZXQgPSAkKCBlLnRhcmdldCApOyAvLyB0aGUgZWxlbWVudCB0aGF0J3MgYWN0dWFsbHkgYmVpbmcgY2xpY2tlZCAoY2hpbGQgb2YgdGhlIGxpIHRoYXQgdHJpZ2dlcmVkIHRoZSBjbGljayBldmVudCkuXG5cblx0XHQvLyBGaWd1cmUgb3V0IGlmIHdlJ3JlIGNsaWNraW5nIHRoZSBidXR0b24gb3IgaXRzIGFycm93IGNoaWxkLFxuXHRcdC8vIGlmIHNvLCB3ZSBjYW4ganVzdCBvcGVuIG9yIGNsb3NlIHRoZSBtZW51IGFuZCBiYWlsLlxuXHRcdGlmICggJHRhcmdldC5oYXNDbGFzcyggJ2Rvd24tYXJyb3cnICkgfHwgJHRhcmdldC5oYXNDbGFzcyggJ3BhcmVudC1pbmRpY2F0b3InICkgKSB7XG5cblx0XHRcdC8vIEZpcnN0LCBjb2xsYXBzZSBhbnkgYWxyZWFkeSBvcGVuZWQgc3VibWVudXMuXG5cdFx0XHRhcHAuc2xpZGVPdXRTdWJNZW51cyggZWwgKTtcblxuXHRcdFx0aWYgKCAhIHN1Yk1lbnUuaGFzQ2xhc3MoICdpcy12aXNpYmxlJyApICkge1xuXG5cdFx0XHRcdC8vIE9wZW4gdGhlIHN1Ym1lbnUuXG5cdFx0XHRcdGFwcC5vcGVuU3VibWVudSggZWwsIHN1Yk1lbnUgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdH07XG5cblx0Ly8gT3BlbiBhIHN1Ym1lbnUuXG5cdGFwcC5vcGVuU3VibWVudSA9IGZ1bmN0aW9uKCBwYXJlbnQsIHN1Yk1lbnUgKSB7XG5cblx0XHQvLyBFeHBhbmQgdGhlIGxpc3QgbWVudSBpdGVtLCBhbmQgc2V0IHRoZSBjb3JyZXNwb25kaW5nIGJ1dHRvbiBhcmlhIHRvIHRydWUuXG5cdFx0cGFyZW50LmFkZENsYXNzKCAnaXMtdmlzaWJsZScgKS5maW5kKCAnLnBhcmVudC1pbmRpY2F0b3InICkuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCB0cnVlICk7XG5cblx0XHQvLyBTbGlkZSB0aGUgbWVudSBpbi5cblx0XHRzdWJNZW51LmFkZENsYXNzKCAnaXMtdmlzaWJsZSBhbmltYXRlZCBzbGlkZUluTGVmdCcgKTtcblx0fTtcblxuXHQvLyBPcGVuIHN1Ym1lbnVzIGJ5IGRlZmF1bHQuXG5cdGFwcC5vcGVuU3VibWVudXNCeURlZmF1bHQgPSBmdW5jdGlvbigpIHtcblxuXHRcdC8vIEV4cGFuZCB0aGUgbGlzdCBtZW51IGl0ZW0sIGFuZCBzZXQgdGhlIGNvcnJlc3BvbmRpbmcgYnV0dG9uIGFyaWEgdG8gdHJ1ZS5cblx0XHQkKCAnLm1vYmlsZS1tZW51IGxpLm1lbnUtaXRlbS1oYXMtY2hpbGRyZW4nICkuYWRkQ2xhc3MoICdpcy12aXNpYmxlJyApLmZpbmQoICcucGFyZW50LWluZGljYXRvcicgKS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIHRydWUgKTtcblxuXHRcdC8vIFNldCBzdWJtZW51IGNsYXNzIHRvICdvcGVuJy5cblx0XHQkKCAndWwuc3ViLW1lbnUnICkuYWRkQ2xhc3MoICdpcy12aXNpYmxlIGFuaW1hdGVkIHNsaWRlSW5MZWZ0JyApO1xuXG5cdH07XG5cblx0Ly8gRm9yY2UgY2xvc2UgYWxsIHRoZSBzdWJtZW51cyB3aGVuIHRoZSBtYWluIG1lbnUgY29udGFpbmVyIGlzIGNsb3NlZC5cblx0YXBwLmZvcmNlQ2xvc2VTdWJtZW51cyA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gVGhlIHRyYW5zaXRpb25lbmQgZXZlbnQgdHJpZ2dlcnMgb24gb3BlbiBhbmQgb24gY2xvc2UsIG5lZWQgdG8gbWFrZSBzdXJlIHdlIG9ubHkgZG8gdGhpcyBvbiBjbG9zZS5cblx0XHRpZiAoICEgJCggdGhpcyApLmhhc0NsYXNzKCAnaXMtdmlzaWJsZScgKSApIHtcblx0XHRcdGFwcC4kYy5zdWJNZW51UGFyZW50SXRlbS5yZW1vdmVDbGFzcyggJ2lzLXZpc2libGUnICkuZmluZCggJy5wYXJlbnQtaW5kaWNhdG9yJyApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKTtcblx0XHRcdGFwcC4kYy5zdWJNZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCAnaXMtdmlzaWJsZSBzbGlkZUluTGVmdCcgKTtcblx0XHRcdGFwcC4kYy5ib2R5LmNzcyggJ292ZXJmbG93JywgJ3Zpc2libGUnICk7XG5cdFx0XHRhcHAuJGMuYm9keS51bmJpbmQoICd0b3VjaHN0YXJ0JyApO1xuXHRcdH1cblxuXHRcdGlmICggJCggdGhpcyApLmhhc0NsYXNzKCAnaXMtdmlzaWJsZScgKSApIHtcblx0XHRcdGFwcC4kYy5ib2R5LmNzcyggJ292ZXJmbG93JywgJ2hpZGRlbicgKTtcblx0XHRcdGFwcC4kYy5ib2R5LmJpbmQoICd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdGlmICggISAkKCBlLnRhcmdldCApLnBhcmVudHMoICcuY29udGFjdC1tb2RhbCcgKVswXSApIHtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gRW5nYWdlIVxuXHQkKCBhcHAuaW5pdCApO1xuXG59KCB3aW5kb3csIGpRdWVyeSwgd2luZG93Lndkc01vYmlsZU1lbnUgKSApO1xuIiwiLyoqXG4gKiBGaWxlIG1vZGFsLmpzXG4gKlxuICogRGVhbCB3aXRoIG11bHRpcGxlIG1vZGFscyBhbmQgdGhlaXIgbWVkaWEuXG4gKi9cbndpbmRvdy53ZHNNb2RhbCA9IHt9O1xuKCBmdW5jdGlvbiggd2luZG93LCAkLCBhcHAgKSB7XG5cblx0bGV0ICRtb2RhbFRvZ2dsZSxcblx0XHQkZm9jdXNhYmxlQ2hpbGRyZW4sXG5cdFx0JHBsYXllcixcblx0XHQkdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NjcmlwdCcgKSxcblx0XHQkZmlyc3RTY3JpcHRUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ3NjcmlwdCcgKVswXSxcblx0XHRZVDtcblxuXHQvLyBDb25zdHJ1Y3Rvci5cblx0YXBwLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuY2FjaGUoKTtcblxuXHRcdGlmICggYXBwLm1lZXRzUmVxdWlyZW1lbnRzKCkgKSB7XG5cdFx0XHQkZmlyc3RTY3JpcHRUYWcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoICR0YWcsICRmaXJzdFNjcmlwdFRhZyApO1xuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdCdib2R5JzogJCggJ2JvZHknIClcblx0XHR9O1xuXHR9O1xuXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cblx0YXBwLm1lZXRzUmVxdWlyZW1lbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICQoICcubW9kYWwtdHJpZ2dlcicgKS5sZW5ndGg7XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gVHJpZ2dlciBhIG1vZGFsIHRvIG9wZW4uXG5cdFx0YXBwLiRjLmJvZHkub24oICdjbGljayB0b3VjaHN0YXJ0JywgJy5tb2RhbC10cmlnZ2VyJywgYXBwLm9wZW5Nb2RhbCApO1xuXG5cdFx0Ly8gVHJpZ2dlciB0aGUgY2xvc2UgYnV0dG9uIHRvIGNsb3NlIHRoZSBtb2RhbC5cblx0XHRhcHAuJGMuYm9keS5vbiggJ2NsaWNrIHRvdWNoc3RhcnQnLCAnLmNsb3NlJywgYXBwLmNsb3NlTW9kYWwgKTtcblxuXHRcdC8vIEFsbG93IHRoZSB1c2VyIHRvIGNsb3NlIHRoZSBtb2RhbCBieSBoaXR0aW5nIHRoZSBlc2Mga2V5LlxuXHRcdGFwcC4kYy5ib2R5Lm9uKCAna2V5ZG93bicsIGFwcC5lc2NLZXlDbG9zZSApO1xuXG5cdFx0Ly8gQWxsb3cgdGhlIHVzZXIgdG8gY2xvc2UgdGhlIG1vZGFsIGJ5IGNsaWNraW5nIG91dHNpZGUgb2YgdGhlIG1vZGFsLlxuXHRcdGFwcC4kYy5ib2R5Lm9uKCAnY2xpY2sgdG91Y2hzdGFydCcsICdkaXYubW9kYWwtb3BlbicsIGFwcC5jbG9zZU1vZGFsQnlDbGljayApO1xuXG5cdFx0Ly8gTGlzdGVuIHRvIHRhYnMsIHRyYXAga2V5Ym9hcmQgaWYgd2UgbmVlZCB0b1xuXHRcdGFwcC4kYy5ib2R5Lm9uKCAna2V5ZG93bicsIGFwcC50cmFwS2V5Ym9hcmRNYXliZSApO1xuXG5cdH07XG5cblx0Ly8gT3BlbiB0aGUgbW9kYWwuXG5cdGFwcC5vcGVuTW9kYWwgPSBmdW5jdGlvbigpIHtcblxuXHRcdC8vIFN0b3JlIHRoZSBtb2RhbCB0b2dnbGUgZWxlbWVudFxuXHRcdCRtb2RhbFRvZ2dsZSA9ICQoIHRoaXMgKTtcblxuXHRcdC8vIEZpZ3VyZSBvdXQgd2hpY2ggbW9kYWwgd2UncmUgb3BlbmluZyBhbmQgc3RvcmUgdGhlIG9iamVjdC5cblx0XHRsZXQgJG1vZGFsID0gJCggJCggdGhpcyApLmRhdGEoICd0YXJnZXQnICkgKTtcblxuXHRcdC8vIERpc3BsYXkgdGhlIG1vZGFsLlxuXHRcdCRtb2RhbC5hZGRDbGFzcyggJ21vZGFsLW9wZW4nICk7XG5cblx0XHQvLyBBZGQgYm9keSBjbGFzcy5cblx0XHRhcHAuJGMuYm9keS5hZGRDbGFzcyggJ21vZGFsLW9wZW4nICk7XG5cblx0XHQvLyBGaW5kIHRoZSBmb2N1c2FibGUgY2hpbGRyZW4gb2YgdGhlIG1vZGFsLlxuXHRcdC8vIFRoaXMgbGlzdCBtYXkgYmUgaW5jb21wbGV0ZSwgcmVhbGx5IHdpc2ggalF1ZXJ5IGhhZCB0aGUgOmZvY3VzYWJsZSBwc2V1ZG8gbGlrZSBqUXVlcnkgVUkgZG9lcy5cblx0XHQvLyBGb3IgbW9yZSBhYm91dCA6aW5wdXQgc2VlOiBodHRwczovL2FwaS5qcXVlcnkuY29tL2lucHV0LXNlbGVjdG9yL1xuXHRcdCRmb2N1c2FibGVDaGlsZHJlbiA9ICRtb2RhbC5maW5kKCAnYSwgOmlucHV0LCBbdGFiaW5kZXhdJyApO1xuXG5cdFx0Ly8gSWRlYWxseSwgdGhlcmUgaXMgYWx3YXlzIG9uZSAodGhlIGNsb3NlIGJ1dHRvbiksIGJ1dCB5b3UgbmV2ZXIga25vdy5cblx0XHRpZiAoIDAgPCAkZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoICkge1xuXG5cdFx0XHQvLyBTaGlmdCBmb2N1cyB0byB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQuXG5cdFx0XHQkZm9jdXNhYmxlQ2hpbGRyZW5bMF0uZm9jdXMoKTtcblx0XHR9XG5cblx0fTtcblxuXHQvLyBDbG9zZSB0aGUgbW9kYWwuXG5cdGFwcC5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBGaWd1cmUgdGhlIG9wZW5lZCBtb2RhbCB3ZSdyZSBjbG9zaW5nIGFuZCBzdG9yZSB0aGUgb2JqZWN0LlxuXHRcdGxldCAkbW9kYWwgPSAkKCAkKCAnZGl2Lm1vZGFsLW9wZW4gLmNsb3NlJyApLmRhdGEoICd0YXJnZXQnICkgKSxcblxuXHRcdFx0Ly8gRmluZCB0aGUgaWZyYW1lIGluIHRoZSAkbW9kYWwgb2JqZWN0LlxuXHRcdFx0JGlmcmFtZSA9ICRtb2RhbC5maW5kKCAnaWZyYW1lJyApO1xuXG5cdFx0Ly8gT25seSBkbyB0aGlzIGlmIHRoZXJlIGFyZSBhbnkgaWZyYW1lcy5cblx0XHRpZiAoICRpZnJhbWUubGVuZ3RoICkge1xuXG5cdFx0XHQvLyBHZXQgdGhlIGlmcmFtZSBzcmMgVVJMLlxuXHRcdFx0bGV0IHVybCA9ICRpZnJhbWUuYXR0ciggJ3NyYycgKTtcblxuXHRcdFx0Ly8gUmVtb3ZpbmcvUmVhZGRpbmcgdGhlIFVSTCB3aWxsIGVmZmVjdGl2ZWx5IGJyZWFrIHRoZSBZb3VUdWJlIEFQSS5cblx0XHRcdC8vIFNvIGxldCdzIG5vdCBkbyB0aGF0IHdoZW4gdGhlIGlmcmFtZSBVUkwgY29udGFpbnMgdGhlIGVuYWJsZWpzYXBpIHBhcmFtZXRlci5cblx0XHRcdGlmICggISB1cmwuaW5jbHVkZXMoICdlbmFibGVqc2FwaT0xJyApICkge1xuXG5cdFx0XHRcdC8vIFJlbW92ZSB0aGUgc291cmNlIFVSTCwgdGhlbiBhZGQgaXQgYmFjaywgc28gdGhlIHZpZGVvIGNhbiBiZSBwbGF5ZWQgYWdhaW4gbGF0ZXIuXG5cdFx0XHRcdCRpZnJhbWUuYXR0ciggJ3NyYycsICcnICkuYXR0ciggJ3NyYycsIHVybCApO1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBVc2UgdGhlIFlvdVR1YmUgQVBJIHRvIHN0b3AgdGhlIHZpZGVvLlxuXHRcdFx0XHQkcGxheWVyLnN0b3BWaWRlbygpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEZpbmFsbHksIGhpZGUgdGhlIG1vZGFsLlxuXHRcdCRtb2RhbC5yZW1vdmVDbGFzcyggJ21vZGFsLW9wZW4nICk7XG5cblx0XHQvLyBSZW1vdmUgdGhlIGJvZHkgY2xhc3MuXG5cdFx0YXBwLiRjLmJvZHkucmVtb3ZlQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0Ly8gUmV2ZXJ0IGZvY3VzIGJhY2sgdG8gdG9nZ2xlIGVsZW1lbnRcblx0XHQkbW9kYWxUb2dnbGUuZm9jdXMoKTtcblxuXHR9O1xuXG5cdC8vIENsb3NlIGlmIFwiZXNjXCIga2V5IGlzIHByZXNzZWQuXG5cdGFwcC5lc2NLZXlDbG9zZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoIDI3ID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0YXBwLmNsb3NlTW9kYWwoKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2xvc2UgaWYgdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgdGhlIG1vZGFsXG5cdGFwcC5jbG9zZU1vZGFsQnlDbGljayA9IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdC8vIElmIHRoZSBwYXJlbnQgY29udGFpbmVyIGlzIE5PVCB0aGUgbW9kYWwgZGlhbG9nIGNvbnRhaW5lciwgY2xvc2UgdGhlIG1vZGFsXG5cdFx0aWYgKCAhICQoIGV2ZW50LnRhcmdldCApLnBhcmVudHMoICdkaXYnICkuaGFzQ2xhc3MoICdtb2RhbC1kaWFsb2cnICkgKSB7XG5cdFx0XHRhcHAuY2xvc2VNb2RhbCgpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBUcmFwIHRoZSBrZXlib2FyZCBpbnRvIGEgbW9kYWwgd2hlbiBvbmUgaXMgYWN0aXZlLlxuXHRhcHAudHJhcEtleWJvYXJkTWF5YmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHQvLyBXZSBvbmx5IG5lZWQgdG8gZG8gc3R1ZmYgd2hlbiB0aGUgbW9kYWwgaXMgb3BlbiBhbmQgdGFiIGlzIHByZXNzZWQuXG5cdFx0aWYgKCA5ID09PSBldmVudC53aGljaCAmJiAwIDwgJCggJy5tb2RhbC1vcGVuJyApLmxlbmd0aCApIHtcblx0XHRcdGxldCAkZm9jdXNlZCA9ICQoICc6Zm9jdXMnICksXG5cdFx0XHRcdGZvY3VzSW5kZXggPSAkZm9jdXNhYmxlQ2hpbGRyZW4uaW5kZXgoICRmb2N1c2VkICk7XG5cblx0XHRcdGlmICggMCA9PT0gZm9jdXNJbmRleCAmJiBldmVudC5zaGlmdEtleSApIHtcblxuXHRcdFx0XHQvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudCwgYW5kIHNoaWZ0IGlzIGhlbGQgd2hlbiBwcmVzc2luZyB0YWIsIGdvIGJhY2sgdG8gbGFzdCBmb2N1c2FibGUgZWxlbWVudC5cblx0XHRcdFx0JGZvY3VzYWJsZUNoaWxkcmVuWyAkZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoIC0gMSBdLmZvY3VzKCk7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9IGVsc2UgaWYgKCAhIGV2ZW50LnNoaWZ0S2V5ICYmIGZvY3VzSW5kZXggPT09ICRmb2N1c2FibGVDaGlsZHJlbi5sZW5ndGggLSAxICkge1xuXG5cdFx0XHRcdC8vIElmIHRoaXMgaXMgdGhlIGxhc3QgZm9jdXNhYmxlIGVsZW1lbnQsIGFuZCBzaGlmdCBpcyBub3QgaGVsZCwgZ28gYmFjayB0byB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQuXG5cdFx0XHRcdCRmb2N1c2FibGVDaGlsZHJlblswXS5mb2N1cygpO1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvLyBIb29rIGludG8gWW91VHViZSA8aWZyYW1lPi5cblx0YXBwLm9uWW91VHViZUlmcmFtZUFQSVJlYWR5ID0gZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICRtb2RhbCA9ICQoICdkaXYubW9kYWwnICksXG5cdFx0XHQkaWZyYW1laWQgPSAkbW9kYWwuZmluZCggJ2lmcmFtZScgKS5hdHRyKCAnaWQnICk7XG5cblx0XHQkcGxheWVyID0gbmV3IFlULlBsYXllciggJGlmcmFtZWlkLCB7XG5cdFx0XHRldmVudHM6IHtcblx0XHRcdFx0J29uUmVhZHknOiBhcHAub25QbGF5ZXJSZWFkeSxcblx0XHRcdFx0J29uU3RhdGVDaGFuZ2UnOiBhcHAub25QbGF5ZXJTdGF0ZUNoYW5nZVxuXHRcdFx0fVxuXHRcdH0gKTtcblx0fTtcblxuXHQvLyBEbyBzb21ldGhpbmcgb24gcGxheWVyIHJlYWR5LlxuXHRhcHAub25QbGF5ZXJSZWFkeSA9IGZ1bmN0aW9uKCkge1xuXHR9O1xuXG5cdC8vIERvIHNvbWV0aGluZyBvbiBwbGF5ZXIgc3RhdGUgY2hhbmdlLlxuXHRhcHAub25QbGF5ZXJTdGF0ZUNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gU2V0IGZvY3VzIHRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudCBpbnNpZGUgb2YgdGhlIG1vZGFsIHRoZSBwbGF5ZXIgaXMgaW4uXG5cdFx0JCggZXZlbnQudGFyZ2V0LmEgKS5wYXJlbnRzKCAnLm1vZGFsJyApLmZpbmQoICdhLCA6aW5wdXQsIFt0YWJpbmRleF0nICkuZmlyc3QoKS5mb2N1cygpO1xuXHR9O1xuXG5cblx0Ly8gRW5nYWdlIVxuXHQkKCBhcHAuaW5pdCApO1xufSggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNNb2RhbCApICk7XG4iLCIvKipcbiAqIEZpbGU6IG5hdmlnYXRpb24tcHJpbWFyeS5qc1xuICpcbiAqIEhlbHBlcnMgZm9yIHRoZSBwcmltYXJ5IG5hdmlnYXRpb24uXG4gKi9cbndpbmRvdy53ZHNQcmltYXJ5TmF2aWdhdGlvbiA9IHt9O1xuKCBmdW5jdGlvbiggd2luZG93LCAkLCBhcHAgKSB7XG5cblx0Ly8gQ29uc3RydWN0b3IuXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmNhY2hlKCk7XG5cblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXG5cdFx0XHRzdWJNZW51Q29udGFpbmVyOiAkKCAnLm1haW4tbmF2aWdhdGlvbiAuc3ViLW1lbnUnICksXG5cdFx0XHRzdWJNZW51UGFyZW50SXRlbTogJCggJy5tYWluLW5hdmlnYXRpb24gbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbicgKVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy53aW5kb3cub24oICdsb2FkJywgYXBwLmFkZERvd25BcnJvdyApO1xuXHRcdGFwcC4kYy5zdWJNZW51UGFyZW50SXRlbS5maW5kKCAnYScgKS5vbiggJ2ZvY3VzaW4gZm9jdXNvdXQnLCBhcHAudG9nZ2xlRm9jdXMgKTtcblx0fTtcblxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBhcHAuJGMuc3ViTWVudUNvbnRhaW5lci5sZW5ndGg7XG5cdH07XG5cblx0Ly8gQWRkIHRoZSBkb3duIGFycm93IHRvIHN1Ym1lbnUgcGFyZW50cy5cblx0YXBwLmFkZERvd25BcnJvdyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy5zdWJNZW51UGFyZW50SXRlbS5maW5kKCAnPiBhJyApLmFwcGVuZCggJzxzcGFuIGNsYXNzPVwiY2FyZXQtZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj4nICk7XG5cdH07XG5cblx0Ly8gVG9nZ2xlIHRoZSBmb2N1cyBjbGFzcyBvbiB0aGUgbGluayBwYXJlbnQuXG5cdGFwcC50b2dnbGVGb2N1cyA9IGZ1bmN0aW9uKCkge1xuXHRcdCQoIHRoaXMgKS5wYXJlbnRzKCAnbGkubWVudS1pdGVtLWhhcy1jaGlsZHJlbicgKS50b2dnbGVDbGFzcyggJ2ZvY3VzJyApO1xuXHR9O1xuXG5cdC8vIEVuZ2FnZSFcblx0JCggYXBwLmluaXQgKTtcblxufSggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNQcmltYXJ5TmF2aWdhdGlvbiApICk7XG4iLCIvKipcbiAqIEZpbGU6IG9mZi1jYW52YXMuanNcbiAqXG4gKiBIZWxwIGRlYWwgd2l0aCB0aGUgb2ZmLWNhbnZhcyBtb2JpbGUgbWVudS5cbiAqL1xud2luZG93Lndkc29mZkNhbnZhcyA9IHt9O1xuKCBmdW5jdGlvbiggd2luZG93LCAkLCBhcHAgKSB7XG5cblx0Ly8gQ29uc3RydWN0b3IuXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmNhY2hlKCk7XG5cblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdGJvZHk6ICQoICdib2R5JyApLFxuXHRcdFx0b2ZmQ2FudmFzQ2xvc2U6ICQoICcub2ZmLWNhbnZhcy1jbG9zZScgKSxcblx0XHRcdG9mZkNhbnZhc0NvbnRhaW5lcjogJCggJy5vZmYtY2FudmFzLWNvbnRhaW5lcicgKSxcblx0XHRcdG9mZkNhbnZhc09wZW46ICQoICcub2ZmLWNhbnZhcy1vcGVuJyApLFxuXHRcdFx0b2ZmQ2FudmFzU2NyZWVuOiAkKCAnLm9mZi1jYW52YXMtc2NyZWVuJyApXG5cdFx0fTtcblx0fTtcblxuXHQvLyBDb21iaW5lIGFsbCBldmVudHMuXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLiRjLmJvZHkub24oICdrZXlkb3duJywgYXBwLmVzY0tleUNsb3NlICk7XG5cdFx0YXBwLiRjLm9mZkNhbnZhc0Nsb3NlLm9uKCAnY2xpY2snLCBhcHAuY2xvc2VvZmZDYW52YXMgKTtcblx0XHRhcHAuJGMub2ZmQ2FudmFzT3Blbi5vbiggJ2NsaWNrJywgYXBwLnRvZ2dsZW9mZkNhbnZhcyApO1xuXHRcdGFwcC4kYy5vZmZDYW52YXNTY3JlZW4ub24oICdjbGljaycsIGFwcC5jbG9zZW9mZkNhbnZhcyApO1xuXHR9O1xuXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cblx0YXBwLm1lZXRzUmVxdWlyZW1lbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIubGVuZ3RoO1xuXHR9O1xuXG5cdC8vIFRvIHNob3cgb3Igbm90IHRvIHNob3c/XG5cdGFwcC50b2dnbGVvZmZDYW52YXMgPSBmdW5jdGlvbigpIHtcblxuXHRcdGlmICggJ3RydWUnID09PSAkKCB0aGlzICkuYXR0ciggJ2FyaWEtZXhwYW5kZWQnICkgKSB7XG5cdFx0XHRhcHAuY2xvc2VvZmZDYW52YXMoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXBwLm9wZW5vZmZDYW52YXMoKTtcblx0XHR9XG5cblx0fTtcblxuXHQvLyBTaG93IHRoYXQgZHJhd2VyIVxuXHRhcHAub3Blbm9mZkNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIuYWRkQ2xhc3MoICdpcy12aXNpYmxlJyApO1xuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLmFkZENsYXNzKCAnaXMtdmlzaWJsZScgKTtcblx0XHRhcHAuJGMub2ZmQ2FudmFzU2NyZWVuLmFkZENsYXNzKCAnaXMtdmlzaWJsZScgKTtcblxuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgdHJ1ZSApO1xuXHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIuYXR0ciggJ2FyaWEtaGlkZGVuJywgZmFsc2UgKTtcblxuXHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIuZmluZCggJ2J1dHRvbicgKS5maXJzdCgpLmZvY3VzKCk7XG5cdH07XG5cblx0Ly8gQ2xvc2UgdGhhdCBkcmF3ZXIhXG5cdGFwcC5jbG9zZW9mZkNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy5vZmZDYW52YXNDb250YWluZXIucmVtb3ZlQ2xhc3MoICdpcy12aXNpYmxlJyApO1xuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLnJlbW92ZUNsYXNzKCAnaXMtdmlzaWJsZScgKTtcblx0XHRhcHAuJGMub2ZmQ2FudmFzU2NyZWVuLnJlbW92ZUNsYXNzKCAnaXMtdmlzaWJsZScgKTtcblxuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgZmFsc2UgKTtcblx0XHRhcHAuJGMub2ZmQ2FudmFzQ29udGFpbmVyLmF0dHIoICdhcmlhLWhpZGRlbicsIHRydWUgKTtcblxuXHRcdGFwcC4kYy5vZmZDYW52YXNPcGVuLmZvY3VzKCk7XG5cdH07XG5cblx0Ly8gQ2xvc2UgZHJhd2VyIGlmIFwiZXNjXCIga2V5IGlzIHByZXNzZWQuXG5cdGFwcC5lc2NLZXlDbG9zZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoIDI3ID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0YXBwLmNsb3Nlb2ZmQ2FudmFzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEVuZ2FnZSFcblx0JCggYXBwLmluaXQgKTtcblxufSggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNvZmZDYW52YXMgKSApO1xuIiwiLyoqXG4gKiBGaWxlIHBhcnRuZXJzLWNhcm91c2VsLmpzXG4gKlxuICogRGVhbCB3aXRoIHRoZSBTbGljayBjYXJvdXNlbCBmb3IgUGFydG5lcnMgd2lkZ2V0LlxuICovXG53aW5kb3cud2RzUGFydG5lcnNDYXJvdXNlbCA9IHt9O1xuKCBmdW5jdGlvbiggd2luZG93LCAkLCBhcHAgKSB7XG5cblx0Ly8gQ29uc3RydWN0b3IuXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmNhY2hlKCk7XG5cblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdHdpbmRvdzogJCggd2luZG93ICksXG5cdFx0XHR0aGVDYXJvdXNlbDogJCggJy5wYXJ0bmVycy1jYXJvdXNlbCcgKVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy53aW5kb3cub24oICdsb2FkJywgYXBwLmRvU2xpY2sgKTtcblx0fTtcblxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBhcHAuJGMudGhlQ2Fyb3VzZWwubGVuZ3RoO1xuXHR9O1xuXG5cdC8vIEtpY2sgb2ZmIFNsaWNrLlxuXHRhcHAuZG9TbGljayA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy50aGVDYXJvdXNlbC5zbGljaygge1xuXHRcdFx0YWRhcHRpdmVIZWlnaHQ6IHRydWUsXG5cdFx0XHRhdXRvcGxheTogZmFsc2UsXG5cdFx0XHRhdXRvcGxheVNwZWVkOiA1MDAwLFxuXHRcdFx0YXJyb3dzOiB0cnVlLFxuXHRcdFx0ZG90czogZmFsc2UsXG5cdFx0XHRmb2N1c09uU2VsZWN0OiB0cnVlLFxuXHRcdFx0d2FpdEZvckFuaW1hdGU6IHRydWUsXG5cdFx0XHRwcmV2QXJyb3c6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInNsaWNrLXByZXZcIj48c3ZnIGNsYXNzPVwiaWNvbiBpY29uLWFycm93LWNpcmNsZS1sZWZ0XCI+PHVzZSB4bGluazpocmVmPVwiI2ljb24tYXJyb3ctY2lyY2xlLWxlZnRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuXHRcdFx0bmV4dEFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJzbGljay1uZXh0XCI+PHN2ZyBjbGFzcz1cImljb24gaWNvbi1hcnJvdy1jaXJjbGUtcmlnaHRcIj48dXNlIHhsaW5rOmhyZWY9XCIjaWNvbi1hcnJvdy1jaXJjbGUtcmlnaHRcIj48L3VzZT48L3N2Zz48L2J1dHRvbj4nLFxuXHRcdFx0cmVzcG9uc2l2ZTogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YnJlYWtwb2ludDogOTAwLFxuXHRcdFx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Nob3c6IDMsXG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Njcm9sbDogMVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJyZWFrcG9pbnQ6IDYwMCxcblx0XHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdFx0c2xpZGVzVG9TaG93OiAyLFxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TY3JvbGw6IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9ICk7XG5cblx0XHRhcHAuJGMudGhlQ2Fyb3VzZWwuZmFkZVRvKCA0MDAsIDEgKTtcblx0fTtcblxuXHQvLyBFbmdhZ2UhXG5cdCQoIGFwcC5pbml0ICk7XG59ICggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNQYXJ0bmVyc0Nhcm91c2VsICkgKTtcbiIsIi8qKlxuICogRmlsZSBza2lwLWxpbmstZm9jdXMtZml4LmpzLlxuICpcbiAqIEhlbHBzIHdpdGggYWNjZXNzaWJpbGl0eSBmb3Iga2V5Ym9hcmQgb25seSB1c2Vycy5cbiAqXG4gKiBMZWFybiBtb3JlOiBodHRwczovL2dpdC5pby92V2RyMlxuICovXG4oIGZ1bmN0aW9uKCkge1xuXHR2YXIgaXNXZWJraXQgPSAtMSA8IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnd2Via2l0JyApLFxuXHRcdGlzT3BlcmEgPSAtMSA8IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnb3BlcmEnICksXG5cdFx0aXNJZSA9IC0xIDwgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoICdtc2llJyApO1xuXG5cdGlmICggKCBpc1dlYmtpdCB8fCBpc09wZXJhIHx8IGlzSWUgKSAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciApIHtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpZCA9IGxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKCAxICksXG5cdFx0XHRcdGVsZW1lbnQ7XG5cblx0XHRcdGlmICggISAoIC9eW0EtejAtOV8tXSskLyApLnRlc3QoIGlkICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBpZCApO1xuXG5cdFx0XHRpZiAoIGVsZW1lbnQgKSB7XG5cdFx0XHRcdGlmICggISAoIC9eKD86YXxzZWxlY3R8aW5wdXR8YnV0dG9ufHRleHRhcmVhKSQvaSApLnRlc3QoIGVsZW1lbnQudGFnTmFtZSApICkge1xuXHRcdFx0XHRcdGVsZW1lbnQudGFiSW5kZXggPSAtMTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGVsZW1lbnQuZm9jdXMoKTtcblx0XHRcdH1cblx0XHR9LCBmYWxzZSApO1xuXHR9XG59KCkgKTtcbiIsIi8qKlxuICogRmlsZSBzb2NpYWwtbWVudS5qc1xuICpcbiAqIEFsbG93cyBtZW51IGl0ZW1zIHRvIGhhdmUgdGhlaXIgY29udGVudCB3cmFwcGVkIGluIHNjcmVlbi1yZWFkZXItdGV4dCBjbGFzcy5cbiAqL1xud2luZG93Lndkc1NvY2lhbE1lbnUgPSB7fTtcbiggZnVuY3Rpb24oIHdpbmRvdywgJCwgYXBwICkge1xuXG5cdC8vIENvbnN0cnVjdG9yLlxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5jYWNoZSgpO1xuXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIENhY2hlIGRvY3VtZW50IGVsZW1lbnRzLlxuXHRhcHAuY2FjaGUgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMgPSB7XG5cdFx0XHR3aW5kb3c6ICQoIHdpbmRvdyApLFxuXHRcdFx0J3NvY2lhbE1lbnUnOiAkKCAnI21lbnUtc29jaWFsLW5ldHdvcmtzJyApLFxuXHRcdFx0J21lbnVJdGVtcyc6ICQoICcjbWVudS1zb2NpYWwtbmV0d29ya3MgLm1lbnUtaXRlbScgKVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy53aW5kb3cub24oICdsb2FkJywgYXBwLndyYXBNZW51SXRlbXMgKTtcblx0fTtcblxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBhcHAuJGMuc29jaWFsTWVudS5sZW5ndGg7XG5cdH07XG5cblx0Ly8gV3JhcCBtZW51IGl0ZW1zIGluIHNjcmVlbiByZWFkZXIgdGV4dC5cblx0YXBwLndyYXBNZW51SXRlbXMgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMubWVudUl0ZW1zLmZpbmQoICdhJyApLndyYXBJbm5lciggJzxzcGFuIGNsYXNzPVwic2NyZWVuLXJlYWRlci10ZXh0XCI+JywgJzwvc3Bhbj4nICkuY3NzKCAndmlzaWJpbGl0eScsICd2aXNpYmxlJyApO1xuXHR9O1xuXG5cdC8vIEVuZ2FnZSFcblx0JCggYXBwLmluaXQgKTtcbn0oIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzU29jaWFsTWVudSApICk7XG4iLCIvKipcbiAqIEZpbGU6IHN0aWNreS1uYXYuanNcbiAqXG4gKiBGaXggdGhlIGhlYWRlciB0byB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gd2hlbiB0aGUgdXNlciBzY3JvbGxzLlxuICovXG53aW5kb3cud2RzU2Nyb2xsVG9GaXhlZCA9IHt9O1xuKCBmdW5jdGlvbiggd2luZG93LCAkLCBhcHAgKSB7XG5cbiAgICAvLyBDb25zdHJ1Y3Rvci5cbiAgICBhcHAuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHAuY2FjaGUoKTtcblxuICAgICAgICBpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xuICAgICAgICAgICAgYXBwLmJpbmRFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDYWNoZSBhbGwgdGhlIHRoaW5ncywgYnV0IG1vc3RseSB0aGUgaGVhZGVyLlxuICAgIGFwcC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHAuJGMgPSB7XG4gICAgICAgICAgICB3aW5kb3c6ICQoIHdpbmRvdyApLFxuXHRcdFx0Zml4ZWRIZWFkZXI6ICQoICcuZml4ZWQtaGVhZGVyJyApLFxuXHRcdFx0bWljcm9zaXRlUGFnZTogJCggJ2JvZHkucGFnZS10ZW1wbGF0ZS10ZW1wbGF0ZS1taWNyb3NpdGUsIGJvZHkucGFnZS10ZW1wbGF0ZS10ZW1wbGF0ZS1zbGltLWhlYWRlcicgKVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyBDb21iaW5lIGFsbCBldmVudHMuXG4gICAgYXBwLmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBwLiRjLndpbmRvdy5vbiggJ3Njcm9sbCcsIGFwcC50b2dnbGVGaXhlZEhlYWRlciApO1xuICAgIH07XG5cbiAgICAvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG4gICAgYXBwLm1lZXRzUmVxdWlyZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcHAuJGMuZml4ZWRIZWFkZXIubGVuZ3RoICYmICggISBhcHAuJGMubWljcm9zaXRlUGFnZS5sZW5ndGggKTtcbiAgICB9O1xuXG4gICAgLy8gVG9nZ2xlIHRoZSBmaXhlZCB2ZXJzaW9uIG9mIHRoZSBoZWFkZXIuXG4gICAgYXBwLnRvZ2dsZUZpeGVkSGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoZWFkZXJIZWlnaHQgPSBhcHAuJGMuZml4ZWRIZWFkZXIuaGVpZ2h0KCkgLyAyO1xuXG4gICAgICAgIGlmICggYXBwLiRjLndpbmRvdy5zY3JvbGxUb3AoKSA+IGhlYWRlckhlaWdodCApIHtcbiAgICAgICAgICAgIGFwcC4kYy5maXhlZEhlYWRlci5hZGRDbGFzcyggJ3NvbGlkLWhlYWRlcicgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcC4kYy5maXhlZEhlYWRlci5yZW1vdmVDbGFzcyggJ3NvbGlkLWhlYWRlcicgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFbmdhZ2UhXG4gICAgJCggYXBwLmluaXQgKTtcblxufSAoIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzU2Nyb2xsVG9GaXhlZCApICk7XG4iLCIvKipcbiAqIEZpbGUgd2luZG93LXJlYWR5LmpzXG4gKlxuICogQWRkIGEgXCJyZWFkeVwiIGNsYXNzIHRvIDxib2R5PiB3aGVuIHdpbmRvdyBpcyByZWFkeS5cbiAqL1xud2luZG93Lndkc1dpbmRvd1JlYWR5ID0ge307XG4oIGZ1bmN0aW9uKCB3aW5kb3csICQsIGFwcCApIHtcblxuXHQvLyBDb25zdHJ1Y3Rvci5cblx0YXBwLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuY2FjaGUoKTtcblx0XHRhcHAuYmluZEV2ZW50cygpO1xuXHR9O1xuXG5cdC8vIENhY2hlIGRvY3VtZW50IGVsZW1lbnRzLlxuXHRhcHAuY2FjaGUgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuJGMgPSB7XG5cdFx0XHQnd2luZG93JzogJCggd2luZG93ICksXG5cdFx0XHQnYm9keSc6ICQoIGRvY3VtZW50LmJvZHkgKVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy53aW5kb3cubG9hZCggYXBwLmFkZEJvZHlDbGFzcyApO1xuXHR9O1xuXG5cdC8vIEFkZCBhIGNsYXNzIHRvIDxib2R5Pi5cblx0YXBwLmFkZEJvZHlDbGFzcyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC4kYy5ib2R5LmFkZENsYXNzKCAncmVhZHknICk7XG5cdH07XG5cblx0Ly8gRW5nYWdlIVxuXHQkKCBhcHAuaW5pdCApO1xufSggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNXaW5kb3dSZWFkeSApICk7XG4iXX0=
