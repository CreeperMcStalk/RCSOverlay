/*************************************/
// This method allows for the binding of Animation events to jQuery selections 
// In order to set new data, $(this).html(newData.toString()); is used, but the timing of when
// 		this happens can be manipulated as necessary.
// I find you need to have a delay after the initial fadeOut before you set a new value otherwise it
// 		tends to chain the events too quickly and look awkward.
// I tried to keep this as tidy as possible. Hopefully it makes sense. 
// As these are all selectors, if you want to define a common function you can use a class to identify it
//		as in the case of ".fade_onChange" and ".fade_onLoad" below. Any element tagged with this
//		will be bound to that animation event. Do note, however, that because I have written those for
//		streamData utilizing elements, they require data to work. You'd have to write a separate function
//		for non-data elements.
// Additionally, only the most recently applied of any animation-type will be kept. The writer erases all
//		prior animation binding using only the last known information. 


function bindAnimations() {
	
	// Default Handling for all StreamData tags. Just load the data directly, no effects.
	var targets = 	$('*[streamData]');
	
	animationHandler(targets, 'onLoad', function(event, newData) {
		$(this)
			.html(newData.toString())
			.fixFontSize();
	});
	
	animationHandler(targets, 'onChange', function(event, newData) {
		$(this)
			.html(newData.toString())
			.fixFontSize();
	});
	
	
	
	
	
	// Bind all elements matching this css selector
	targets = 		$('.fade_onLoad');
	
	animationHandler(targets, 'onLoad', function(event, newData) {
		$(this)
			.css({
				'opacity' : 0
			})
			.delay(600)
			.queue(
				function (next) {
					$(this).html(newData.toString());
					$(this).fixFontSize();
					next();
				})
			.animate({
				'opacity' : 1
			}, 1450);
	});
	
	targets = 		$('.static_fade_onLoad');
	
	animationHandler(targets, 'onLoad', function(event, newData) {
		$(this)
			.css({
				'opacity' : 0
			})
			.delay(600)
			.animate({
				'opacity' : 1
			}, 1450);
	});
	
	targets = 		$('.fade_onChange');
					
	animationHandler(targets, 'onChange', function(event, newData) { 
		$(this)
			.animate({
				'opacity': 0
				}, 450)
			.delay(500)
			.queue(
				function (next) {
					$(this).html(newData.toString());
					$(this).fixFontSize();
					next();
				})
			.animate({
				'opacity' : 1
			}, 450);
	});
	
	
	
	
	// Create a sliding animation for the Names
	// Requires the animationConfig attribute.
	// animationConfig = "direction, distance, 1/2 duration, delay"
	// animationConfig = "left, 50, 650, 500"
	/*targets = $('.slide_onChange');
	
	animationHandler(targets, 'onChange', function(event, newData) {
		
		var animation_configuration = $(this).attr('animationConfig').split(',');
		
		var animation_direction = animation_configuration[0].trim();
			if (animation_direction == undefined) { animation_direction = "top"; }
		
		var animation_distance = parseInt(animation_configuration[1].trim());
			if (animation_distance == undefined) { animation_distance = 50; }
		
		var animation_time = parseInt(animation_configuration[2].trim());
			if (animation_time == undefined) { animation_time = 650; }
			
		var animation_delay = parseInt(animation_configuration[3].trim());
			if (animation_delay == undefined) { animation_delay = 500; }
		
		// TIP: Need to use [variable] to bind JSON keys. Can't use computed attributes in old browsers though D: SHIT. 
		
		switch(animation_direction) { 
			case "left":
				$(this)
					.animate({
						'opacity' : 0,
						left : '-=' + animation_distance + 'px'
						}, animation_time)
					.delay(animation_delay)
					.animate({
						left : '+=' + (animation_distance * 2) + 'px'
						}, 0)
					.queue(
						function (next) {
							$(this).html(newData.toString());
							$(this).fixFontSize();
							next();
						})
					.animate({
						'opacity' : 1,
						left : '-=' + animation_distance + 'px'
					}, animation_time);
				break;
			case "right":
				$(this)
					.animate({
						'opacity' : 0,
						right : '-=' + animation_distance + 'px'
						}, animation_time)
					.delay(animation_delay)
					.animate({
						right : '+=' + (animation_distance * 2) + 'px'
						}, 0)
					.queue(
						function (next) {
							$(this).html(newData.toString());
							$(this).fixFontSize();
							next();
						})
					.animate({
						'opacity' : 1,
						right : '-=' + animation_distance + 'px'
					}, animation_time);
				break;
			case "top":
				$(this)
					.animate({
						'opacity' : 0,
						top : '-=' + animation_distance + 'px'
						}, animation_time)
					.delay(animation_delay)
					.animate({
						top : '+=' + (animation_distance * 2) + 'px'
						}, 0)
					.queue(
						function (next) {
							$(this).html(newData.toString());
							$(this).fixFontSize();
							next();
						})
					.animate({
						'opacity' : 1,
						top : '-=' + animation_distance + 'px'
					}, animation_time);
				break;
			case "bottom":
				$(this)
					.animate({
						'opacity' : 0,
						bottom : '-=' + animation_distance + 'px'
						}, animation_time)
					.delay(animation_delay)
					.animate({
						bottom : '+=' + (animation_distance * 2) + 'px'
						}, 0)
					.queue(
						function (next) {
							$(this).html(newData.toString());
							$(this).fixFontSize();
							next();
						})
					.animate({
						'opacity' : 1,
						bottom : '-=' + animation_distance + 'px'
					}, animation_time);
				break;
		}
	});*/
	
	
	
	// Add the onLoad horizontal scaling animation to the #game_info tag.
	targets = 	$('#melee #scoreboard');
	
	animationHandler(targets, 'onLoad', function(event) {
		//console.log('scoreboard', $(this));
		
		$(this)
			.css({
				'opacity' : 0,
				'transform' : 'scaleX(0)'
			})
			/*.animate({
				'opacity' : 1,
				'transform' : 'scaleX(1)'
			}, 450);*/
			.css({ //Using the built in CSS transition to handle the timing I guess. BAD
				'opacity' : 1,
				'transform' : 'scaleX(1)',
				'transition-delay' : '1.3s'
			});
	});
	
	targets = 	$('#smash4 #scoreboard');
	
	animationHandler(targets, 'onLoad', function(event) {
		//console.log('scoreboard', $(this));
		
		$(this)
			.css({
				'opacity' : 0,
				'transform' : 'scaleY(0)'
			})
			/*.animate({
				'opacity' : 1,
				'transform' : 'scaleX(1)'
			}, 450);*/
			.css({ //Using the built in CSS transition to handle the timing I guess. BAD
				'opacity' : 1,
				'transform' : 'scaleY(1)'
			});
	});
	
	/* targets = 	$('#smash4 #scoreboard');
	
	animationHandler(targets, 'onLoad', function(event) {
		var animation_distance = 100;
		var animation_delay = 1000;
		var animation_time = 1500;
		
		console.log('scoreboard s4', $(this));
		
		$(this)
			.animate({
				'opacity' : 0//,
				//'bottom' : ('-=' + (animation_distance) + 'px')
				}, 0)
			.delay(animation_delay)
			.animate({
				'opacity' : 1//,
				//'bottom' : ('+=' + animation_distance + 'px')
			}, animation_time);
	}); */
	
	
	// Load the #date_time object manually after it has had a chance to instantiate.
	targets =	$('#date_time');
	
	animationHandler(targets, 'onLoad', function(event) {
		$(this)
			.animate({
				'opacity' : 0
			}, 0)
			.delay(800)
			.animate({
				'opacity' : 1
			}, 1200);
	});
}