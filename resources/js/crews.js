function checkToggles() { 	
	for (var i = 1; i < 11; i++) {
		strgg1 = "c1_p" + i + "_out";
		strgg2 = "c2_p" + i + "_out";
		
		$('*[streamData="c1_p' + i + '_name"]').parent().css('opacity', 1.0 - parseInt(xVars[strgg1].textContent) * 0.40);
		$('*[streamData="c2_p' + i + '_name"]').parent().css('opacity', 1.0 - parseInt(xVars[strgg2].textContent) * 0.40);
	}
}

function bindCharacters(resp) { 
	console.log(resp);
}

$(document).ready(function() {
	
	/*toggles = {};
	for (int i = 1; i < 11; i++) {
		toggles["c1_p" + i + "_out"] = xVars["c1_p" + i + "_out"].textContent;
		toggles["c2_p" + i + "_out"] = xVars["c2_p" + i + "_out"].textContent;
	}*/

	console.log('crews');
	setInterval( checkToggles, 2000 ); 
	
	/*var timeou3 = this.window.setInterval(function() {
		loadJSON('crew_json.json', bindCharacters);
	}, 5000);*/
});