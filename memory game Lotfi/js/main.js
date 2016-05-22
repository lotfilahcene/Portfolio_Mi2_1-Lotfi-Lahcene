"use strict";
$(function () {

    var config = {
        size     : { //Maat van de tafel w = cols , h = rows (vb: w:4 , h: 5 => 4x5 tafel )
            w: 4,
            h: 5
        },
        imagesArr: [ //Namen van de afbeeldingen - ze moeten geplaats worden onder de map images
            '1.jpg',
            '2.gif',
            '3.jpg',
            '4.jpg',
            '5.jpg',
            '6.jpg',
            '7.jpg',
            '8.jpg',
            '9.png',
            '10.jpg'
        ],
        sounds   : { //Namen van geluiden - moeten geplaats worden onder de map sounds
            click: 'click.mp3',
            end  : 'end.mp3'
        }
    };


    var $memory_game   = $(".memory-game");
    var randomImageArr = [];
    var isEersteKlik   = true;
    var laatsteImage;
    var laatsteCoords;
    var timer          = 1;
    var timerHandle;
    var startSpel    = false;
    var klikSound;
    var endSound;
    init();


    function init() {
        preLoadAssets();
        createBoard();
        placeImages();
        bind();
    }

    function reset() {
        $memory_game.html("");
        timer       = 1;
        startSpel = false;
        $(document).on("unbind", ".memory-game .cell:not(.solved, .eerste-klik)");
        $(".best-score-wrapper").fadeOut();
        init();

    }

     function bind() {
        $(document).on("click", ".memory-game .cell:not(.solved, .eerste-klik)", klikCell);
        $(document).on("click", ".play-again ", reset)
    }

    //Bord creeëren
    function createBoard() {
        var coord = 0;

        //Maak Rows
        for (var i = 0; i < config.size.h; i++) {
            var $row = $("<div>").addClass("row"); //Row div
            //Create Cells
            for (var j = 0; j < config.size.w; j++) {
                var $cell = $("<div>").addClass('cell'); //Cell
                $cell.attr("data-coords", coord);  
                $row.append($cell);  
                $cell.html('<div class="flipper"><div class="front"></div> <div class="back"></div></div>'); //Flip effect => https://davidwalsh.name/css-flip
                coord++;
            }
            $memory_game.append($row); //Append row voor memory-game div
        }
    }
// hier gaan we de verschillende afbeeldingen plaatsen
    function placeImages() {
        var imagesArr  = (config.imagesArr + "," + config.imagesArr).split(",");  // Hier gaan we de afbeeldingen dupliceren (elke foto's moeten 2keren worden getoond)

        randomImageArr = verplaatsArray(imagesArr); //verplaats de array voor een random plaatsing
    }

    //klik Event
    function klikCell() {

        //Play klik sound
        klikSound.currentTime = 0;
        klikSound.play();

       // Als er geen begin is dan wordt  de timer na de eerste klik gerunt
        if (!startSpel) {
            startSpel = true;
            startTimer();
        }

        var coords = $(this).attr("data-coords");  

        //If second image
        if (!isEersteKlik) {
            $(".memory-game .cell").removeClass("eerste-klik");
            //If last Image and current image match
            if (laatsteImage == randomImageArr[coords]) {
                $(this).addClass("solved");  
                $(".memory-game .cell[data-coords=" + laatsteCoords + "]").addClass("solved"); //And add class to previous clicked image (First Click) "solved"
            }
        } else { //If first image
            $(this).addClass("eerste-klik"); //Add class "eerste-klik"
            $(".memory-game .cell:not(.solved)").removeClass("active").find(".back").html(""); //beelden verwijderen uit alle onopgeloste divs ( dit is voor als de beelden niet worden gematched hide / remove ) en het verwijder ook de klasse met de naam "actieve"
        }

        $(this).addClass("active").find(".back").html("<img src='images/" + randomImageArr[coords] + "'>");  
        laatsteImage    = randomImageArr[coords]; //Onthoud de aangeklikte afbeelding om te checken of ze zullen worden matched of niet

        isEersteKlik = !isEersteKlik; //if first selected then next one must be second selected and vice-versa
        laatsteCoords   = coords; //Memorize the last clicked coordinate
        isCompleted(); 
    }

     function isCompleted() {
        $(".memory-game .cell:not(.solved)").length == 0 && complete();  
    }

    function complete() {
        endSound.play(); //Speel het geluid op het einde
        clearInterval(timerHandle); //Stop counter

        var bestScore = cookieFunctions.readCookie("e_memory_game"); //Lees vorige beste score van de cookie
        if (bestScore) { //Als vorige score bestaat
            if (parseFloat(bestScore) > timer) { //Controleer of de huidige of vorige score  de beste is
                cookieFunctions.createCookie("e_memory_game", timer); // Stel nieuwe score in de cookie
                bestScore = timer;
            }
        } else {
            bestScore = timer;
            cookieFunctions.createCookie("e_memory_game", timer); // Als vorige score nog niet bestaat creeer cookie en stel de huidige score als de beste

        }
        $(".current-score").html(timeFormat(timer));
        $(".best-score").html(timeFormat(bestScore));
        $(".best-score-wrapper").fadeIn();
    }

    function startTimer() {

        $(".timer").html(timeFormat(timer)); //Toon Timer

         timerHandle = setInterval(function () {
            timer += 1;
            $(".timer").html(timeFormat(timer)); //Toon Timer
        }, 1000);
    }

     function verplaatsArray(array) {
        return array;
        var arrayLength = array.length;
        var tempArray   = array;
        var resultArr   = [];
        var randomInd;

        for (var i = 0; i < arrayLength; i++) {
            randomInd = Math.floor(Math.random() * tempArray.length);
            resultArr.push(tempArray[randomInd]);
            tempArray.splice(randomInd, 1)
        }
        return resultArr;
    }

    function preLoadAssets() {

         $.each(config.imagesArr, function (k, v) {
            var img = new Image();
            img.src = "images/" + v;
        });

         klikSound = new Audio('sounds/' + config.sounds.click);
        endSound   = new Audio('sounds/' + config.sounds.end);
    }


    function timeFormat(time) {


        var min = Math.floor(time / 60);
        var sec = time % 60;

        sec = sec < 10 ? "0" + sec : sec;
        min = min < 10 ? "0" + min : min;
        return min + ":" + sec;
        //toon de timer in de volgende format: min + " min " + sec + " sec" : sec + " sec";

    }

     var cookieFunctions = {

         createCookie: function (name, value) {
            document.cookie = name + "=" + value + "; expires=Thu, 1 Dec 2020 16:06:57 GMT";
        },

         readCookie: function (name) {
            var returnVal = null;
            var cookies   = document.cookie.split(';');
            $.each(cookies, function (k, v) {
                var keyVal = v.split('=');
                if (keyVal[0] == name) {
                    returnVal = keyVal[1];
                }
            });
            return returnVal;
        },
    };

});
