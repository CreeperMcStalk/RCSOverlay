'use strict';

if(!axios) console.error('ticker.js requires axios')

const JSON_PATH = '../../StreamControl_0_4b';

let data;
function getJSON(){
	axios.get(JSON_PATH, { responseType: 'json' })
	  .then(resp => { this.info = resp.data; })
	  .catch(resp => { console.error(resp); });
}
setInterval(getJSON, 1000);

function load(){
	let aggregator = new ggResults.SetAggregator(
		data.ticker_type,
		data.ticker_tournamentId,
		data.ticker_eventId,
		data.ticker_phaseId,
		data.ticker_groupId
	);
	aggregator.getSets(cb)
}

let EventBucket = new ggResults.Bucket();
function cb(err, set){
	EventBucket.add(set.eventName, set);

}

setInterval(function(){
	EventBucket.keys().forEach()
}, data.ticker_interval)