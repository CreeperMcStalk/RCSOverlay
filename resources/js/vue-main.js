/* DEPENDENCIES */
/*
if(!tunnel)
    console.error('json-tunnel is required for vue-main. Please make sure you\'ve imported it');
*/

/** FILE SYSTEMS */
const RESOURCES_DIR = '../resources'
const IMAGES_DIR    = RESOURCES_DIR + '/images';
const FONTS_DIR     = RESOURCES_DIR + '/fonts';
const STYLES_DIR    = RESOURCES_DIR + '/styles';
const VIDEOS_DIR    = RESOURCES_DIR + '/videos';

var POLL_INTERVAL = 500;
var ROUND_INTERVAL = 10000;
var JSON_PATH = JSON_PATH || '../StreamControl_0_4b/streamcontrol.json';

var port         = 11769;
var smashGGinit  = 'http://localhost:'+port+'/init/';
var smashGGround = 'http://localhost:'+port+'/getMatch';

var currentTournament = '';

/**
 * Data Object to encapsulate player data
 */
class Player{
    constructor(name, score, character, isOut){
        this.name = name;
        this.score = score;
        this.character = character;
        this.isOut = isOut;
    }
}

/**
 * Data Object for encapsulating Crew information
 */
class Crew{
    constructor(name, players){
        this.name = name;
        this.players = players;
    }
}

/**
 * Vue Application
 */
var app = new Vue({
  el: '#app',
  data: {
    /* INFO OBJECT LINKS TO THE JSON CREATED BY STREAM CONTROL */
    info: {
        pull_mode: 'PULL_ALL',
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
      return this.info.event_round + ' - ' + this.info.best_of_x;
    },
    get_crews: function(){
        return [
            new Crew(
                this.info.crew1,
                [
                    new Player(this.info.c1_p1_name, this.info.c1_p1_score, this.info.c1_p1_char, this.info.c1_p1_out),
                    new Player(this.info.c1_p2_name, this.info.c1_p2_score, this.info.c1_p2_char, this.info.c1_p2_out),
                    new Player(this.info.c1_p3_name, this.info.c1_p3_score, this.info.c1_p3_char, this.info.c1_p3_out),
                    new Player(this.info.c1_p4_name, this.info.c1_p4_score, this.info.c1_p4_char, this.info.c1_p4_out),
                    new Player(this.info.c1_p5_name, this.info.c1_p5_score, this.info.c1_p5_char, this.info.c1_p5_out),
                    new Player(this.info.c1_p6_name, this.info.c1_p6_score, this.info.c1_p6_char, this.info.c1_p6_out),
                    new Player(this.info.c1_p7_name, this.info.c1_p7_score, this.info.c1_p7_char, this.info.c1_p7_out),
                    new Player(this.info.c1_p8_name, this.info.c1_p8_score, this.info.c1_p8_char, this.info.c1_p8_out),
                    new Player(this.info.c1_p9_name, this.info.c1_p9_score, this.info.c1_p9_char, this.info.c1_p9_out),
                    new Player(this.info.c1_p10_name, this.info.c1_10p_score, this.info.c1_p10_char, this.info.c1_p10_out)
                ]
            ),
            new Crew(
                this.info.crew2,
                [
                    new Player(this.info.c2_p1_name, this.info.c2_p1_score, this.info.c2_p1_char, this.info.c2_p1_out),
                    new Player(this.info.c2_p2_name, this.info.c2_p2_score, this.info.c2_p2_char, this.info.c2_p2_out),
                    new Player(this.info.c2_p3_name, this.info.c2_p3_score, this.info.c2_p3_char, this.info.c2_p3_out),
                    new Player(this.info.c2_p4_name, this.info.c2_p4_score, this.info.c2_p4_char, this.info.c2_p4_out),
                    new Player(this.info.c2_p5_name, this.info.c2_p5_score, this.info.c2_p5_char, this.info.c2_p5_out),
                    new Player(this.info.c2_p6_name, this.info.c2_p6_score, this.info.c2_p6_char, this.info.c2_p6_out),
                    new Player(this.info.c2_p7_name, this.info.c2_p7_score, this.info.c2_p7_char, this.info.c2_p7_out),
                    new Player(this.info.c2_p8_name, this.info.c2_p8_score, this.info.c2_p8_char, this.info.c2_p8_out),
                    new Player(this.info.c2_p9_name, this.info.c2_p9_score, this.info.c2_p9_char, this.info.c2_p9_out),
                    new Player(this.info.c2_p10_name, this.info.c2_10p_score, this.info.c2_p10_char, this.info.c2_p10_out)
                ]
            )
        ]
    },
    score_1_img_S: function(){
        return IMAGES_DIR + '/Scores/Singles/' + this.info.p1_games + "L.png";
    },
    score_2_img_S: function(){
        return IMAGES_DIR + '/Scores/Singles/' + this.info.p2_games + "R.png";
    },
    score_1_img_D: function(){
        return IMAGES_DIR + '/Scores/Doubles/' + this.info.p1_games + 'T.png'
    },
    score_2_img_D: function(){
        return IMAGES_DIR + '/Scores/Doubles/' + this.info.p2_games + 'B.png'
    },
    char_1_img: function(){
        return IMAGES_DIR + '/Characters/' + this.info.p1_char + '.png';
    }, 
    char_2_img: function(){
        return IMAGES_DIR + '/Characters/' + this.info.p2_char + '.png';
    },
    char_icon: function(name){
        return IMAGES_DIR + '/Characters/icons/' + name  + 'Default.png';
    }
  },
  methods: {
    changeMode: function(){
      if(this.info.pull_mode === 'PULL_ALL') this.info.pull_mode = 'AUTOMATE_ROUND';
      else this.info.pull_mode = 'PULL_ALL';
    },
    loadJSON: function() {
      axios.get(JSON_PATH, { responseType: 'json' })
        .then(resp => { this.info = resp.data; })
        .catch(resp => { console.error(resp); });
    },
    loadJSONWithoutRound: function(){
      axios.get(JSON_PATH, { responseType: 'json'})
          .then(resp => {
			  var data = resp.data;
			  var newData = {};
              for(var key in data) {
                  if (key === 'event_round') continue;
                  else this.info[key] = data[key];
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

		  if(tag1.indexOf('</t>'))
		      tag1 = tag1.substring(tag1.indexOf('</t>') + '</t>'.length).trim();
		  if(tag2.indexOf('</t>'))
		      tag2 = tag2.substring(tag2.indexOf('</t>') + '</t>'.length).trim();

		  var data = {
			tournament: tournament,
			tag1: tag1,
			tag2: tag2
		  };

		  var This = this;
		  axios.post(smashGGround, data)
			  .then(function(res){
				  if(!res.status == 200) console.error('Error fetching SmashGG match');
				  else{
					var match = res.data;
					This.info.event_round = match.Round;
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
        if(this.info.pull_mode === 'PULL_ALL') this.loadJSON();
        else if(this.info.pull_mode === 'AUTOMATE_ROUND') this.loadJSONWithoutRound();
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
