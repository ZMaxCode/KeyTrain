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

jq(document).ready(() => {
    jq(".list-text").eq(0).css("background", "#0289d16e");
    jq("#enterTextBox").attr("spellcheck", "false").focus();
    jq("#again").click(() => againClick());
    jq(".user").click(() => userClick());
    jq(".exit").click(() => exitClick());
    jq(".regLine").click(() => lineClick("#reg"))
    jq(".logInLine").click(() => lineClick("#logIn"))
    jq("#addTextButton").click(() => jq("#addText").css("display", "block"))
    jq("#leaderButton").click(() => leaderClick())
    jq(".closeMassage").click(() => jq(".massage").css("display", "none"));
    jq("#rendom-text").click(() => randomText())
    jq("#addAndUpdateText").click(() => addText());
    jq(".admin").click(() => moderText());
    jq(".letter").css("transition", "0.2s");
    jq(document).on("input", "#enterTextBox", () => startText());
    jq(document).keyup(function(e) { if (e.key === "Escape" && start) againClick()});
    jq(".progress-line").css("display", "none");
    jq("#again").css("display", "none");
    changeTextCategory();
    checkUser();
    for(var i = 0; i < jq(".key").length; i++){
        for(var j = 0; j < jq(".key").eq(i).text().length; j++){
            var d = jq(".key").eq(i).text()[j];
            if(typeof(d) !== "undefined" && d !== "↑" && d !== "↵" && d != "←") letters += d
        }
    }
});

function moderText(){
    jq("#moderBlock").css("display", "block");
}

function helpChangeTextCtegory(i, j){
    jq(".flex-header div").eq(i).css("background", "#009688a7");
    jq(".flex-header div").eq(j).css("background", "transparent");
    jq(".list-text-block").eq(i).css("display", "block");
    jq(".list-text-block").eq(j).css("display", "none");
}

function changeTextCategory(){
    var prevTextsWindow = 0;
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
    jq("#logPassword, #logLogin, #regRepeatPassword, #regPassword, #regLogin").val("");
}

