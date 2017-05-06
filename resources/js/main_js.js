/*************************************/
// Contains the core logic for reading from the XML file and triggering
// 		updates/animations/etc.
// It's a bit messy, but some sacrifices had to be made to get it to work
//		with the older build of OBS, because it uses a shitty Netscape-based CLR Browser...
// TextModifications allow you to append information to incoming content with a simple string
//		substitution. So far I've really only used this to map Strings to images in my resource
//		directory. In this case, when the XML stores a characters name "Captain Falcon", that gets
// 		altered to <img src='resources/icon_Captain Falcon.png'/> or whatever before it is injected.
// Additionally, it's worth noting that I bind all the XML data to page attributes in the
//		updateToggle method. What this allows is for CSS based checking of attributes. In my case
// 		you can see this being used when I toggle to "team_mode". The value of the "team_mode"
//		field is written as an attribute to the root <html> tag, which can then be looked at in CSS with
// 			html[team_mode="1"] div#myRelevantDiv { display : none; }
// 		It also binds the value to any matching streamData tagged elements. Think of them as Global Flags?

lastModified_old = '';

source_file = 'StreamControl_0_4b/streamcontrol.xml';
modification_file = 'StreamControl_0_4b/streamcontrol_modifiers.xml';

source_json = 'StreamControl_0_4b/streamcontrol.json';
stream_json = "https://api.twitch.tv/kraken/streams/ClashKingStudios";

xMods = {};
xVars = {};
xVarsOld = {};

base_twitch_uri = "https://api.twitch.tv/kraken/streams/";
stream_name = "ClashKingStudios";

/**
  *	Initialize + set up a Timeout function to check for new data every second.
  * Couldn't get promises working, so phase 2 of init is called in a separate function sadly.
**/
$(document).ready(function() {
	loadJSON(source_json);

	initAnimations();
	loadXML(modification_file, initTextModifications);
});

function init2() {
	loadXML(source_file, refreshContent);
	var timeout = this.window.setInterval(function() {
		loadXML(source_file, refreshContent);
	}, 1000);

	if ($('#viewers').length) {
		var timeout2 = this.window.setInterval(function() {
			loadJSON(base_twitch_uri + stream_name, twitchPoll);
		}, 5000);
	} else {
		console.log("Cannot find element to bind Viewer count to, skipping twitch api calls");
	}
}

/**
  *	Load + Process the XML data
**/
function loadXML(target_file, callback) {
	/*******
		Can't use $.GET in the OBS CLR Browser (Netscape issues). Multiplatform seems fine with it (Chromium)?
	*******/
	/*$.get(target_file, function(data) {
		callback(data);
	});*/

	/*$.ajax({
		type : "GET",
		dataType : "xml",
		cache : false,
		async : true,
		url : target_file
	}).done(function(xml) {
		//console.log(xml);
		callback(xH.responseXML);
		//$('body').textContent = $(xml).find('items>timestamp');
	}).always(function() {
		setTimeout("loadXML()", 1000);
	});*/

	var xH = new XMLHttpRequest();
	xH.overrideMimeType('text/xml');
	xH.open('GET', target_file, true);

	try {
		xH.send();

		xH.onreadystatechange = function() {
			if (xH.readyState == 4) {
				callback(xH.responseXML);
			}
		}
	} catch (e) {
		console.log('>> Failed to load resource');
		callback(false);
	}
}

/**
  * Load + Process JSON data
**/
function loadJSON(target_file, callback) {
	var xH = new XMLHttpRequest();

	xH.onreadystatechange = function() {
		if (xH.readyState == 4 && xH.status == 200) {
			var resp = JSON.parse(xH.responseText);
			//console.log(resp);
			/*for (var key in resp) {
				console.log(key, resp[key]);
			}*/

			if (callback != null) {
				callback(resp);
			} else {
				console.log(target_file, 'callback was null');
			}
		}
	}

	xH.open("GET", target_file, true);

	try {
		xH.send();
	} catch (e) {
		console.log('>> Failed to load resource [JSON]');
		callback(false);
	}
}


