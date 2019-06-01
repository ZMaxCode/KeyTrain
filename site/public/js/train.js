var jq = jQuery.noConflict();
let text = [];
var activebutton = 0;
var activeTextNumber = 0, activeText;
var truebutton = true;
var falsebutton;
var start = false;
var interval, time = 0, mistake = 0;
var left = 0, size, prevActiveKey, keyLayout = "";
var user = false;
var bestScore;
var letters = " ";
var mode = 0;
var syllableLength = 0, prevSyllableLength;
var userInfo = [];
var isLocal = 0;
var startServer = false;
var localNumber = 0, globalNumber = 0;
var prevTextsWindow = 0;

jq(document).ready(() => {
    jq("#globalTexts .list-text").eq(0).css("background", "#0289d16e");
    jq("#enterTextBox").attr("spellcheck", "false").focus();
    jq("#again").click(() => againClick());
    jq(".user").click(() => userClick("#logReg"));
    jq(".exit").click(() => exitClick());
    jq(".regLine").click(() => lineClick("#reg", "#logReg"))
    jq(".logInLine").click(() => lineClick("#logIn", "#logReg"))
    jq("#addTextButton").click(() => jq("#addText").css("display", "block"))
    jq("#leaderButton").click(() => leaderClick())
    jq(".closeMassage").click(() => jq(".massage").css("display", "none"));
    jq("#rendom-text").click(() => randomText())
    jq("#addAndUpdateText").click(() => addText()); 
    jq("#syllableGenerate").click(() => againClick());
    jq(".checkMode div").eq(0).click(() => textsMode())
    jq(".checkMode div").eq(1).click(() => syllablesMode())
    jq(".exit-user").click(() => logOut());
    jq(".admin").click(() => jq("#moderBlock").css("display", "block"));
    jq("#delText").click(() => delText());
    jq(".userName").click(() => userClick("#change"))
    jq(".changeLogin").click(() => lineClick("#changeLoginBlock", "#change"));
    jq(".changePassword").click(() => lineClick("#changePasswordBlock", "#change"));
    jq("#changeloginButton").click(() => changeLogin());
    jq("#changePasswordButton").click(() => changePassword());
    jq(".usersAdmin").click(() => jq("#usersBlock").css("display", "block"));
    jq("#userNameCheckButton").click(() => userNameCheck());
    jq(".letter").css("transition", "0.2s");
    jq(document).on("input", "#enterTextBox", () => startText());
    jq(document).keyup(function(e) { if (e.key === "Escape" && start) againClick()});
    jq(".progress-line").css("display", "none");
    jq("#again").css("display", "none");
    changeTextCategory();
    for(var i = 0; i < jq(".key").length; i++){
        for(var j = 0; j < jq(".key").eq(i).text().length; j++){
            var d = jq(".key").eq(i).text()[j];
            if(typeof(d) !== "undefined" && d !== "↑" && d !== "↵" && d != "←") letters += d
        }
    }
    checkMode();
    checkSyllableLength();
});

function userNameCheck(){
    if(jq("#userNameCheck").val() != ""){
        let data;

        data = {
            'event' : 'get user',
            'uuid' : getCookie()[ 'uuid' ],
            'login' : jq("#userNameCheck").val()
        }

        sendRequest( "POST", URL, data, ( r ) => {
            if(r[ "event" ] === "success"){
                userBool = r[ "message" ][2] == 1;
                userId = r["message"][0];

                jq("#userNameInfo").text(r[ "message" ][1])
                if(userBool){
                    jq("#userNameStatus").text("Администратор");
                    jq("#userNameAdmin").text("Удалить из администраторов");
                    jq(".userNameInfoBlock").css("display", "block");
                    jq("#userNameAdmin").on("click",() => {
                        changeUserStatus(userId, false, "Добавить в администраторы", r[ "message" ][1]);
                        jq("#userNameStatus").text("Пользователь");
                        userBool = false;
                    })
                }
                else{
                    jq("#userNameStatus").text("Пользователь");
                    jq("#userNameAdmin").text("Добавить в администраторы");
                    jq(".userNameInfoBlock").css("display", "block");
                    jq("#userNameAdmin").on("click", () => {
                        changeUserStatus(userId, true, "Удалить из администраторов", r[ "message" ][1]);
                        jq("#userNameStatus").text("Администратор");
                        userBool = true;
                    })
                }
            }
            else{
                massage("Произошла ошибка", false);
                jq(".userNameInfoBlock").css("display", "none");
            } 
        } )
    }
    else massage("Введите имя пользователя", false)
}

