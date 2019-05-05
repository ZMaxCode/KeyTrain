var jq = jQuery.noConflict();
let text = ["Я сасал меня ебали", "Кек лол арбидол", "Тони Старк умрет в конце", "Проверка связи", "Саня хуй саси"];
var activebutton = 0;
var activeTextNumber = 0, activeText = text[0];
var truebutton = true;
var falsebutton;
var start = false;
var interval, time = 0, mistake = 0;
var left = 0, size, prevActiveKey, keyLayout = "";
var user = false;

jq(document).ready(() => {
    createText();
    for(let i = 0; i < text.length; i++){
        let block = jq("<div/>");
        block.text(text[i]);
        block.attr("class", "list-text");
        jq(".list-text-block").append(block);
        block.click(() => changeText(block, i));
    }
    jq(".list-text").eq(0).css("background", "#0289d16e");
    jq("#enterTextBox").attr("spellcheck", "false").focus();
    jq("#again").click(() => againClick());
    jq(".user").click(() => userClick());
    jq(".exit").click(() => jq(".bigBlock").css("display", "none"));
    jq(".regLine").click(() => lineClick("#reg"))
    jq(".logInLine").click(() => lineClick("#logIn"))
    jq("#addTextButton").click(() => jq("#addText").css("display", "block"))
    jq("#leaderButton").click(() => jq("#leaderboard").css("display", "block"))
    jq("#rendom-text").click(() => randomText())
    jq("#addAndUpdateText").click(() => addText());
    jq(".letter").css("transition", "0.2s");
    jq(document).on("input", "#enterTextBox", () => test());
    jq(document).keyup(function(e) { if (e.key === "Escape" && start) againClick()});
    jq(".progress-line").css("display", "none");
    jq("#again").css("display", "none");
    seeKey()
});

function addText(){
    if(jq("#addTextBox").val() != ""){
        text.push(jq("#addTextBox").val());
        let block = jq("<div/>");
        block.text(jq("#addTextBox").val());
        block.attr("class", "list-text");
        jq(".list-text-block").append(block);
        let i = text.length - 1;
        block.click(() => changeText(block, i));
        jq("#addTextBox").val("");
        jq("#addText").css("display", "none");
    }
}

function randomText(){
    var rand = Math.floor(Math.random() * (text.length  - 0) + 0);
    while(rand == activeTextNumber) rand = Math.floor(Math.random() * (text.length  - 0) + 0);
    changeText(jq(".list-text").eq(rand), rand);
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
    jq(".list-text").eq(activeTextNumber).css("background", "transparent");
    block.css("background", "#0289d16e");
    activeTextNumber = i;
    activeText = block.text();
    jq(".text").empty();
    createText();
    againClick();
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

function test(){
    var textInArea = jq("#enterTextBox").val();
    if(!start){
        interval = setInterval(() => time += 0.1, 100);
        start = true;
        jq("#again").css("display", "block");
        jq(".help").css("opacity", "0");
    }
    if(textInArea.length > activebutton){
        if(activebutton >= 15 && activebutton <= activeText.length - 15){
            left-= jq(".helptext").text(activeText).width() / activeText.length;
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
            left+= jq(".helptext").text(text).width() / activeText.length;
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
        keyNumber = parseInt(activeText.length / time * 60)
        jq('#enterTextBox').attr('disabled','disabled');
        jq('.total').html("Скорость печати: " + keyNumber + " символов в минуту<br>Количество ошибок: " + mistake);
        jq(".progress-line-process").css("left", keyNumber >= 400 ? 100 + "%" : 100 / 400 * keyNumber + "%");
        jq(".progress-line").css("display", "block");        
    }
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