function leaderClick(){
    jq("#leaderboard").css("display", "block");
    sendRequest("POST", URL, {
        "event": "get scores",
        "textId": jq(".list-text").eq(activeTextNumber).attr( "textId" )
    }, (r) => createLeaderTable(r["message"]));
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
        if(leaders[i][0] == localStorage.getItem("username") && getCookie()["token"] != ""){
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
    if(getCookie()["token"] == ""){
        var line = jq("<div/>");
        line.attr("class", "leaderInfo");
        line.text("Войдите в систему, чтобы найти себя");
        jq(".leaderMe").append(line);
    }
    if(!us && getCookie()["token"] != ""){
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
    localStorage.setItem('username', jq("#logLogin").val());
    jq("#logIn").css("display", "none");
    checkUser();
    changeText(jq(".textBlock").eq(activeTextNumber), activeTextNumber);
}

function massage(text, bool){
    setTimeout(() => jq(".massage").css("display", "none"), 3000);
    jq(".massage").css("display", "block");
    if(bool) jq(".massage").css("background", "#8bc34ad7")
    else jq(".massage").css("background", "#f44336d7")
    jq(".massage-text").text(text);
}

function checkUser(){
    if(isLogged()){
        jq(".user").css("display", "none");
        jq(".user-info").css("display", "block");
        jq(".userName").text(localStorage.getItem("username"));
        jq(".exit-user").click(() => logOut());
    }
    else{
        jq(".user").css("display", "block");
        jq(".user-info").css("display", "none");
        jq(".userName").text("");
    }
}

function isLogged(){
    let token;
    
    token = getCookie()[ "token" ];
    if( token === "" ) return false;
    return token;
}

function logOut(){
    setCookie("token", "");
    changeText(jq(".textBlock").eq(activeTextNumber), activeTextNumber);
    localStorage.setItem("username", "");
    checkUser();
    massage("Вы успешно вышли", true)
}

function setTexts( texts ){
    for(let i = 0; i < texts.length; i++){
        let block = jq("<div/>");
        let lengthText = jq("<div/>");
        let textBlock = jq("<div/>");
        lengthText.text(texts[i][2].length + " символов")
        lengthText.attr("class", "length-text");
        textBlock.text(texts[i][2]);
        textBlock.attr("class", "textBlock");
        block.attr("class", "list-text").attr("textId", texts[i][0]);
        jq("#globalTexts").append(block);
        block.append(textBlock, lengthText);
        block.click(() => changeText(textBlock, i));
        text[i] = texts[i][2];
    }
    activeText = text[0];
    jq("#globalTexts").append(jq("<div/>").attr("id", "help-list-text").css("height", jq(".list-text").eq(0).height() + 40 + "px"))
    changeText(jq(".textBlock").eq(0), 0);
    seeKey();
}

function addText(){
    var check = true;
    var d = jq("#addTextBox").val();
    var errorLetter;
    for(var i = 0; i < d.length; i++){
        if(letters.indexOf(d[i].toLowerCase()) == -1){
            check = false;
            if(d[i] !== "\n") errorLetter = d[i];
            else errorLetter = "enter";
            break;
        }
    }
    if(d != "" && getCookie()["token"] != "" && check && d.length >= 30) addTextToDB(d);
    else if(!check && d.length > 0) massage("Найден символ, которого нет в русской и английской расскладке клавиатуры: " + errorLetter, false)
    else if(d === "") massage("Введите текст", false)
    else if(d.length < 30) massage("Текст должен быть больше или равен 30 символам", false)
    else massage("Войдите в систему, чтобы добавлть тексты", false)
}

function addText2( resolt ){
    if( resolt !== false ){
        text.push(jq("#addTextBox").val());
        let block = jq("<div/>");
        let lengthText = jq("<div/>");
        let textBlock = jq("<div/>");
        lengthText.text(jq("#addTextBox").val().length + " символов")
        lengthText.attr("class", "length-text");
        textBlock.attr("class", "textBlock");
        textBlock.text(jq("#addTextBox").val());
        block.attr("class", "list-text").attr("textId", resolt);
        jq("#globalTexts").append(block);
        block.append(textBlock, lengthText);
        let i = text.length - 1;
        block.click(() => changeText(textBlock, i));
        massage("Текст успешно добавлен", true)
        jq("#addTextBox").val("");
        jq("#addText").css("display", "none");
        jq("#help-list-text").remove();
        jq("#globalTexts").append(jq("<div/>").attr("id", "help-list-text").css("height", jq(".list-text").eq(0).height() + 40 + "px"));
    }
}

function randomText(){
    var rand = Math.floor(Math.random() * (text.length  - 0) + 0);
    if(text.length > 1) while(rand == activeTextNumber) rand = Math.floor(Math.random() * (text.length  - 0) + 0);
    changeText(jq(".textBlock").eq(rand), rand);
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
    let data;
    
    jq(".list-text").eq(activeTextNumber).css("background", "transparent");
    jq(".list-text").eq(i).css("background", "#0289d16e");
    activeTextNumber = i;
    activeText = block.text();
    jq(".text").empty();
    createText();
    againClick();

    data = {
        'event' : 'get score',
        'token' : getCookie()[ 'token' ],
        'textId' : jq(".list-text").eq(activeTextNumber).attr( "textId" )
    };
    sendRequest( "POST", URL, data, ( r ) => {
        if( r[ "event" ] === "error" ) bestScore = 0;
        else bestScore = r[ "message" ];
    } );
}

function lineClick(id){
    jq(id).css("display", "block");
    userClick();
}

function userClick(){
    if(!user){
        jq(".user-block").css("display", "block");
        user = true;
    }
    else{
        jq(".user-block").css("display", "none");
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

        if(keyNumber > bestScore) bestScore = keyNumber;
        jq('.total').html("Ваши баллы: " + keyNumber + " очков" + checkRecord(bestScore) + "<br><br>Скорость печати: " + keySpeed + " символов в минуту"+ "<br><br>Количество ошибок: " + mistake);
        jq('#enterTextBox').attr('disabled','disabled');
        jq(".progress-line-process").css("left", keyNumber >= 400 ? 100 + "%" : 100 / 400 * keyNumber + "%");
        jq(".progress-line").css("display", "block");
        setScore(keyNumber, keySpeed);
    }
}

function setScore( score , speed){
    let textId = parseInt(jq(".list-text").eq(activeTextNumber).attr("textId")), data;

    data = {
        "event": "set score",
        "token": getCookie()["token"],
        "textId": textId,
        "score": score
    };
    sendRequest("POST", URL, data, ( r ) => {
        if( r[ "event" ] === "success" ) bestScore = score;
    } );
}

function checkRecord(score){
    if(isLogged()) return "<br><br>Ваш рекорд: " + score + " очков";
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