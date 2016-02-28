//TODO движение за позицией игрока
//TODO масштабирование
//TODO оптимизация
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
/*
 var coef = 1;
 */
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
    this.collectionOfLevel = [ [], [], [], [] ];
    this.densityOfLevel = [50, 300, 500, 600];
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
    for (var i = 0; i < this.collectionOfLevel.length; i++) {
        //2 * gameSize.x потому что нужно захватить еще и не отображаемые поля
        var count = 2 * gameSize.x / this.densityOfLevel[i];
        while (this.collectionOfLevel[i].length < count) {
            //пришлось манипулировать с единицами так, как номера картинок начинаются с 1, а не с 0
            var randomIndexImage  = Math.floor( Math.random() * (collectionOfImages[i].count - 1) + 1),
                randomImageSrc = baseCatalog + collectionOfImages[i].prefix + randomIndexImage + ".png";
            this.collectionOfLevel[i].push( new BackgroundItem(randomImageSrc, this.coefForMovie[i]) );
        }
    }
}
CollectionBackgroundItem.prototype.tick = function (stage, deltaPlayerPosition) {
    for (var i = 0; i < this.collectionOfLevel.length; i++) {
        for (var j = 0; j < this.collectionOfLevel[i].length; j++) {
            this.holdIfGetOut( this.collectionOfLevel[i][j] );
            this.collectionOfLevel[i][j].tick(deltaPlayerPosition);
            this.collectionOfLevel[i][j].draw(stage);
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
        MAX_RAD_VELOCITY = 0.5;
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
    this.src = src;
    this.coefForMove = coefForMove;
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
    var image = new Image();
    image.src = this.src;
    var bitmap = new createjs.Bitmap(image);
    bitmap.x = this.position.x - (playerPosition.x - gameSize.x / 2);
    bitmap.y = this.position.y - (playerPosition.y - gameSize.y / 2);
    bitmap.rotation = this.angle;
    context.addChild(bitmap);
};
var background = new Background(stage);
requestAnimationFrame( background.tick.bind(background) );






