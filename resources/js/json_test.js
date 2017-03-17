var jf;
var xVars = {};

function main() {
	var xH = new XMLHttpRequest();
	var url = "StreamControl_0_4b/streamcontrol - Copy.json";

	xH.onreadystatechange = function() {
		if (xH.readyState == 4 && xH.status == 200) {
			var resp = JSON.parse(xH.responseText);
			jf = resp;
			console.log(resp);
			extractJSON('arr.var3', resp);
			storeJSON(resp, '');
			console.log(xVars);
		}
	}

	xH.open("GET", url, true);
	xH.send();
}

function extractJSON(key, jsonFile) { 	
	console.log(	eval('jf.' + key)	);
}

function storeJSON(jsonFile, prefix) {
	for (var key in jsonFile) { 	
		if	(eval('jsonFile.' + key).watch().length() > 0) { 
			storeJSON(	eval('jsonFile.' + key), prefix + key + '.');
		} else {
			xVars[key] = eval('jsonFile.' + key);
		}
	}
}