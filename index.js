const WebSocket = require('ws');
var PORT = process.env.PORT ||5000
var express = require('express');
var apps = require('express')();
var http = require('http').Server(apps);

apps.use(express.static('public'));

apps.get('/', (req, res) => {
  //res.sendFile(__dirname + '/index.html');
});

function send(wsuri, obj){
   wsuri.send(JSON.stringify(obj))
}
function buy(wsu, d){
    var params = {
        amount: Number(d.stake).toFixed(2),
        basis: 'stake',
        contract_type: d.contract == 'RISE'? 'CALL':'PUT',
        duration: d.duration,
        currency: d.currency,
        duration_unit: d.duration_set,
        symbol: 'R_10'
    }
    var params2 = {
        parameters: params,
        buy: 1,
        price: Number(d.stake).toFixed(2)
    }
    send(wsu, params2)
  }
var i = 0, contract_id = 0, stake = 0.35,trx = false,trm = false, spots = new Array();
function App(){
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3339');
 
ws.on('open', function open() {
  console.log('connected');
  ws.send(JSON.stringify({authorize: 'TIX7nFQxJz4CIFg'}));
});
 
ws.on('close', function close() {
  console.log('disconnected');
  trm = false
  App()
});
 
ws.on('message', function incoming(data) {
  //console.log(JSON.parse(data).authorize.loginid)
  var d = JSON.parse(data)
      if(d.authorize){
         send(this, {ticks: 'R_10'})
      }
      if(d.tick){
          console.log(d.tick.quote)
          i++
          spots[i] = Number(d.tick.quote)
          var color = spots[i] > spots[i - 1] ? 'G' : 'R'
          var wormcolor = '-'
          if(i > 30){
              var spotworm = spots.slice(i - 29)
              var high   = Math.max.apply(null, spotworm)
              var low    = Math.min.apply(null, spotworm)
              wormcolor = spots[i] >= high? 'B' : spots[i] <= low? 'R' : 'G'
          }
          if( !trm && wormcolor == 'B'){
              console.log('buy')
              trm = true
              buy(this, {
                stake   : stake,
                currency: 'USD',
                contract: 'RISE',
                duration: '5',
                duration_set: 't'
            })
          }
          if(trx) send(this, {proposal_open_contract: 1, contract_id: contract_id})
      }
      if(d.buy){
          trx = true;
          contract_id = d.buy.contract_id
      }
      if(d.proposal_open_contract){
         var dp = d.proposal_open_contract;
         if(dp.validation_error == 'This contract has been sold.'){
             if(dp.status == 'won'){
                stake = 0.35
             }
             if(dp.status == 'lost'){
               stake *= 2.15
             }
             trx = false
             trm = false
         }
      }
});
}
var time = ()=>{
  console.log(new Date(), new Date().getSeconds())
}

setInterval(time, 500)
http.listen(PORT, () => {
  App()
console.log('listening on *:5000');
});

//3.44