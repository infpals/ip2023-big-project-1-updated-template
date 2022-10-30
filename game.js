const SETTINGS = {
    winScore: 7,

    smallFont: "10px retro",
    largeFont: "14px retro",
    scoreboardColour: "black",

    buttonColour: "white",
    buttonTextColour: "black",

    paddleSound: '/Sounds/Paddle.wav',
    wallSound: '/Sounds/Wall.wav',
    scoreSound: '/Sounds/Score.wav',

    fps: 60,
    courtColour: "black",
    wallColour: "white",
    wallSize: 20,
    courtMarginX: 12,
    courtMarginY: 4,

    width: innerWidth,
    height: innerHeight,

    paddleColour: "white",
    paddleWidth: 12,
    paddleHeight: 48,
}

const PLAYERS = {
    playerOne: 1,
    playerTwo: 2
}

class Game {

    constructor(canvas) {
        this.canvas = canvas;
        this.court = new Court(canvas);
    }

    start() {
        let that = this;
        let previousTime = Date.now();

        setInterval(function() {

            let now = Date.now()
            let dT = (now - previousTime) / 1000.0

            that.draw()

            previousTime = now

        }, 1/SETTINGS.FPS * 1000)
    }

    draw() {
        let ctx = this.canvas.getContext("2d")
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.court.draw(this.canvas)
    }
    
}

class ScoreBoard {

}

class Paddle {
    constructor(x, y, width, height, player, court) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.player = player
        this.court = court
        this.startX = x
        this.startY = y
    }

    draw(canvas){
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = SETTINGS.paddleColour
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

class PaddleController {
    
}

class AIController {
    
}

class Court {
    constructor(canvas) {
        this.canvas = canvas
        
        this.leftPaddle = new Paddle(
            SETTINGS.paddleWidth,
            canvas.height / 2 - SETTINGS.paddleHeight / 2,
            SETTINGS.paddleWidth,
            SETTINGS.paddleHeight,
            PLAYERS.playerOne,
            this
        )

        this.rightPaddle = new Paddle(
            canvas.width - 2 * SETTINGS.paddleWidth,
            canvas.height / 2 - SETTINGS.paddleHeight / 2,
            SETTINGS.paddleWidth,
            SETTINGS.paddleHeight,
            PLAYERS.playerTwo,
            this
        )

        this.ball = new Ball(canvas.width/2, canvas.height/2, 10, this)
    }

    draw(canvas) {
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = SETTINGS.courtColour
        ctx.fillRect(0, 0, SETTINGS.width, SETTINGS.height)

        ctx.fillStyle = SETTINGS.wallColour
        // Draw upper wall
        ctx.fillRect(0, SETTINGS.courtMarginY, this.canvas.width, SETTINGS.wallSize)
        // Draw lower wall
        ctx.fillRect(0, this.canvas.height - SETTINGS.courtMarginY - SETTINGS.wallSize, this.canvas.width, SETTINGS.wallSize)

        // Dashed Center Line
        ctx.setLineDash([40]);
        ctx.beginPath();
        ctx.moveTo(SETTINGS.width/2, SETTINGS.courtMarginY);
        ctx.lineTo(SETTINGS.width/2, SETTINGS.height - SETTINGS.courtMarginY);
        ctx.strokeStyle = SETTINGS.wallColour;
        ctx.stroke();

        this.leftPaddle.draw(canvas)
        this.rightPaddle.draw(canvas)

        this.ball.draw(canvas)
    }
}

class Ball {
    constructor (x, y, radius, court) {
        this.x = x
        this.y = y
        this.radius = radius
        this.court = court
    }

    draw(canvas){
        let ctx = canvas.getContext("2d")

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI)
        ctx.fillStyle = "white"
        ctx.fill()
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get left() {return this.x}
    get right() {return this.x + this.width}
    get top() {return this.y}
    get bottom() {return this.y + this.height}

    overlaps(other) {
        return other.left < this.right &&
        this.left < other.right &&
        other.top < this.bottom &&
        this.top < other.bottom
    }

    contains(x, y) {
        return this.left < x && this.right > x && this.top < y && this.bottom > y
    }

}


const canvas = document.getElementById("game")
canvas.width = SETTINGS.width;
canvas.height = SETTINGS.height;
let game = new Game(canvas);

game.start();