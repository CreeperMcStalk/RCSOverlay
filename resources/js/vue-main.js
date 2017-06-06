var POLL_INTERVAL = 1000;
var ROUND_INTERVAL = 2000;
var JSON_PATH = JSON_PATH || './StreamControl_0_4b/streamcontrol.json';

var port         = 11769;
var smashGGinit  = 'localhost:'+port+'/init/';
var smashGGround = 'localhost:'+port+'/getMatch';

var app = new Vue({
  el: '#app',
  data: {
    info: {
        event_name: null,
        event_round: null,
        best_of_x: null,

        p1_name: null,
        p2_name: null,

        p1_games: null,
        p2_games: null,

        // Setting a few default values for the flicker of time images take to load.
        p1_char: 'Default',
        p2_char: 'Default'
    },
    timestamp: new Date()
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
    initSmashGG: function(tournamentName){
      var url = smashGGinit + tournamentName;
      axios.get(url)
          .then(function(res){
            if(!res.status == 200) console.error('Error initializing SmashGG tournament');
            else console.log('Initialized successfully');
          })
          .catch(function(err){
            console.error('Error initializing SmashGG tournament');
          })
    },
    fetchRoundData: function(tag1, tag2, tournamentName){
      var data = {
        tournament: tournamentName,
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

  },
  // Triggered when the vue instance is created, triggers the initial setup.
  created: function() {
    this.loadJSON();
    this.initSmashGG(this.info.event_name);

    setInterval(() => { this.loadJSON(); }, POLL_INTERVAL);
    setInterval(() => { this.timestamp = new Date(); }, 1000);
    setInterval(() => {
        this.fetchRoundData(this.info.p1_name,
                            this.info.p2_name,
                            this.info.event_name);
    }, ROUND_INTERVAL);
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
