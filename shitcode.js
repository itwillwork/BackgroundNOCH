//TODO масштабирование
/*
 =============================================================================
 Данные для отладки
 =============================================================================
 */
var canvas = document.getElementById("backgroundLayer");
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

var gameSize = {
    x: canvas.width,
    y: canvas.height
};
var stage = new createjs.Stage(canvas);
var playerPosition = {
    x: 5250,
    y: 3400
};
var coefScale = 1;
//эмуляция ресайза
setTimeout(function () {
    coefScale =  0.25;
    /*
    setInterval(function () {
        if (coefScale > 0.25) {
            coefScale -= 0.05;
        }
    }, 27);
    */
},1000);
/*
 =============================================================================
 */

function Background(stage) {
    this.stage = stage;
    this.collectionBackgroundItem = new CollectionBackgroundItem();
    this.prevPlayerPosition = {
        x: playerPosition.x,
        y: playerPosition.y
    };
    this.prevCoefScale = coefScale;
}
Background.prototype.clear = function () {
    this.stage.removeAllChildren();
    this.stage.update();
};
Background.prototype.update = function () {
    this.stage.update();
};
Background.prototype.tick = function () {
    // TODO удалить
    // Данные для отладки, чтобы игрок двигался
    // дергается потому что рандом, скорость каждый раз изменяется
    /*
    //random mode
    playerPosition.x += Math.random();
    playerPosition.y += Math.random();
    */

    //slowmode
    playerPosition.x += 0.5;
    playerPosition.y -= 0.5;

    /*
    //fast mode
    playerPosition.x += 5;
    playerPosition.y += 5;
    */

    var deltaPlayerPosition = {
            x: playerPosition.x - this.prevPlayerPosition.x,
            y: playerPosition.y - this.prevPlayerPosition.y
        },
        deltaCoefScale =  this.prevCoefScale - coefScale;
    this.clear();
    this.collectionBackgroundItem.tick(this.stage, deltaPlayerPosition, deltaCoefScale);
    this.update();
    this.prevPlayerPosition = {
        x: playerPosition.x,
        y: playerPosition.y
    };
    this.prevCoefScale = coefScale;
    requestAnimationFrame( this.tick.bind(this) );
};