/**
  *	Load + Process the TextModification XML file.
  * Persists the replacement String to memory, and never checks the file after the first iteration.
**/
var initTextModifications = function initTextModifications(response) {
	if (response != false && response != null) {

		xmlItems = response.childNodes[1].children;

		for (var N in xmlItems) {
			if (xmlItems[N].nodeName != undefined) {
				xMods[xmlItems[N].nodeName] = xmlItems[N];
			}
		}
	}

	init2();
}

/**
  *	Performs text replacements based on a generic {{replace}} criteria.
  * Just a messy, straight string replacement, returns the newly generated String.
**/
function textModification(nodeName, textContent) {
	if (xMods[nodeName] != null) {
		replaceContent = xMods[nodeName];
		textContent = replaceContent.textContent.replace('{{replace}}', textContent);
	}

	return textContent;
}

/**
  *	Call for XML file load and compare Timestamp tag to check if StreamControl has updated the file.
  * Apparently, checking for creation time of the file is not accurate as it seems to look at when the file was last pulled from its source?
  * Passes information to the Storage function, where it is locally stored/compared to old data.
**/
var refreshContent = function refreshContent(response) {
	var lastModified = response.getElementsByTagName("timestamp")[0].childNodes[0].textContent;

	if (	lastModified != lastModified_old	) {
		lastModified_old = lastModified;
		storeXML(response.childNodes[1].children);

		updateContent();
	}
}

function refreshContentJSON(response) {
	if (true) {
		storeJSON(response);
		updateContent();
	}
}


/**
  *	Store the XML data to local variables (xVars)
**/
function storeXML(xmlSource) {
	for (var N in xmlSource) {
		if (xmlSource[N].nodeName != undefined) {
			xVars[xmlSource[N].nodeName] = xmlSource[N].textContent;
		}
	}

	try {
		var splits = xVars['event_round'].split('-');
		xVars['round_split'] = splits[1].trim();
		xVars['tourney_split'] = splits[0].trim() + ' | ';
		xVars['set_count_split'] = splits[2].trim();
		xVars['location'] = 'ATLANTA, GA | MAY 6, 2017'.trim();
	} catch (e) {}
}

function storeJSON(jsonSource) {
	for (var key in jsonSource) {
		if (key != undefined) {
			xVarsJSON[key] = jsonSource[key];
		}
	}
}

/**
  *	Iterate through each of the xVars stored items, compare against xVarsOld, then perform Animations.
  * Calls the doAnimation function from the animations.js file.
  * Replaces the xVarsOld file with the new content.
**/
function updateContent() {
	for (var key in xVars) {
		if (key != 'timestamp' && (xVarsOld[key] == undefined || xVarsOld[key] != xVars[key])) {

			doAnimation("*[streamData='" + key + "']", textModification(key, xVars[key]), (  xVarsOld[key] == undefined ? 'onLoad' : 'onChange'  )	);

			updateToggle(key, xVars[key]);
		}
	}

	xVarsOld = jQuery.extend({}, xVars);
}


/**
  * Request current Stream Details from Twitch API.
**/
function twitchPoll(resp) {
	num_viewers = "Offline";

	if (resp.stream != null) {
		num_viewers = resp.stream.viewers + " Viewers";
	}

	$("*[streamData='viewers']").html(num_viewers);
}

/**
  *	Stores the XML data to both the HTML root tag and to each streamData associated tag.
  * For flexibility in CSS declarations and such.
**/
function updateToggle(key, key_value) {
	$('html').attr(key, key_value);
	$("*[streamData='" + key + "']").attr("streamValue", key_value);
}






