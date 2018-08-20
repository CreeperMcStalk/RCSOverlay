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