function CollectionBackgroundItem() {
    this.collectionOfLevels = [ [], [], [], [] ];
    this.densityOfLevel = [60000, 100000, 240000, 130000];
    this.coefForMovie = [1, 0.5, 0.1, 0.01];
    this.filling(playerPosition.x - gameSize.x, playerPosition.y - gameSize.y,
        playerPosition.x + gameSize.x, playerPosition.y + gameSize.y);
}
CollectionBackgroundItem.prototype.filling = function (minX, minY, maxX, maxY) {
    console.log(minX, minY, maxX, maxY);
    var baseCatalog = "images/",
        collectionOfImages = [
            {
                prefix: "1layer/",
                count: 30
            },{
                prefix: "2layer/",
                count: 35
            },{
                prefix: "3layer/q",
                count: 30
            },{
                prefix: "clouds/",
                count: 29
            }
        ];
    for (var i = this.collectionOfLevels.length - 1; i >= 0 ; i--) {
        //потому что нужно захватить еще и не отображаемые поля
        var count = Math.floor((maxX - minX) * (maxY - minY) / (this.densityOfLevel[i] * coefScale)),
            oldLengthCollection = this.collectionOfLevels[i].length;
        console.log(count);
        while (this.collectionOfLevels[i].length < count + oldLengthCollection) {
            //пришлось манипулировать с единицами так, как номера картинок начинаются с 1, а не с 0
            var randomIndexImage  = Math.floor( Math.random() * (collectionOfImages[i].count - 1) + 1),
                randomImageSrc = baseCatalog + collectionOfImages[i].prefix + randomIndexImage + ".png",
                randomPosition = {
                    x: Math.floor(Math.random() * (maxX - minX)) + minX, //Math.floor( Math.random() * (maxX - minX) + minX),
                    y: Math.floor(Math.random() * (maxY - minY)) + minY //Math.floor( Math.random() * (maxY - minY) + minY)
                };
            this.collectionOfLevels[i].push( new BackgroundItem(randomPosition, randomImageSrc, this.coefForMovie[i]) );
            //console.log(randomPosition);
        }
    }
    console.log();
};
CollectionBackgroundItem.prototype.tick = function (stage, deltaPlayerPosition, deltaCoefScale) {
    if (deltaCoefScale) {
        this.zoomGame(deltaCoefScale);
    }
    for (var i = 0; i < this.collectionOfLevels.length; i++) {
        for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
            this.holdIfGetOut( this.collectionOfLevels[i][j] );
            if (deltaPlayerPosition) {
                this.collectionOfLevels[i][j].tick(deltaPlayerPosition);
            }
            this.collectionOfLevels[i][j].draw(stage);
        }
    }
};
CollectionBackgroundItem.prototype.holdIfGetOut = function ( nodeBackground ) {
    if (nodeBackground.position.x <= playerPosition.x - gameSize.x) {
        nodeBackground.position.x += 2 * gameSize.x;
    }
    if (nodeBackground.position.x >= playerPosition.x + gameSize.x) {
        nodeBackground.position.x -= 2 * gameSize.x;
    }
    if (nodeBackground.position.y <= playerPosition.y - gameSize.y) {
        nodeBackground.position.y +=  2 * gameSize.y;
    }
    if (nodeBackground.position.y >= playerPosition.y + gameSize.y) {
        nodeBackground.position.y -=  2 * gameSize.y;
    }
};
CollectionBackgroundItem.prototype.zoomGame = function (deltaCoefScale) {
    if (deltaCoefScale > 0) {
        //уменьшение
        for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                var newPosition = {
                    x: ((this.collectionOfLevels[i][j].position.x - playerPosition.x) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.x,
                    y: ((this.collectionOfLevels[i][j].position.y - playerPosition.y) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.y,
                };
                this.collectionOfLevels[i][j].position = newPosition;
            }
        }
        var newMinX = playerPosition.x - gameSize.x,
            newMinY = playerPosition.y - gameSize.y,
            newMaxX = playerPosition.x + gameSize.x,
            newMaxY = playerPosition.y + gameSize.y,


            oldMinX = (((playerPosition.x - gameSize.x) - playerPosition.x) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.x,
            oldMinY = (((playerPosition.y - gameSize.y) - playerPosition.y) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.y,
            oldMaxX = (((playerPosition.x + gameSize.x) - playerPosition.x) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.x,
            oldMaxY = (((playerPosition.y + gameSize.y) - playerPosition.y) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.y;
        /*
        console.log(newMinX, newMinY, newMaxX, newMaxY);
        console.log(oldMinX, oldMinY, oldMaxX, oldMaxY);
        console.log("======")
        console.log(newMinX, oldMinY, oldMinX, oldMaxY);
        console.log(newMinX, oldMaxY, newMaxX, newMaxY);
        console.log(newMinX, newMinY, newMaxX, oldMinY);
        console.log(oldMaxX, oldMinY, newMaxX, oldMaxY);
        */
        this.filling(newMinX, oldMinY, oldMinX, oldMaxY);
        this.filling(newMinX, oldMaxY, newMaxX, newMaxY);
        this.filling(newMinX, newMinY, newMaxX, oldMinY);
        this.filling(oldMaxX, oldMinY, newMaxX, oldMaxY);
    } else {

    }
};
function BackgroundItem(position, src, coefForMove) {
    var MAX_VELOCITY = 0.3,
        MAX_RAD_VELOCITY = 0.5,
        image;
    this.position = position;
    this.velocity = {
        //не округляется потому, что скорости слишком малы < 1
        x: Math.random() * (2 * MAX_VELOCITY) - MAX_VELOCITY,
        y: Math.random() * (2 * MAX_VELOCITY) - MAX_VELOCITY
    };
    this.angle = Math.random() * (2 * MAX_RAD_VELOCITY) - MAX_RAD_VELOCITY;
    this.radVelocity = Math.random() * (2 * MAX_RAD_VELOCITY) - MAX_RAD_VELOCITY;
    this.coefForMove = coefForMove;
    image = new Image();
    image.src = src;
    this.bitmap = new createjs.Bitmap(image);
}
BackgroundItem.prototype.selfMovie = function () {
    this.position.x += this.coefForMove  * this.velocity.x;
    this.position.y += this.coefForMove * this.velocity.y;
    this.angle += this.coefForMove * this.radVelocity;
};
BackgroundItem.prototype.playerMovie = function (deltaPlayerPosition) {
    this.position.x -= this.coefForMove * deltaPlayerPosition.x;
    this.position.y -= this.coefForMove * deltaPlayerPosition.y;
};
BackgroundItem.prototype.tick = function (deltaPlayerPosition) {
    this.selfMovie();
    this.playerMovie(deltaPlayerPosition);
};
BackgroundItem.prototype.isVisible = function (positionOnCanvas) {
    //за правой или нижней границей
    if (((positionOnCanvas.x - this.bitmap.width) >= gameSize.x) || ((positionOnCanvas.y - this.bitmap.height) >= gameSize.y)) {
        return false;
    }
    //за верхней или левой границей
    if (((positionOnCanvas.x + this.bitmap.width) <= 0) || ((positionOnCanvas.y + this.bitmap.height) <= 0)) {
        return false;
    }
    return true;
};
BackgroundItem.prototype.draw = function (context) {
    var positionOnCanvas = {
            x: this.position.x - (playerPosition.x - gameSize.x / 2),
            y: this.position.y - (playerPosition.y - gameSize.y / 2)
        },
        bitmap;
    //если объект не виден на экране не рисуем его
    if (!this.isVisible(positionOnCanvas)) return;
    bitmap = this.bitmap;
    bitmap.x = positionOnCanvas.x;
    bitmap.y = positionOnCanvas.y;
    bitmap.rotation = this.angle;
    bitmap.scaleX = coefScale;
    bitmap.scaleY = coefScale;
    context.addChild(bitmap);
};

var background = new Background(stage);
requestAnimationFrame( background.tick.bind(background) );






