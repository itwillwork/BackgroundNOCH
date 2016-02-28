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

var playerPosition = {
    x: 5250,
    y: 3400
};
//эмуляция ресайза

var coefScale = 1;
setTimeout(function () {
    setInterval(function () {
        if (coefScale > 0.25) {
            coefScale -= 0.05;
        }
    }, 27);
},1000);

/*
 var coefScale = 0.25;
 setTimeout(function () {
 setInterval(function () {
 if (coefScale < 1) {
 coefScale += 0.05;
 }
 }, 27);
 },1000);
 /*
 =============================================================================
 */


var Background = function () {
    this.collectionBackgroundItem = new CollectionBackgroundItem();
    this.prevPlayerPosition = {
        x: playerPosition.x,
        y: playerPosition.y
    };
    this.prevCoefScale = coefScale;
};
Background.prototype = {
    tick: function () {
        // TODO удалить
        // Данные для отладки, чтобы игрок двигался
        // дергается потому что рандом, скорость каждый раз изменяется

        //slowmode
        playerPosition.x += 0.5;
        playerPosition.y -= 0.5;

        var deltaPlayerPosition = {
                x: playerPosition.x - this.prevPlayerPosition.x,
                y: playerPosition.y - this.prevPlayerPosition.y
            },
            deltaCoefScale =  this.prevCoefScale - coefScale;
        //drawManager.clearScreen();
        this.collectionBackgroundItem.tick(deltaPlayerPosition, deltaCoefScale);
        //drawManager.updateScreen();
        this.prevPlayerPosition = {
            x: playerPosition.x,
            y: playerPosition.y
        };
        this.prevCoefScale = coefScale;
        requestAnimationFrame( this.tick.bind(this) );
    }
};

