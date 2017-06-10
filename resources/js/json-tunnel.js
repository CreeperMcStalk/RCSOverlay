'use strict';

var tunnelEvt = new EventEmitter();

var tunnel = {
    data: {},
    evt: tunnelEvt,
    modes: ['AUTOMATE_ROUND', 'PULL_ALL'],
    mode: 'PULL_ALL',
    getJSON: function(){
        return new Promise(function(resolve, reject){
            axios.get(JSON_PATH, { responseType: 'json' })
                .then(resp => { resolve(resp.data); })
                .catch(resp => { reject(resp); });
        });
    },
    handlers: {
        AUTOMATE_ROUND: function(){
            tunnel.getJSON()
                .then(data => {
                    for(var key in data){
                        if(key === 'event_round') continue;
                        else this.data[key] = data.key;
                    }
                    tunnel.evt.notifyDataReady();
                })
                .catch(console.error)
        },
        PULL_ALL: function(){
            tunnel.getJSON()
                .then(data => {
                    tunnel.data = data;
                    tunnel.evt.notifyDataReady();
                })
                .catch(console.error)
        }
    },
    run: function(){
        this.handlers[this.mode]();
    }
};


tunnelEvt.notifyDataReady = function(){
    this.emit('dataReady');
};

tunnelEvt.addListener('automateRound', function(){
    tunnel.mode = 'AUTOMATE_ROUND';
});

tunnelEvt.addListener('pullAll', function(){
    tunnel.mode = 'PULL_ALL';
});

var jsonInterval =
    setInterval(function(){
        tunnel.run();
    }, 1000);