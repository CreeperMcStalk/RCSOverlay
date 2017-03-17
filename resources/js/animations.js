/*************************************/
// Here's a messy function to introduce animations. I'm keeping it separate for my own development 
//		simplicity. 
// Important to note... bindAnimations.js calls functions in this file, binding events right to
//		the DOM elements, which can be $.trigger'd later. It then attempts to invoke all onLoad functions
//		for non-data elements, so you can bind onLoad animations to them. The data-elements will be
//		introduced when their data is made available. 
// If you're working with opacity triggers, make sure you set the initial opacity for an element in css. 
//		There's a delay loading the JS sometimes if the page doesn't render immediately, which can lead
//		to a flashing of the item before it's ready to fade.
// Half of the shit in this is just for logging...



function initAnimations() { 
	// Only trigger the onLoad animations once they have been fully, and properly bound.
	/*bindAnimations().done(function() {
		doAnimation($('*:not([streamData])'), '', 'onLoad');
	});*/
	
	/*bindAnimations();
	doAnimation($('*:not([streamData])'), '', 'onLoad');*/
	
	var def = $.Deferred();
	def	.done(bindAnimations)
		.done(function() {
			doAnimation($('*:not([streamData])'), null, 'onLoad');
		});
	
	def.resolve();
}

/**
  *	Bind each animation to the jQuery selection target as a callable function.
  * Strips previous bindings of the same type (onLoad, onChange).
**/
function animationHandler(targets, type, anim) {		
	console.group('Binding Animations');
	
	for (var i = 0; i < targets.length; i++) {
		console.log(type, "\t", targets[i]);
		
		$(targets[i]).unbind(type);
		$(targets[i]).bind(type, anim);
	}
	
	console.groupEnd();
	console.log();
}

/**
  *	Trigger an animation. Calls the event bound to that type name. 
  * Uses a big messy If statement to determine if the animation exists in the DOM before trying to .trigger it.
**/
function doAnimation(key, newData, evt) {	
	$(key).each(function(){				
		if (
			$._data(this, "events") != undefined && 
			evt != undefined && 
			$.inArray(evt, $._data(this, "events"))
			) {
			
			console.group('> Animation Trigger');
					console.log("Event:", evt);
					console.log('Data:', newData);
					console.log('DOM:', this);
					console.log('Events:', $._data(this, "events"));
			console.groupEnd();
			console.log();
			
			$(this).trigger(evt, [newData]);
		}
	});
}