/*$.fn.extend({
	fixFontSize : function() {
		//var boundingElement = arguments[0] ? arguments[0] : $(this).parent();

		// Store the original font-size if necessary.
		if ( ($(this).attr("desiredFontSize")) == undefined ) {
			console.log('in undefined check');
			$(this).attr("desiredFontSize", $(this).css("font-size"));
		}

		console.log($(this).attr("desiredFontSize"));

		// Reset the font-size back to the original declaration.
		$(this).css("font-size", $(this).attr("desiredFontSize"));

		console.log( $(this)[0].scrollWidth , $(this).innerWidth() );
		while ( $(this)[0].scrollWidth > $(this).innerWidth() ) {
			var currentFontSize = parseInt( $(this).css("font-size") );
			var currentFontUnit = $(this).css("font-size").replace(currentFontSize, "").trim();

			console.log(currentFontSize, currentFontUnit);

			$(this).css("font-size", (currentFontSize - 1) + currentFontUnit);
		}
	}
});*/

$.fn.fixFontSize = function() {

	//console.log($(this));

	if ( $(this).is("[noFontFix]") ) {
		return;
	}

	if ( ($(this).attr("desiredFontSize")) == undefined ) {
		//console.log('in undefined check');
		$(this).attr("desiredFontSize", $(this).css("font-size"));
	}

	//console.log($(this).attr("desiredFontSize"));
	$(this).css("font-size", $(this).attr("desiredFontSize"));

	while ( $(this).hasOverflown() ) {
		var currentFontSize = parseInt( $(this).css("font-size") );
		var currentFontUnit = $(this).css("font-size").replace(currentFontSize, "").trim();

		//console.log(currentFontSize, currentFontUnit);

		$(this).css("font-size", (currentFontSize - 1) + currentFontUnit);
	}
}

$.fn.hasOverflown = function () {
   var res;
   var cont = $('<div>'+this.text()+'</div>')
		.css("display", "table")
		.css("z-index", "-1").css("position", "absolute")
		.css("font-family", this.css("font-family"))
		.css("font-size", this.css("font-size"))
		.css("font-weight", this.css("font-weight"))
		.appendTo('body');
   res = (cont.width()>this.width());
   cont.remove();
   return res;
}


/**
  *	Misc. Leading 0s on 2-digit numbers.
**/
function leadingZero(num) {
	return num < 10 ? "0" + num : num;
}

/**
  * Snippet to enable/disable the logger.
**/
var logger = function()
{
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger =  function enableLogger()
                        {
                            if(oldConsoleLog == null)
                                return;

                            window['console']['log'] = oldConsoleLog;
							console.log("%cLogging Enabled", 'color: green; font-size: 1.2em;');
                        };

    pub.disableLogger = function disableLogger()
                        {
                            oldConsoleLog = console.log;
							console.log("%cLogging Disabled", 'color: red; font-size: 1.2em;');
                            window['console']['log'] = function() {};
                        };
	pub.statusLogger = function statusLogger()
						{
							return oldConsoleLog == null ? true : false;
						};

    return pub;
}();

/** Executed with stats.info();
  * Generates a printout of relevant information.
**/
var stats = function() {
	var pub = {};

	pub.info = function info() {
		var returnLoggerToState = logger.statusLogger();
		logger.enableLogger();

		console.group('Information');
			console.log('Source File:\t', source_file);
			console.log('Last Modified:\t', lastModified_old);

			console.log('xVars:\t', xVars);
			console.log('xVarsOld:\t', xVarsOld);

			console.log('Modification File:\t', modification_file);
			console.log('xMods:\t', xMods);
		console.groupEnd();

		returnLoggerToState ? logger.enableLogger() : logger.disableLogger();
	};

	pub.timestamp = function timestamp() {
		var returnLoggerToState = logger.statusLogger();
		logger.enableLogger();

		console.group('Last Timestamp: ' + xVars['timestamp'].textContent);
		console.groupEnd();

		returnLoggerToState ? logger.enableLogger() : logger.disableLogger();
	}

	return pub;
}();