function changeUserStatus(userId, isAdmin, buttonText, userName){
    let data;

    data = {
        'event' : 'change user status',
        'uuid' : getCookie()[ 'uuid' ],
        'userId' : userId,
        'isAdmin' : isAdmin
    }


    sendRequest( "POST", URL, data, ( r ) =>{
        if(r[ "event" ] === "success"){
            massage("Статус пользователя " + userName + " успешно изменен", true);
            jq("#userNameAdmin").text(buttonText);
            if(userName == userInfo[1]) getTexts();
            jq(".userNameInfoBlock").css("display", "none");
            jq("#userNameAdmin").off("click");
        }
        else{
            massage("произошла ошибка", false);
        }
    })
}

function changePassword(){
    if(jq("#changeOldPassword").val() != "" && jq("#changeNewPassword").val() != "" && jq("#repNewPassword").val() != ""){
        if(jq("#changeNewPassword").val() == jq("#repNewPassword").val()){
            let data;

            data = {
                'event' : 'change password',
                'uuid' : getCookie()[ 'uuid' ],
                'oldPassword' : jq("#changeOldPassword").val(),
                'newPassword' : jq("#changeNewPassword").val()
            }

            sendRequest( "POST", URL, data, ( r ) => {
                if(r[ "event" ] === 'success'){
                    massage("Пароль успешно изменен", true);
                    exitClick()
                }
                else massage("Произошла ошибка", false);
            })
        }
        else massage("Новые пароли не совпадают", false)
    }
    else massage("Заполните все поля", false)
}

function changeLogin(){
    if(jq("#changeLogin").val() != "" && jq("#changeloginPassword").val() != ""){
        let data;

        data = {
            'event' : 'change login',
            'uuid' : getCookie()[ 'uuid' ],
            'login' : jq("#changeLogin").val(),
            'password' : jq("#changeloginPassword").val()
        }

        sendRequest( "POST", URL, data, ( r ) => {
            if(r[ 'event' ] === 'success' ){
                massage("Логин успешно изменен", true);
                jq(".userName").text(jq("#changeLogin").val());
                userInfo[1] = jq("#changeLogin").val();
                exitClick();
            }
            else massage("Произошла ошибка", false);
        })
    }
    else massage("Введите новый логин и старый пароль", false);
}

function delText(){
    if(isLocal || userInfo[0] == 1){
        let data;

        if(isLocal) delPage = "#localTexts";
        else delPage = "#globalTexts";

        data = {
            'event' : 'delete text',
            'uuid' : getCookie()[ 'uuid' ],
            'textId' : jq(delPage + " .list-text").eq(activeTextNumber).attr("textId")
        }

        sendRequest( "POST", URL, data, ( r ) => {
            if(r[ 'event' ] === 'success'){
                massage("Текст успешно удален", true);
                jq(delPage + " .list-text").eq(activeTextNumber).remove();
                if(isLocal && jq("#localTexts .list-text").length === 0){
                    delPage = "#globalTexts";
                    helpChangeTextCtegory(0, 1);
                    prevTextsWindow = 0;
                }
                changeText(jq(delPage + " .textBlock").eq(0), 0);
            }
            else massage("Произошла ошибка", false);
        });
    }
}

function setModerText(texts){
    for(let i = 0; i < texts[2].length; i++){
        let block = jq("<div/>").attr("class", "moderTextAddDelete");
        let text = jq("<div/>").attr("class", "moderText").attr("textId", texts[2][i][0]).text(texts[2][i][2]);
        let buttonBlock = jq("<div/>").attr("class", "moderButtons");
        let addButton = jq("<button/>").attr("id", "addModerText").text("Добавить");
        let deleteButton = jq("<button/>").attr("id", "deleteModerText").text("Удалить");

        buttonBlock.append(addButton, deleteButton);
        block.append(text, buttonBlock);
        jq(".moderTextBlock").append(block);

        addButton.click(() => {
            data = {
                'event' : 'accept or decline text',
                'uuid' : getCookie()[ 'uuid' ],
                'textId' : texts[2][i][0],
                'action' : true
            };
            sendRequest( "POST", URL, data, ( r ) => {
                if(r[ "event" ] === "success"){
                    massage("Текст успешно добавлен", true);
                    jq(".moderTextAddDelete").eq(i).remove();

                    text.push(texts[2][i][2]);
                    let block = jq("<div/>").attr("class", "list-text").attr("textId", texts[2][i][0]);
                    let lengthText = jq("<div/>").text(texts[2][i][2].length + " символов").attr("class", "length-text");
                    let textBlock = jq("<div/>").attr("class", "textBlock").text(texts[2][i][2]);;
                    jq("#globalTexts").append(block);
                    block.append(textBlock, lengthText);
                    block.click(() => changeText(textBlock, jq(".globalTexts .list-text").length - 1));
                    jq("#globalTexts #help-list-text").remove();
                    jq("#globalTexts").append(jq("<div/>").attr("id", "help-list-text").css("height", jq(".list-text").eq(0).height() + 40 + "px"));
                }
                else massage("Произошла ошибка", false);
            } );
        })

        deleteButton.click(() => {
            data = {
                'event' : 'accept or decline text',
                'uuid' : getCookie()[ 'uuid' ],
                'textId' : jq(".moderText").eq(i).attr("textId"),
                'action' : false
            };
            sendRequest( "POST", URL, data, ( r ) => {
                if(r[ "event" ] === "success"){
                    massage("Текст успешно удален", true);
                    block.remove();
                }
                else massage("Произошла ошибка", false);
            } );
        })
    }
}

