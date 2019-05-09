let URL;

function register(){
  let login, pass, repeatPass, data;
  
  login = document.getElementById( "regLogin" ).value;
  pass = document.getElementById( "regPassword" ).value;
  repeatPass = document.getElementById( "regRepeatPassword" ).value;
  
  if( login == "" ){
    massage("Отсутствует логин", false);
    
    return;
  }
  
  if( pass == "" ){
    massage("Отсутствует пароль", false);
    
    return;
  }
  
  if( pass !== repeatPass ){
    massage("Пароли не совпадают", false);
    
    return;
  }
  
  data = {
    "event" : "add user",
    "login" : login,
    "password" : pass
  };
  
  sendRequest( "POST", URL, data, ( r ) => {
    if( r[ "event" ] === "error" ) alert( r[ "message" ] ) ;
    else{
      massage("Вы успешно зарегистрировались", true);
      regClick();
    }
  })

  
}

function login(){
  let login, pass, data;
  
  login = document.getElementById( "logLogin" ).value;
  pass = document.getElementById( "logPassword" ).value;
  
  if( login == "" ){
    massage("Отсутствует логин", false);
    
    return;
  }
  
  if( pass == "" ){
    massage("Отсутствует пароль", false);
    
    return;
  }
  
  data = {
    "event" : "login",
    "login" : login,
    "password" : pass
  };
  
  sendRequest( "POST", URL, data, ( r ) => {
    if( r[ "event" ] === "error" ) alert( r[ "message" ] );
    else{
      massage("Вы успешно вошли", true);
      setCookie( "token", r[ "message" ] );
      logClick();
    }
  } );
}

function addTextToDB(){
  let data;
  
  data = {
    "event" : "add text",
    "token" : getCookie()[ "token" ],
    "txt" : document.getElementById( "addTextBox" ).value
  };
  
  sendRequest( "POST", URL, data, ( r ) => {
    if( r[ "event" ] === "error" ){
      addText2( false );
      alert();
    } 
    else addText2( r[ "message" ] );
  } );
}

function init(){
  let data;
  
  URL = document.location[ "origin" ];
  
  document.getElementById( "registerButton" ).addEventListener( "click", register );
  document.getElementById( "loginButton" ).addEventListener( "click", login );
  
  data = {
    "event" : "get texts"
  };
  sendRequest( "POST", URL, data, ( r ) => setTexts( r[ "message" ] ) );
}

window.addEventListener( "load", init );