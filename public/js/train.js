var jq = jQuery.noConflict();
var text = "Давай проверим твою скорость печати";
var activebutton = 0;
var truebutton = true;
var falsebutton;
var start = false;
var interval, time = 0, mistake = 0;
var left = 0, size, prevActiveKey, keyLayout = "";
var user = false;

jq(document).ready(() => {
    for(var i = 0; i < text.length; i++){
        var letter = jq("<span/>");
        letter.text(text[i]);
        letter.attr("class", "letter");
        jq(".text").append(letter);
    }
    jq("#textbox").attr("spellcheck", "false").focus();
    jq("#again").click(() => againClick());
    jq(".user").click(() => userClick());
    jq(".exit").click(() => jq(".register-bigBlock").css("display", "none"));
    jq(".regLine").click(() => jq(".register-bigBlock").css("display", "block"))
    jq(".letter").css("transition", "0.2s");
    jq(document).on("input", "#textbox", () => test());
    jq(document).keyup(function(e) { if (e.key === "Escape" && start) againClick()});
    jq(".progress-line").css("display", "none");
    jq("#again").css("display", "none");
    seeKey()
});

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
    var textInArea = jq("#textbox").val();
    if(!start){
        interval = setInterval(() => time += 0.1, 100);
        start = true;
        jq("#again").css("display", "block");
        jq(".help").css("opacity", "0");
    }
    if(textInArea.length > activebutton){
        if(activebutton >= 15 && activebutton <= text.length - 15){
            left-= jq(".helptext").text(text).width() / text.length;
            jq(".text").css("transform", "translateX(" + left + "px)")
        }
        if(truebutton){
            if(textInArea[activebutton] == text[activebutton]){
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
            if(activebutton < text.length) seeKey();
        }
        else{
            jq(".letter").eq(activebutton).css("color", "#f44336");
            activebutton++;
        } 
    }
    else{
        activebutton--
        if(activebutton >= 15 && activebutton <= text.length - 15){
            left+= jq(".helptext").text(text).width() / text.length;
            jq(".text").css("transform", "translateX(" + left + "px)")
        }
        jq(".letter").eq(activebutton).css("color", "black");
        if(activebutton == falsebutton) truebutton = true;
        seeKey();
    }
    if(textInArea.length == text.length && truebutton){
        clearInterval(interval);
        jq(".key").eq(prevActiveKey).removeClass("activeKey");
        removeShift()
        prevActiveKey = NaN;
        keyNumber = parseInt(text.length / time * 60)
        jq('#textbox').attr('disabled','disabled');
        jq('.total').html("Скорость печати: " + keyNumber + " символов в минуту<br>Количество ошибок: " + mistake);
        jq(".progress-line-process").css("left", keyNumber >= 400 ? 100 + "%" : 100 / 400 * keyNumber + "%");
        jq(".progress-line").css("display", "block");        
    }
}

function againClick(){
    clearInterval(interval);
    var key = jq(".key");
    jq("#textbox").val("").attr("disabled", false).focus();
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
    var textUpper = text.toUpperCase();
    var letterCode = ["A".charCodeAt(0), "Z".charCodeAt(0), "А".charCodeAt(0), "Я".charCodeAt(0)]
    if(findLetter() && activebutton != 0){
        if(text.toUpperCase().charCodeAt(activebutton) >= letterCode[0] && text.toUpperCase().charCodeAt(activebutton) <= letterCode[1]) keyLayout = "eng";
        else keyLayout = "rus";
    }
    else if(activebutton == 0){
        for(var i = 0; i < text.length; i++){
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
            if(text[activebutton] === text[activebutton].toUpperCase()){
                for(var i = 0; i < key.length; i++){
                    var s = false;
                    for(var j = 0; j < key.eq(i).text().length; j++){
                        if(key.eq(i).text()[j].toUpperCase() == text[activebutton].toUpperCase()){
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
        switch(text[activebutton]){
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
                    if(key.eq(i).text()[j].toUpperCase() == text[activebutton].toUpperCase()){
                        key.eq(i).addClass("activeKey");
                        if(!findLetter()){
                            var simbol1 = "-=\\'", simbol2 = "!@#№$%^&*()_+|<>", exit = false;;
                            for(var k = 0; k < simbol1.length; k++){
                                if(text[activebutton] == simbol1[k]){
                                    removeShift()
                                    exit = true;
                                    break;
                                } 
                            }
                            if(!exit){
                                for(var k = 0; k < simbol2.length; k++){
                                    if(text[activebutton] == simbol2[k]){
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
        if(text[activebutton] == " "){
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
    var textUpper = text.toUpperCase();
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