function checkSyllableLength(){
    jq(".syllableRadio").eq(0).css({
        "background": "#ff5722d7",
        "opacity": "1",
        "color": "white"
    });
    for(let i = 0; i < jq(".syllableRadio").length; i++){
        jq(".syllableRadio").eq(i).click(() => {
            if(syllableLength !== i){
                prevSyllableLength = syllableLength;
                jq(".syllableRadio").eq(i).css({
                    "background": "#ff5722d7",
                    "opacity": "1",
                    "color": "white"
                })
                jq(".syllableRadio").eq(prevSyllableLength).css({
                    "background": "transparent",
                    "opacity": "0.7",
                    "color": "black"
                })
                syllableLength = i;
            }
            changeText(NaN, NaN);
        })
    }
}

function modeStyle(eq, op, bc, c){
    jq(".checkMode div").eq(eq).css({
        "opacity": op,
        "background": bc,
        "color": c
    })
}

function checkMode(){
    if(mode == 0){
        jq(".syllableResult").css("transform", "translateX(calc(100% + 10px))")
        modeStyle(0, "1", "#3f51b5d7", "white");
        modeStyle(1, "0.7", "transparent", "black");
    }
    else{
        modeStyle(1, "1", "#3f51b5d7", "white");
        modeStyle(0, "0.7", "transparent", "black");
    }
}

function syllablesMode(){
    mode = 1;
    checkMode();
    jq(".left-block, .right-block").css("width", "0px");
    jq(".center-block").css("margin", "2vh auto")
    jq(".other-text-button").css("opacity", "0")
    jq(".syllableBlock").css({
        "height": "5vh",
        "padding": "5px"
    })
    setTimeout(() => jq(".other-text-button").css("display", "none"), 300)
    changeText(NaN, NaN)
}

function textsMode(){
    let m;
    if(isLocal) m = "#localTexts";
    else m = "#globalTexts";

    mode = 0;
    checkMode()
    jq(".left-block, .right-block").css("width", "15%");
    jq(".center-block").css("margin", "0 auto")
    if(isLocal || userInfo[0] == 1) jq(".oth4").css("display", "block");
    if(!isLocal) jq(".oth3").css("display", "block");
    jq(".oth2, .oth1").css("display", "block");
    jq(".syllableBlock").css({
        "height": "0",
        "padding": "0"
    })

    if(isLocal || userInfo[0] == 1) setTimeout(() => jq(".oth4").css("opacity", "1"), 1);
    else if(!isLocal) setTimeout(() => jq(".oth3").css("opacity", "1"), 1);
    setTimeout(() => jq(".oth1, .oth2").css("opacity", "1"), 1);

    if(isLocal && jq(m + " .textBlock").length == 0){
        helpChangeTextCtegory(0, 1);
        prevTextsWindow = 0;
        changeText(jq("#globalTexts .textBlock").eq(0), 0)
    } 
    else changeText(jq(m + " .textBlock").eq(activeTextNumber), activeTextNumber)
}

