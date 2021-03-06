
var PORT = process.env.PORT ||5000
var express = require('express');
var apps = require('express')();
var http = require('http').Server(apps);
var io = require('socket.io')(http);

var App = require('app-binary');

var action_buy = false;
var stake = 0.50;

apps.use(express.static('public'));

apps.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// start 13.053.22
function Play(){
    var app = new App('TIX7nFQxJz4CIFg');
    app.Binary((e)=>{
        //console.log(e)
        if(e.profile) app.spot('R_25')
        if(e.spot){
            if(e.spot.worm == 'B' && action_buy == false){
                console.log('buy '+e.spot.time)
                action_buy = true
                app.buy({
                    stake   : stake,
                    currency: 'USD',
                    contract: 'RISE',
                    duration: '5',
                    duration_set: 't'
                })
            }
        }
        if(e.buy == 'success'){
            app.portfolio()
        }
        if(e.portfolio){
            if(e.portfolio.result == 'won'){
                //if won statement
                stake = 0.5
                action_buy = false
            }
            if(e.portfolio.result == 'lost'){
                //if lost statement
                stake *= 2.1
                action_buy = false
            }
        }
        if(e.reconnect || e.stop){
            setTimeout(Play, 2000)
        }
    });
}

var time = ()=>{
    console.log(new Date(), new Date().getSeconds())
}

setInterval(time, 20000)
http.listen(PORT, () => {
    Play()
  console.log('listening on *:5000');
});