//TODO движение за позицией игрока
//TODO масштабирование

/*
 =============================================================================
 Данные для отладки
 =============================================================================
 */
var canvas = document.getElementById("backgroundLayer");
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;
/*
 var gameSize = {
 x: ,
 y: ,
 };
 var coef = 1;
 */
/*
 =============================================================================
 */

function Background(canvas, canvasWidth, canvasHeight) {
    this.stage = new createjs.Stage(canvas);
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.collectionBackgroundItem = new CollectionBackgroundItem(canvasWidth, canvasHeight);
}
Background.prototype.clear = function () {
    this.stage.removeAllChildren();
    this.stage.update();
};
Background.prototype.update = function () {
    this.stage.update();
};
Background.prototype.tick = function () {
    this.clear();
    this.collectionBackgroundItem.tickAndDraw( this.stage );
    this.update();
    requestAnimationFrame( this.tick.bind(this) );
};

function CollectionBackgroundItem(width, height) {
    this.collectionOfLevel = [ [], [], [], [] ];
    this.densityOfLevel = [50, 300, 500, 600];
    this.coefForMovie = [1, 0.7, 0.4, 0.1];
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
        var count = width / this.densityOfLevel[i];
        while (this.collectionOfLevel[i].length < count) {
            var randomPosition = {
                    x: Math.floor( Math.random() * width ),
                    y: Math.floor( Math.random() * height )
                },
                //пришлось манипулировать с единицами так, как номера картинок начинаются с 1, а не с 0
                randomIndexImage  = Math.floor( Math.random() * (collectionOfImages[i].count - 1) + 1),
                randomImageSrc = baseCatalog + collectionOfImages[i].prefix + randomIndexImage + ".png";
            this.collectionOfLevel[i].push( new BackgroundItem(randomPosition, randomImageSrc, this.coefForMovie[i]) );
        }
    }
}
CollectionBackgroundItem.prototype.tickAndDraw = function (context) {
    for (var i = 0; i < this.collectionOfLevel.length; i++) {
        for (var j = 0; j < this.collectionOfLevel[i].length; j++) {
            this.collectionOfLevel[i][j].tick();
            this.collectionOfLevel[i][j].draw(context);
        }
    }
};

function BackgroundItem(pos, src, coefForMove) {
    var MAX_VELOCITY = 0.3,
        MAX_RAD_VELOCITY = 0.5;
    this.position = {
        x: pos.x,
        y: pos.y
    };
    this.velocity = {
        //не округляется потому, что скорости слишком малы < 1
        x: Math.random() * (2 * MAX_VELOCITY) - MAX_VELOCITY,
        y: Math.random() * (2 * MAX_VELOCITY) - MAX_VELOCITY
    };
    this.angle = Math.random() * (2 * MAX_RAD_VELOCITY) - MAX_RAD_VELOCITY;
    this.radVelocity =Math.random() * (2 * MAX_RAD_VELOCITY) - MAX_RAD_VELOCITY;
    this.src = src;
    this.coefForMove = coefForMove;
}
BackgroundItem.prototype.tick = function () {
    this.position.x += this.coefForMove  * this.velocity.x;
    this.position.y += this.coefForMove * this.velocity.y;
    this.angle += this.coefForMove * this.radVelocity;
};
BackgroundItem.prototype.draw = function (context) {
    var image = new Image();
    image.src = this.src;
    var bitmap = new createjs.Bitmap(image);
    bitmap.x = this.position.x;
    bitmap.y = this.position.y;
    bitmap.rotation = this.angle;
    context.addChild(bitmap);
};

var background = new Background( canvas, canvas.width, canvas.height );
requestAnimationFrame( background.tick.bind(background) );