function helpChangeTextCtegory(i, j){
    jq(".flex-header div").eq(i).css("background", "#009688a7");
    jq(".flex-header div").eq(j).css("background", "transparent");
    if(i == 0){
        jq(".oth3").css("display", "block");
        setTimeout(() => jq(".oth3").css("opacity", "1"), 1);
        if(userInfo[0] == 0 && jq("#localTexts .list-text").length !== 0){
            jq(".oth4").css("opacity", "0");
            setTimeout(() => jq(".oth4").css("display", "none"), 300);
        }
        jq(".list-text-block").eq(i).css("transform", "translateX(0%)");
        jq(".list-text-block").eq(j).css("transform", "translateX(0%)");
        isLocal = 0;
        if(startServer){
            jq("#localTexts .list-text").eq(globalNumber).css("background", "transparent");
            changeText(jq("#globalTexts .textBlock").eq(globalNumber), globalNumber)
        }
        
    }
    else{
        jq(".oth3").css("opacity", "0");
        setTimeout(() => jq(".oth3").css("display", "none"), 300);
        if(userInfo[0] == 0 && jq("#localTexts .list-text").length !== 0){
            jq(".oth4").css("display", "block");
            setTimeout(() => jq(".oth4").css("opacity", "1"), 1);
        }
        jq(".list-text-block").eq(i).css("transform", "translateX(-100%)");
        jq(".list-text-block").eq(j).css("transform", "translateX(-100%)");
        isLocal = 1;
        if(startServer && jq("#localTexts .list-text").length != 0){
            jq("#globalTexts .list-text").eq(localNumber).css("background", "transparent");
            changeText(jq("#localTexts .textBlock").eq(localNumber), localNumber)
        }
        
    }
}

function changeTextCategory(){
    helpChangeTextCtegory(prevTextsWindow, 1);
    for(let i = 0; i < 2; i++){
        jq(".flex-header div").eq(i).click(() => {
            if(prevTextsWindow != i){
                helpChangeTextCtegory(i, prevTextsWindow);
                prevTextsWindow = i;
            }
        })
    }
}

function exitClick(){
    jq(".bigBlock").css("display", "none");
    jq(".leader-users, .leaderMe .leaderInfo").remove();
    jq("#logPassword, #logLogin, #regRepeatPassword, #regPassword, #regLogin, #changeOldPassword, #changeNewPassword, #repNewPassword, #changeLogin, #changeLoginPassword").val("");
}

function leaderClick(){
    jq("#leaderboard").css("display", "block");
    sendRequest("POST", URL, {
        "event": "get scores by text id",
        "textId": jq("#globalTexts .list-text").eq(activeTextNumber).attr( "textId" )
    }, ( r ) => {
      if( r[ "event" ] === "success" ) createLeaderTable( r [ "message" ] );
      else createLeaderTable( [] );
    } );
}

function createLeaderTable(leaders){
    var us = false;
    for(var i = 0; i < leaders.length; i++){
        var block = jq("<div/>");
        block.attr("class", "leaderInfoFlex leader-users");
        var line = jq("<div/>");
        line.attr("class", "leaderInfo");
        line.text(i + 1);
        jq(".leaderBlock").append(block);
        block.append(line);
        for(var j = 0; j < leaders[i].length; j++){
            var line = jq("<div/>");
            line.attr("class", "leaderInfo");
            line.text(leaders[i][j]);
            block.append(line);
        }
        if(leaders[i][0] == userInfo[1] && getCookie()["uuid"] != ""){
            us = true;
            var line = jq("<div/>");
            line.attr("class", "leaderInfo");
            line.text(i + 1);
            jq(".leaderMe").append(line);
            for(var j = 0; j < leaders[i].length; j++){
                var line = jq("<div/>");
                line.attr("class", "leaderInfo");
                line.text(leaders[i][j]);
                jq(".leaderMe").append(line);
            }
        }
        
    }
    if(getCookie()["uuid"] == ""){
        var line = jq("<div/>");
        line.attr("class", "leaderInfo");
        line.text("Войдите в систему, чтобы найти себя");
        jq(".leaderMe").append(line);
    }
    if(!us && getCookie()["uuid"] != ""){
        var line = jq("<div/>");
        line.attr("class", "leaderInfo");
        line.text("Напишите текст, чтобы оказаться в топе");
        jq(".leaderMe").append(line);
    }
}

function regClick(){
    jq("#logIn").css("display", "block");
    jq("#reg").css("display", "none");
}

function logClick(){
    jq("#logIn").css("display", "none");

    getTexts();
    changeText(jq("#globalTexts .textBlock").eq(0), 0);
}

function massage(text, bool){
    setTimeout(() => jq(".massage").css("display", "none"), 3000);
    jq(".massage").css("display", "block");
    if(bool) jq(".massage").css("background", "#8bc34ad7")
    else jq(".massage").css("background", "#f44336d7")
    jq(".massage-text").text(text);
}

