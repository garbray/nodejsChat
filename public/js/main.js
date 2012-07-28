/************************************
 * The Javascript prototype and 
 * window extension
 ************************************/

window.$ = function (){
    return document.getElementById.apply(document, arguments)
}
window.$$ = function (){
    return document.querySelectorAll.apply(document, arguments)
}

Element.prototype.hasClassName = function(name) {
  return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};
Element.prototype.addClassName = function(name) {
  if (!this.hasClassName(name)) {
    this.className = this.className ? [this.className, name].join(' ') : name;
  }
};
Element.prototype.removeClassName = function(name) {
  if (this.hasClassName(name)) {
    var c = this.className;
    this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
  }
};
/******************************
* Global variable
*******************************/

var socket = io.connect(),
	send = $('send'),
	sendNick = $('sendNick'),
	nick = $('nick'),
	text = $('message'),
	area = $('messages'),
  nicknames = $('nicknames'),
  textList = '';

/******************************
* Events listeners emits socketio
*******************************/

sendNick.addEventListener('click',function(){
	console.log(nick.value);
	socket.emit('nickname',nick.value, function (set) {
    	console.log(set);
      if(!set){
        $('nickname-window').addClassName('hide');
        $('main').removeClassName('dontShow');
        $$('.nickname-err')[0].style.visibility = 'hidden';

      }else{
        $$('.nickname-err')[0].style.visibility = 'visible';
      }
    });
});


send.addEventListener('click',function(){
	socket.emit('sendData',text.value);
});

/******************************
* Socket.io on 
*******************************/

socket.on('getdata', function(data){
  area.innerHTML+="<p>"+data+"</p>";
});

socket.on('announcement', function (msg) {
  console.log(msg)
});

socket.on('nicknames',function(usernames){

  var ulNicks = document.createElement('ul'),
      ansUlNick = $('ulNicks');
  nicknames.removeChild(ansUlNick);
  ulNicks.id = 'ulNicks';
  for (var i in usernames) {
    console.log(usernames[i]+' connected');
    var liNick = document.createElement('li');
    liNick.innerText = usernames[i];
    ulNicks.appendChild(liNick);
  }
  

  // textList = liNick.createTextNode(username);
  // ulNicks.appendChild(liNick);
  nicknames.appendChild(ulNicks);
})



