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
    x: 1250,
    y: 3400
};
var coefScale = 1;
//эмуляция ресайза
setTimeout(function () {
    setInterval(function () {
        if (coefScale < 2) {
            coefScale += 0.01;
        }
    }, 27);
},5000);
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
    playerPosition.y += 0.5;

    /*
    //fast mode
     playerPosition.x += 0.5;
     playerPosition.y += 0.5;
     */

    var deltaPlayerPosition = {
        x: playerPosition.x - this.prevPlayerPosition.x,
        y: playerPosition.y - this.prevPlayerPosition.y
    };
    this.clear();
    this.collectionBackgroundItem.tick(this.stage, deltaPlayerPosition);
    this.update();
    this.prevPlayerPosition = {
        x: playerPosition.x,
        y: playerPosition.y
    };
    requestAnimationFrame( this.tick.bind(this) );
};

function CollectionBackgroundItem() {
    this.collectionOfLevels = [ [], [], [], [] ];
    this.densityOfLevel = [90000, 90000, 120000, 240000];
    this.coefForMovie = [1, 0.8, 0.3, 0.1];
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
    for (var i = 0; i < this.collectionOfLevels.length; i++) {
        //2 * gameSize.x потому что нужно захватить еще и не отображаемые поля
        var count = (2 * gameSize.x) * (2 * gameSize.y) / this.densityOfLevel[i];
        while (this.collectionOfLevels[i].length < count) {
            //пришлось манипулировать с единицами так, как номера картинок начинаются с 1, а не с 0
            var randomIndexImage  = Math.floor( Math.random() * (collectionOfImages[i].count - 1) + 1),
                randomImageSrc = baseCatalog + collectionOfImages[i].prefix + randomIndexImage + ".png";
            this.collectionOfLevels[i].push( new BackgroundItem(randomImageSrc, this.coefForMovie[i]) );
        }
    }
}
CollectionBackgroundItem.prototype.tick = function (stage, deltaPlayerPosition) {
    for (var i = 0; i < this.collectionOfLevels.length; i++) {
        for (var j = 0; j < this.collectionOfLevels[i].length; j++) {
            this.holdIfGetOut( this.collectionOfLevels[i][j] );
            this.collectionOfLevels[i][j].tick(deltaPlayerPosition);
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

function BackgroundItem(src, coefForMove) {
    var MAX_VELOCITY = 0.3,
        MAX_RAD_VELOCITY = 0.5,
        image;
    this.position = {
        x: playerPosition.x + Math.floor( Math.random() * (2 * gameSize.x) - gameSize.x),
        y: playerPosition.y + Math.floor( Math.random() * (2 * gameSize.y) - gameSize.y)
    };
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
BackgroundItem.prototype.draw = function (context) {
    var bitmap = this.bitmap;
    bitmap.x = this.position.x - (playerPosition.x - gameSize.x / 2);
    bitmap.y = this.position.y - (playerPosition.y - gameSize.y / 2);
    bitmap.rotation = this.angle;
    bitmap.scaleX = 1/coefScale;
    bitmap.scaleY = 1/coefScale;
    context.addChild(bitmap);
};
var background = new Background(stage);
requestAnimationFrame( background.tick.bind(background) );