function isLogged(texts){
    let uuid;
    let data;
    
    uuid = getCookie()[ "uuid" ];
    if(uuid === undefined){
        uuid = "";
        setCookie("uuid", "");
    } 

    data = {
        'event' : 'check user',
        'uuid' : uuid
    };

    changeTextCategory();
    jq("#localTexts, #globalTexts").empty();
    if(uuid !== ""){
        sendRequest( "POST", URL, data, ( r ) => {
            if( r[ "event" ] === "success" ){
                userInfo = r[ "message" ];
                jq(".user").css("display", "none");
                jq(".user-info").css("display", "block");
                if(userInfo[0] == 1){
                    jq(".oth4, .admin, .usersAdmin").show();
                    setModerText(texts);
                } 
                else jq(".oth4, .admin, .usersAdmin").hide(); 
                jq(".userName").text(userInfo[1]);
                setTexts(texts);
                startServer = true;
                jq(".flex-header div").eq(1).show();
            }
            else notLoginUser(texts)
        });
    }
    else notLoginUser(texts)
}

function notLoginUser(texts){
    jq(".oth4, .admin").hide();
    jq(".user").css("display", "block");
    jq(".user-info").css("display", "none");
    jq(".userName").text("");
    userInfo = [];
    setTexts(texts);
    startServer = true;
    jq(".flex-header div").eq(1).hide();
}

function logOut(){
    setCookie("uuid", "");
    changeTextCategory();
    if(isLocal){
        helpChangeTextCtegory(0, 1);
        prevTextsWindow = 0;
    }
    changeText(jq("#globalTexts .textBlock").eq(0), 0);
    getTexts();
    startServer = false;
    massage("Вы успешно вышли", true)
}

function createListText(i, j, LGMode, texts){
    let block = jq("<div/>");
    let lengthText = jq("<div/>");
    let textBlock = jq("<div/>");
    lengthText.text(texts[j][i][2].length + " символов")
    lengthText.attr("class", "length-text");
    textBlock.text(texts[j][i][2]);
    textBlock.attr("class", "textBlock");
    block.attr("class", "list-text").attr("textId", texts[j][i][0]);
    jq(LGMode).append(block);
    block.append(textBlock, lengthText);
    block.click(() => changeText(textBlock, i));
    text[i] = texts[j][i][2];
}

function setTexts( texts ){
    for(let i = 0; i < texts[0].length; i++){
        createListText(i, 0, "#globalTexts", texts)
    }
    if(userInfo.length !== 0){
        for(let i = 0; i < texts[1].length; i++){
            createListText(i, 1, "#localTexts", texts)
        }
    }
    
    activeText = text[0];
    jq("#globalTexts, #localTexts").append(jq("<div/>").attr("id", "help-list-text").css("height", jq(".list-text").eq(0).height() + 40 + "px"))
    if(isLocal){
        helpChangeTextCtegory(0,1);
        prevTextsWindow = 0;
    }
    changeText(jq("#globalTexts .textBlock").eq(0), 0);
    seeKey();
}

function addText(){
    var check = true;
    var d = jq("#addTextBox").val();
    var errorLetter;
    var localBool;
    for(var i = 0; i < d.length; i++){
        if(letters.indexOf(d[i].toLowerCase()) == -1){
            check = false;
            if(d[i] !== "\n") errorLetter = d[i];
            else errorLetter = "enter";
            break;
        }
    }

    if(jq("#addLocalText").prop("checked")) localBool = 1;
    else localBool = 0;

    if(d != "" && getCookie()["uuid"] != "" && check && d.length >= 30) addTextToDB(localBool);
    else if(!check && d.length > 0) massage("Найден символ, которого нет в русской и английской расскладке клавиатуры: " + errorLetter, false)
    else if(d === "") massage("Введите текст", false)
    else if(d.length < 30) massage("Текст должен быть больше или равен 30 символам", false)
    else massage("Войдите в систему, чтобы добавлть тексты", false)
}

