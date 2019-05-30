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
      setCookie( "uuid", r[ "message" ][0] );
      logClick();
    }
  } );
}

function addTextToDB(localBool){
  let data;
  
  data = {
    "event" : "add text",
    "uuid" : getCookie()[ "uuid" ],
    "text" : document.getElementById( "addTextBox" ).value,
    "isLocal" : localBool
  };
  
  sendRequest( "POST", URL, data, ( r ) => {
    if( r[ "event" ] === "error" ){
      addText2( false , localBool);
    } 
    else addText2( r[ "message" ] , localBool);
  } );
}

function getTexts(){
  let uuid, data;
  
  uuid = getCookie()[ "uuid" ];
  
  if( uuid === undefined || uuid === "" ) uuid = "";
  
  data = {
    "event" : "get texts",
    "uuid" : uuid
  };
  sendRequest( "POST", URL, data, ( r ) => {
    isLogged( r[ "message" ] ) 
  });
}

function init(){
  URL = document.location[ "origin" ];
  
  document.getElementById( "registerButton" ).addEventListener( "click", register );
  document.getElementById( "loginButton" ).addEventListener( "click", login );
  
  getTexts();
}

window.addEventListener( "load", init );