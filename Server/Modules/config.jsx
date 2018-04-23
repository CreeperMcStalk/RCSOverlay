'use strict';

import React from '../../node_modules/react/dist/react';

export default class Config extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            players: [
                new Player(),
                new Player()
            ]
        };
    }

    increaseScore1(){
        
    }

    render(){
        return (
            <div class="row">
                <div class='col-md-12 col-lg-6 col-xl-3'>
                    <form method='POST' action='/overlay/players'>
                        <div class='row' style='{display:flex; flex-direction:row;}'>
                            {
                                thie.state.players.map(function(player){
                                        <div id='col'>
                                            <label>p1 tag:</label>
                                            <input type='text' placeholder='tag' name='p1tag' value={player.tag} />
                                            <br/>
                                            <label>score: </label>
                                            <input type='number' name='p1score' value={player.score} />
                                            <br />
                                            <label>character: </label>
                                        </div>
                                    }
                                )
                            }
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

class Player{
    constructor(tag, score, character, sponsor){
        this.tag = tag;
        this.score = score;
        this.character = character;
        this.sponsor = sponsor;
    }
}