function addText2( resolt, localBool ){
    if( resolt !== false ){
        if(userInfo[0] == 1 || localBool){
            text.push(jq("#addTextBox").val());
            let block = jq("<div/>");
            let lengthText = jq("<div/>");
            let textBlock = jq("<div/>");
            lengthText.text(jq("#addTextBox").val().length + " символов")
            lengthText.attr("class", "length-text");
            textBlock.attr("class", "textBlock");
            textBlock.text(jq("#addTextBox").val());
            block.attr("class", "list-text").attr("textId", resolt);
            if(!localBool) jq("#globalTexts").append(block);
            else jq("#localTexts").append(block)
            block.append(textBlock, lengthText);
            let i;
            if(!localBool) i = jq("#globalTexts .list-text").length - 1;
            else i = jq("#localTexts .list-text").length - 1;
            block.click(() => changeText(textBlock, i));
            massage("Текст успешно добавлен", true)
            jq("#addTextBox").val("");
            jq("#addText").css("display", "none");
            jq(".oth4").css("display", "block");
            setTimeout(() => jq(".oth4").css("opacity", "1"), 1);
            if(localBool && jq("#localTexts .list-text").length == 1) changeText(textBlock, i);
            if(!localBool){
                jq("#globalTexts #help-list-text").remove();
                jq("#globalTexts").append(jq("<div/>").attr("id", "help-list-text").css("height", jq(".list-text").eq(0).height() + 40 + "px"));
            }
            else{
                jq("#localTexts #help-list-text").remove();
                jq("#localTexts").append(jq("<div/>").attr("id", "help-list-text").css("height", jq(".list-text").eq(0).height() + 40 + "px"));
            } 
            
        }
        else{
            massage("Текст отправлен на модерацию", true)
            jq("#addTextBox").val("");
            jq("#addText").css("display", "none");
        }
    }
}

function randomText(){
    var rand;
    var d = isLocal
    if(!d){
        rand = Math.floor(Math.random() * (jq("#globalTexts .list-text").length  - 0) + 0);
        if(jq("#globalTexts .list-text").length > 1){
            while(rand == activeTextNumber) rand = Math.floor(Math.random() * (jq("#globalTexts .list-text").length  - 0) + 0);
            changeText(jq("#globalTexts .textBlock").eq(rand), rand);
        }
    } 
    else{
        rand = Math.floor(Math.random() * (jq("#localTexts .list-text").length  - 0) + 0);
        if(jq("#localTexts .list-text").length > 1){
            while(rand == activeTextNumber) rand = Math.floor(Math.random() * (jq("#localTexts .list-text").length  - 0) + 0);
            changeText(jq("#localTexts .textBlock").eq(rand), rand);
        }
    } 
}

function createText(){
    for(var i = 0; i < activeText.length; i++){
        var letter = jq("<span/>");
        letter.text(activeText[i]);
        letter.attr("class", "letter");
        jq(".text").append(letter);
    }
}

function changeText(block, i){
    if(i == 0 && !isLocal){
        jq(".oth4").css("opacity", "0");
        setTimeout(() => jq(".oth4").css("display", "none"), 300);
    }
    else if(userInfo[0] == 1 && !isLocal){
        jq(".oth4").css("display", "block");
        setTimeout(() => jq(".oth4").css("opacity", "1"), 1);
    }

    let data;
    if(mode == 0){
        if(!isLocal){
            jq("#globalTexts .list-text").eq(activeTextNumber).css("background", "transparent");
            jq("#globalTexts .list-text").eq(i).css("background", "#0289d16e");
            globalNumber = i;
        }
        else{
            jq("#localTexts .list-text").eq(activeTextNumber).css("background", "transparent");
            jq("#localTexts .list-text").eq(i).css("background", "#0289d16e");
            localNumber = i;
        }
        activeTextNumber = i;
        activeText = block.text();
    }
    else activeText = randomSlyllables( parseInt(jq(".syllableRadio").eq(syllableLength).text()), 40, 30 );
    jq(".text").empty();
    createText();
    againClick();
    
    if(mode == 0){
        data = {
            'event' : 'get score by uuid and text id',
            'uuid' : getCookie()[ 'uuid' ],
            'textId' : !isLocal ? jq("#globalTexts .list-text").eq(activeTextNumber).attr( "textId" ) : jq("#localTexts .list-text").eq(activeTextNumber).attr( "textId" )
        };
        sendRequest( "POST", URL, data, ( r ) => {
            if( r[ "event" ] === "error" ) bestScore = 0;
            else bestScore = r[ "message" ];
        } );
    }
    
}

function lineClick(id, block){
    jq(id).css("display", "block");
    userClick(block);
}



function userClick(block){
    if(!user){
        jq(block).css("display", "block");
        user = true;
    }
    else{
        jq(block).css("display", "none");
        user = false;
    }
}