var CollectionBackgroundItem = function () {
    this.collectionOfLevels = [ [], [], [], [] ];
    this.densityOfLevel = [60000, 100000, 240000, 130000];
    this.coefForMovie = [1, 0.5, 0.1, 0.01];
    this.fillingArea(playerPosition.x - gameSize.x, playerPosition.y - gameSize.y,
        playerPosition.x + gameSize.x, playerPosition.y + gameSize.y);
};
CollectionBackgroundItem.prototype = {
    //constructor: CollectionBackgroundItem,
    fillingArea: function (minX, minY, maxX, maxY) {
        var baseCatalog = "images/",
            collectionOfImages = [
                {
                    prefix: "1layer/",
                    count: 30
                }, {
                    prefix: "2layer/",
                    count: 35
                }, {
                    prefix: "3layer/q",
                    count: 30
                }, {
                    prefix: "clouds/",
                    count: 29
                }
            ];
        for (var i = this.collectionOfLevels.length - 1; i >= 0; i--) {
            //потому что нужно захватить еще и не отображаемые поля
            var count = Math.floor((maxX - minX) * (maxY - minY) / (this.densityOfLevel[i] * coefScale)),
                oldLengthCollection = this.collectionOfLevels[i].length;
            while (this.collectionOfLevels[i].length < count + oldLengthCollection) {
                //пришлось манипулировать с единицами так, как номера картинок начинаются с 1, а не с 0
                var randomIndexImage = Math.floor(Math.random() * (collectionOfImages[i].count - 1) + 1),
                    randomImageSrc = baseCatalog + collectionOfImages[i].prefix + randomIndexImage + ".png",
                    randomPosition = {
                        x: Math.floor(Math.random() * (maxX - minX)) + minX,
                        y: Math.floor(Math.random() * (maxY - minY)) + minY
                    };
                this.collectionOfLevels[i].push(new BackgroundItem(randomPosition, randomImageSrc, this.coefForMovie[i]));
            }
        }
    },
    tick: function (deltaPlayerPosition, deltaCoefScale) {
        if (deltaCoefScale) {
            this.zoomGame(deltaCoefScale);
        }
        for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                this.holdIfGetOut(this.collectionOfLevels[i][j]);
                if (deltaPlayerPosition) {
                    this.collectionOfLevels[i][j].tick(deltaPlayerPosition);
                }
                //drawManager.drawBackgroundItem(this.collectionOfLevels[i][j]);
            }
        }
    },
    holdIfGetOut: function (itemBackground) {
        if (itemBackground.position.x <= playerPosition.x - gameSize.x) {
            itemBackground.position.x += 2 * gameSize.x;
        }
        if (itemBackground.position.x >= playerPosition.x + gameSize.x) {
            itemBackground.position.x -= 2 * gameSize.x;
        }
        if (itemBackground.position.y <= playerPosition.y - gameSize.y) {
            itemBackground.position.y += 2 * gameSize.y;
        }
        if (itemBackground.position.y >= playerPosition.y + gameSize.y) {
            itemBackground.position.y -= 2 * gameSize.y;
        }
    },
    zoomGame: function (deltaCoefScale) {
        for (var i = 0; i < this.collectionOfLevels.length; i++) {
            for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                var newPosition = {
                    x: ((this.collectionOfLevels[i][j].position.x - playerPosition.x) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.x,
                    y: ((this.collectionOfLevels[i][j].position.y - playerPosition.y) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.y,
                };
                this.collectionOfLevels[i][j].position = newPosition;
            }
        }
        if (deltaCoefScale > 0) {
            //уменьшение
            var newMinX = playerPosition.x - gameSize.x,
                newMinY = playerPosition.y - gameSize.y,
                newMaxX = playerPosition.x + gameSize.x,
                newMaxY = playerPosition.y + gameSize.y,
                oldMinX = (((playerPosition.x - gameSize.x) - playerPosition.x) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.x,
                oldMinY = (((playerPosition.y - gameSize.y) - playerPosition.y) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.y,
                oldMaxX = (((playerPosition.x + gameSize.x) - playerPosition.x) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.x,
                oldMaxY = (((playerPosition.y + gameSize.y) - playerPosition.y) / (deltaCoefScale + coefScale)) * coefScale + playerPosition.y;
            this.fillingArea(newMinX, oldMinY, oldMinX, oldMaxY);
            this.fillingArea(newMinX, oldMaxY, newMaxX, newMaxY);
            this.fillingArea(newMinX, newMinY, newMaxX, oldMinY);
            this.fillingArea(oldMaxX, oldMinY, newMaxX, oldMaxY);
        } else {
            //уменьшение
            for (var i = 0; i < this.collectionOfLevels.length; i++) {
                for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
                    var itemBackground = this.collectionOfLevels[i][j];
                    if ((itemBackground.position.x <= playerPosition.x - gameSize.x)
                        || (itemBackground.position.x >= playerPosition.x + gameSize.x)
                        || (itemBackground.position.y <= playerPosition.y - gameSize.y)
                        || (itemBackground.position.y >= playerPosition.y + gameSize.y)) {
                        this.deleteNode(i, j);
                    }
                }
            }
        }
    },
    deleteNode: function (layerIndex, itemIndex) {
        if (itemIndex < 0) return;
        this.collectionOfLevels[layerIndex].splice(itemIndex, 1);
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
    this.src = src;
}
BackgroundItem.prototype = {
    constructor: BackgroundItem,
    selfMovie: function () {
        this.position.x += this.coefForMove * this.velocity.x;
        this.position.y += this.coefForMove * this.velocity.y;
        this.angle += this.coefForMove * this.radVelocity;
    },
    playerMovie: function (deltaPlayerPosition) {
        this.position.x -= this.coefForMove * deltaPlayerPosition.x;
        this.position.y -= this.coefForMove * deltaPlayerPosition.y;
    },
    tick: function (deltaPlayerPosition) {
        this.selfMovie();
        this.playerMovie(deltaPlayerPosition);
    }
};

function DrawManager(idObjectForDrawing) {
    this.stage = new createjs.Stage( document.getElementById(idObjectForDrawing) );
}
DrawManager.prototype = {
    constructor: DrawManager,
    drawBackgroundItem: function (itemBackground) {
        var positionOnCanvas = {
                x: itemBackground.position.x - (playerPosition.x - gameSize.x / 2),
                y: itemBackground.position.y - (playerPosition.y - gameSize.y / 2)
            },
            bitmap;

        //если объект не виден на экране не рисуем его
        if (!this.isVisible(positionOnCanvas)) return;

        image = new Image();
        image.src = itemBackground.src;
        bitmap = new createjs.Bitmap(image);
        bitmap.x = positionOnCanvas.x;
        bitmap.y = positionOnCanvas.y;
        bitmap.rotation = itemBackground.angle;
        bitmap.scaleX = coefScale;
        bitmap.scaleY = coefScale;
        this.stage.addChild(bitmap);
    },
    isVisible: function (positionOnCanvas) {
        //TODO разобраться с оптимизацией, не получлось вернуть размер картинки, а то рисуются все картинки даже которые не попадают в канвас
        /*
         //за правой или нижней границей
         if (((positionOnCanvas.x - this.bitmap.width) >= gameSize.x) || ((positionOnCanvas.y - this.bitmap.height) >= gameSize.y)) {
         return false;
         }
         //за верхней или левой границей
         if (((positionOnCanvas.x + this.bitmap.width) <= 0) || ((positionOnCanvas.y + this.bitmap.height) <= 0)) {
         return false;
         }
         */
        return true;
    },
    clearScreen: function () {
        this.stage.removeAllChildren();
    },
    updateScreen: function () {
        this.stage.update();
    }
};

//var drawManager = new DrawManager("backgroundLayer");
var background = new Background();
requestAnimationFrame( background.tick.bind(background) );