/* DEPENDENCIES */
if(!tunnel)
    console.error('json-tunnel is required for vue-main. Please make sure you\'ve imported it');

var POLL_INTERVAL = 500;
var ROUND_INTERVAL = 10000;
var JSON_PATH = JSON_PATH || './StreamControl_0_4b/streamcontrol.json';

var port         = 11769;
var smashGGinit  = 'http://localhost:'+port+'/init/';
var smashGGround = 'http://localhost:'+port+'/getMatch';

var currentTournament = '';


var app = new Vue({
  el: '#app',
  data: {
    /* INFO OBJECT LINKS TO THE JSON CREATED BY STREAM CONTROL */
    info: {
        mode: 'PULL_ALL',
        event_countdown: 0,
        event_notice: '',
        event_name: '',
        event_round: '',
        best_of_x: '',

        p1_name: '',
        p2_name: '',

        p1_games: '',
        p2_games: '',

        // Setting a few default values for the flicker of time images take to load.
        p1_char: 'Default',
        p2_char: 'Default',
		
		//URL for automated round pulling
		smashggUrl: null
    },
    timestamp: new Date()
  },
  watch: {
      'info.p1_name': function(newval, oldval){
          this.fetchRoundData();
      },

      'info.p2_name': function(newval, oldval){
          this.fetchRoundData();
      },

      'info.smashggUrl': function(newval, oldval){
          this.initSmashGG()
      },

      'info.switchMode': function(newval, oldval){
          this.changeMode();
      }
  },
  computed: {
    formattedDate: function() {
      return months[this.timestamp.getMonth() + 1] + ' ' +
             this.timestamp.getDate() + ', ' +
             this.timestamp.getFullYear();
    },
    formattedTime: function() {
      return zeroPad(this.timestamp.getHours()) + ':' +
             zeroPad(this.timestamp.getMinutes()) + ':' +
             zeroPad(this.timestamp.getSeconds());
    },
    game_header: function() {
      return this.info.event_name + ' - ' + this.info.event_round + ' - ' + this.info.best_of_x;
    }
  },
  methods: {
    changeMode: function(){
      if(this.info.mode === 'PULL_ALL') this.info.mode = 'AUTOMATE_ROUND';
      else mode = 'PULL_ALL';
    },
    loadJSON: function() {
      axios.get(JSON_PATH, { responseType: 'json' })
        .then(resp => { this.info = resp.data; })
        .catch(resp => { console.error(resp); });
    },
    loadJSONWithoutRound: function(){
      axios.get(JSON_PATH, { responseType: 'json'})
          .then(resp => {
              for(var key in data) {
                  if (key === 'event_round') continue;
                  else this.info[key] = data.key;
              }
          })
          .catch(console.error);
    },
	getTournamentName: function() {
	  var sub;
	  sub = this.info.smashggUrl.substring(this.info.smashggUrl.indexOf('tournament/') + 'tournament/'.length);
	  sub = sub.substring(0, sub.indexOf('/events'));
	  return sub;
	},
    initSmashGG: function(){
		if(this.info.smashggUrl){
		  var url = smashGGinit + this.getTournamentName();
		  axios.get(url)
			  .then(function(res){
				if(!res.status == 200) console.error('Error initializing SmashGG tournament');
				else console.log('Initialized successfully');
			  })
			  .catch(function(err){
				console.error('Error initializing SmashGG tournament');
			  })
		}
    },
    fetchRoundData: function(){
		if(this.info.smashggUrl){
		  var tag1 = this.info.p1_name;
		  var tag2 = this.info.p2_name;
		  var tournament = this.getTournamentName();

		  var data = {
			tournament: tournament,
			tag1: tag1,
			tag2: tag2
		  };

		  axios.post(smashGGround, data)
			  .then(function(res){
				  if(!res.status == 200) console.error('Error fetching SmashGG match');
				  else{
					var match = res.data;
					this.info.event_round = match.Round;
				  }
			  })
			  .catch(function(err){
				  console.error('Error fetching SmashGG match');
			  })
		}
	},
    checkTournamentChanged: function(){
        if(this.info.smashggUrl != currentTournament) {
            currentTournament = this.info.smashggUrl;
            this.info.event_name = this.getTournamentName();
            this.initSmashGG();
        }
    },
    countdown: function(minutes){
        if(minutes > 0) {
            var millis = minutes * 60000;
            $('#countdown')
                .countdown(new Date(Date.now() + millis),
                    function (e) {
                        $(this).text(
                            event.strftime('%H:%M:%S')
                        );
                    });
        }
    }

  },
  // Triggered when the vue instance is created, triggers the initial setup.
  created: function() {
    this.loadJSON();

    /*
    tunnel.evt.on('dataReady', function(){
        this.info = tunnel.data;
    });
    */

    setInterval(() => { this.timestamp = new Date(); }, 1000);
    setInterval(() => {
        if(this.info.mode === 'PULL_ALL') this.loadJSON();
        else if(this.info.mode === 'AUTOMATE_ROUND') this.loadJSONWithoutRound();
    }, POLL_INTERVAL);
  }
});


/**
 * Left Pad a Number to Ensure that it is two digits.
 * @param  {int} number
 * @return {String} Left padded result
 */
function zeroPad(number) {
  return number < 10 ? '0' + number : '' + number;
}

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
