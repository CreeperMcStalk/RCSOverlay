
function getRoundFromString(str){
    /**
     * This function assumes the input string
     * is of the following format:
     * TOUNRNAMENT - ROUND - SET COUNT
     */

    var splits = str.split(' - ');
    var round = splits[1];
    return round;
}

function putRound(){

}