function startText(){
    var textInArea = jq("#enterTextBox").val();
    if(!start){
        interval = setInterval(() => time += 0.1, 100);
        start = true;
        jq("#again").css("display", "block");
        jq(".help").css("opacity", "0");
    }
    if(textInArea.length > activebutton){
        if(activebutton >= 15 && activebutton <= activeText.length - 15){
            left-= jq(".helptext").text(activeText[activebutton]).width();
            jq(".text").css("transform", "translateX(" + left + "px)")
        }
        if(truebutton){
            if(textInArea[activebutton] == activeText[activebutton]){
                jq(".letter").eq(activebutton).css("color", "#4caf50");
                activebutton++;
            } 
            else{
                jq(".letter").eq(activebutton).css("color", "#f44336");
                truebutton = false;
                falsebutton = activebutton;
                mistake++;
                activebutton++;
            }
            if(activebutton < activeText.length) seeKey();
        }
        else{
            jq(".letter").eq(activebutton).css("color", "#f44336");
            activebutton++;
        } 
    }
    else{
        activebutton--
        if(activebutton >= 15 && activebutton <= activeText.length - 15){
            left+= jq(".helptext").text(activeText[activebutton]).width();
            jq(".text").css("transform", "translateX(" + left + "px)")
        }
        jq(".letter").eq(activebutton).css("color", "black");
        if(activebutton == falsebutton) truebutton = true;
        seeKey();
    }
    if(textInArea.length == activeText.length && truebutton){
        clearInterval(interval);
        jq(".key").eq(prevActiveKey).removeClass("activeKey");
        removeShift()
        prevActiveKey = NaN;
        keyNumber = parseInt(activeText.length / time * 60) - mistake * 5;
        keySpeed = parseInt(activeText.length / time * 60)
        
        if( keyNumber < 0 ) keyNumber = 0;

        if(mode == 0){
            if(keyNumber > bestScore) bestScore = keyNumber;
            jq('.total').html("Ваши баллы: " + keyNumber + " очков" + checkRecord(bestScore) + "<br><br>Скорость печати: " + keySpeed + " символов в минуту"+ "<br><br>Количество ошибок: " + mistake);
            jq('#enterTextBox').attr('disabled','disabled');
            jq(".progress-line-process").css("left", keyNumber >= 400 ? 100 + "%" : 100 / 400 * keyNumber + "%");
            jq(".progress-line").css("display", "block");
            setScore(keyNumber, keySpeed);
        }
        else{
            jq(".syllableResult span").text("Скорость печати: " + keySpeed + " символов в минуту");
            jq(".syllableResult").css("transform", "translateX(0px)");
            jq('#enterTextBox').attr('disabled','disabled');
        }
    }
}

function setScore( score ){
    let textId, data;
    if(!isLocal) textId = parseInt(jq("#globalTexts .list-text").eq(activeTextNumber).attr("textId"));
    else textId = parseInt(jq("#localTexts .list-text").eq(activeTextNumber).attr("textId"));

    data = {
        "event": "add score",
        "uuid": getCookie()["uuid"],
        "textId": textId,
        "score": score
    };
    sendRequest("POST", URL, data, ( r ) => {
        if( r[ "event" ] === "success" ) bestScore = score;
    } );
}

function checkRecord(score){
    if(userInfo.length !== 0) return "<br><br>Ваш рекорд: " + score + " очков";
    return "<br><br>Для сохранения рекорда войдите в систему";
}

function againClick(){
    clearInterval(interval);
    var key = jq(".key");
    jq("#enterTextBox").val("").attr("disabled", false).focus();
    jq(".total").html("Ожидание завершения написания текста");
    jq(".letter").css("color", "black");
    start = false;
    truebutton = true;
    activebutton = 0;
    time = 0;
    mistake = 0;
    left = 0;
    key.eq(prevActiveKey).removeClass("activeKey");
    prevActiveKey = NaN;
    removeShift();
    seeKey();
    jq("#again").css("display", "none");
    jq(".help").css("opacity", "1");
    jq(".text").css("transform", "translateX(0px)");
    jq(".progress-line").css("display", "none");
    jq(".syllableResult").css("transform", "translateX(calc(100% + 10px))")
}

