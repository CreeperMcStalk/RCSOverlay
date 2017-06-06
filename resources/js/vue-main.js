var POLL_INTERVAL = 2500;
var JSON_PATH = JSON_PATH || './StreamControl_0_4b/streamcontrol.json';

var app = new Vue({
  el: '#app',
  data: {
    info: {
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
    }
  },
  // Triggered when the vue instance is created, triggers the initial setup.
  created: function() {
    this.loadJSON();
    setInterval(() => { this.loadJSON(); }, POLL_INTERVAL);
    setInterval(() => { this.timestamp = new Date(); }, 1000);
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
