//TODO генерация на экране
//TODO рандомное движение
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
 =============================================================================
 */

function Background (context, canvasWidth, canvasHeight) {
    this.context = context;
    this.width = canvasWidth;
    this.height = canvasHeight;
}
Background.prototype.draw = function () {
    var context = this.context;
    context.beginPath();
    context.fillStyle = "black";
    context.fillRect(0, 0, this.width , this.height);
    context.closePath();
};
Background.prototype.tick = function () {
    this.draw();
    requestAnimationFrame( this.tick.bind(this) );
};

function CollectionBackgroundItem() {

}
CollectionBackgroundItem.prototype.tick = function () {

};
CollectionBackgroundItem.prototype.draw = function () {

};

function BackgroundItem() {
    /*
    var collectionImages = [

    ];
    this.position = {
        x:,
        y:
    };
    this.velocity = {
        x:,
        y:
    };
    this.radVelocity = {

    };
    this.src = ;
    */
}
BackgroundItem.prototype.tick = function () {

};

/*
 var gameSize = {
 x: ,
 y: ,
 };
 var coef = 1;
 */
var background = new Background( canvas.getContext('2d'), canvas.width, canvas.height );
requestAnimationFrame( background.tick.bind(background) );