function seeKey(){
    var key = jq(".key");
    var textUpper = activeText.toUpperCase();
    var letterCode = ["A".charCodeAt(0), "Z".charCodeAt(0), "А".charCodeAt(0), "Я".charCodeAt(0)]
    if(findLetter() && activebutton != 0){
        if(activeText.toUpperCase().charCodeAt(activebutton) >= letterCode[0] && activeText.toUpperCase().charCodeAt(activebutton) <= letterCode[1]) keyLayout = "eng";
        else keyLayout = "rus";
    }
    else if(activebutton == 0){
        for(var i = 0; i < activeText.length; i++){
            if(findLetter()){
                if(textUpper.toUpperCase().charCodeAt(i) >= letterCode[0] && textUpper.toUpperCase().charCodeAt(i) <= letterCode[1]) keyLayout = "eng";
                else keyLayout = "rus";
                break;
            }
        }
    }

    if(!isNaN(prevActiveKey)) key.eq(prevActiveKey).removeClass("activeKey");
    if(truebutton){
        if(findLetter()){
            if(activeText[activebutton] === activeText[activebutton].toUpperCase()){
                for(var i = 0; i < key.length; i++){
                    var s = false;
                    for(var j = 0; j < key.eq(i).text().length; j++){
                        if(key.eq(i).text()[j].toUpperCase() == activeText[activebutton].toUpperCase()){
                            changeShift(i);
                            s = true;
                            break;
                        }
                    }
                    if(s) break;
                }
            } 
            else removeShift();
        }
        switch(activeText[activebutton]){
        case "\"" : checkKey(39, key, true, 2, true); break;
        case ";" : checkKey(38, key, false, 4, true); break;
        case ":" : checkKey(38, key, true, 6, true); break;
        case "?" : checkKey(51, key, true, 7, true); break;
        case "/" : checkKey(51, key, false, 27, true); break;
        case "," : checkKey(49, key, false, 51, true); break;
        case "." : checkKey(50, key, false, 51, false); break;
        case " " : checkKey(50, key, false, 51, false); break;
        default : 
            for(var i = 0; i < key.length; i++){
                var exit = false;
                for(var j = 0; j < key.eq(i).text().length; j++){
                    if(key.eq(i).text()[j].toUpperCase() == activeText[activebutton].toUpperCase()){
                        key.eq(i).addClass("activeKey");
                        if(!findLetter()){
                            var simbol1 = "-=\\'", simbol2 = "!@#№$%^&*()_+|<>", exit = false;;
                            for(var k = 0; k < simbol1.length; k++){
                                if(activeText[activebutton] == simbol1[k]){
                                    removeShift()
                                    exit = true;
                                    break;
                                } 
                            }
                            if(!exit){
                                for(var k = 0; k < simbol2.length; k++){
                                    if(activeText[activebutton] == simbol2[k]){
                                        changeShift(i)
                                        break;
                                    }
                                }
                            }
                            
                        }
                        exit = true;
                        prevActiveKey = i;
                        break;
                    }
                }
                if(exit) break;
            }
        break;
        }
        if(activeText[activebutton] == " "){
        key.eq(prevActiveKey).removeClass("activeKey");
        removeShift();
        key.eq(53).addClass("activeKey");
        prevActiveKey = 53;
        } 
    }
    else{
        key.eq(prevActiveKey).removeClass("activeKey");
        removeShift();
        key.eq(13).addClass("activeKey");
        prevActiveKey = 13;
    }
}

function checkKey(a, b, c, d, e){
    if(keyLayout == "eng"){ 
        b.eq(a).addClass("activeKey"); 
        prevActiveKey = a;
        c ? changeShift(a) : removeShift();
    } 
    else {
        b.eq(d).addClass("activeKey"); 
        prevActiveKey = d;
        e ? changeShift(d) : removeShift();
    }
}

function findLetter(){
    var textUpper = activeText.toUpperCase();
    var letterCode = ["A".charCodeAt(0), "Z".charCodeAt(0), "А".charCodeAt(0), "Я".charCodeAt(0)]
    return ((textUpper.toUpperCase().charCodeAt(activebutton) >= letterCode[0] && textUpper.charCodeAt(activebutton) <= letterCode[1]) || 
    (textUpper.toUpperCase().charCodeAt(activebutton) >= letterCode[2] && textUpper.toUpperCase().charCodeAt(activebutton) <= letterCode[3]));
}

function changeShift(i){
    if(jq(".key").eq(i).hasClass("onefinger") || jq(".key").eq(i).hasClass("twofinger") || jq(".key").eq(i).hasClass("threefinger") || jq(".key").eq(i).hasClass("fourfinger")){
        jq(".key").eq(52).addClass("activeKey");
        jq(".key").eq(41).removeClass("activeKey");
    }
    else{
        jq(".key").eq(41).addClass("activeKey");
        jq(".key").eq(52).removeClass("activeKey");
    }
}

function removeShift(){
    jq(".key").eq(52).removeClass("activeKey");
    jq(".key").eq(41).removeClass("activeKey");
}