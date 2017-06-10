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
        event_countdown: 0,
        event_notice: null,
        event_name: null,
        event_round: null,
        best_of_x: null,

        p1_name: null,
        p2_name: null,

        p1_games: null,
        p2_games: null,

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

      },

      'info.p2_name': function(newval, oldval){

      },

      'info.smashggUrl': function(newval, oldval){
          this.initSmashGG()
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
    loadJSON: function() {
      axios.get(JSON_PATH, { responseType: 'json' })
        .then(resp => { this.info = resp.data; })
        .catch(resp => { console.error(resp); });
    },
	getTournamentName: function() {
	  var sub;
	  sub = this.info.smashggUrl.substring(this.info.smashggUrl.indexOf('/tournament/') + 1);
	  sub = sub.substring(sub.indexOf('/') + 1, sub.indexOf('/events/'));
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
    fetchRoundData: function(tag1, tag2){
		if(this.info.smashggUrl){
		  var data = {
			tournament: this.getTournamentName(),
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

    tunnel.evt.on('dataReady', function(){
        this.info = tunnel.data;
    });

    setInterval(() => { this.timestamp = new Date(); }, 1000);

    /*
    setInterval(() => {
        this.fetchRoundData(this.info.p1_name,
                            this.info.p2_name);
    }, ROUND_INTERVAL);
    */
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
