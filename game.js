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

        this.startButton = new Rectangle(
            this.canvas.width / 2 - 60,
            this.canvas.height / 2 - 20,
            120,
            40
        )


        this.canvas.addEventListener("click", (e)=> {
            console.log(1)
            if(this.startButton.contains(e.clientX, e.clientY) && !this.court.isMatchRunning) {
                console.log(2)
                this.court.startMatch()
            }

        })
    }

    start() {
        let that = this;
        let previousTime = Date.now();

        setInterval(function() {

            let now = Date.now()
            let dT = (now - previousTime) / 1000.0

            that.draw()
            that.court.update(dT)

            previousTime = now

        }, 1/SETTINGS.FPS * 1000)
    }

    draw() {
        let ctx = this.canvas.getContext("2d")
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.court.draw(this.canvas)

        if (!this.court.isMatchRunning) {
            ctx.fillStyle = SETTINGS.buttonColour
            ctx.fillRect(
                this.startButton.x,
                this.startButton.y,
                this.startButton.width,
                this.startButton.height,
            )
            ctx.fillStyle = SETTINGS.buttonTextColour
            ctx.font = SETTINGS.smallFont
            ctx.fillText("Start Match", 
                this.startButton.x + 5, 
                this.startButton.y + this.startButton.height /2 + 6
            )
        }
    }
    
}

class ScoreBoard {
    constructor() {
        this.reset()
    }

    get winner() {
        if (this.playerOneScore >= SETTINGS.winScore) {
            return PLAYERS.playerOne
        }
        else if (this.playerTwoScore >= SETTINGS.winScore) {
            return PLAYERS.playerTwo
        }else{
            return 0
        }
        
    }

    draw(canvas){
        let ctx = canvas.getContext("2d")
        ctx.font = SETTINGS.smallFont
        ctx.fillStyle = SETTINGS.scoreboardColour

        ctx.fillText("Player 1 | " + this.playerOneScore, 8, 20)
        ctx.fillText("Player 2 | " + this.playerTwoScore, canvas.width - 130, 20)
        ctx.fillText("Round: " +this.round, canvas.width / 2 - 50, 20)
    }

    reset () {
        this.playerOneScore = 0
        this.playerTwoScore = 0
        this.round = 1
    }

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

    get collisionBox() {
        return new Rectangle(this.x, this.y, this.width, this.height)
    }

    reset() {
        this.x = this.startX
        this.y = this.startY
    }
}

class PaddleController {
    constructor(paddle) {
        this.paddle = paddle
        this.canvas = this.paddle.court.canvas
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.clientY <= this.paddle.court.bounds.upper){
                this.paddle.y = this.paddle.court.bounds.upper
            }else if (e.clientY+SETTINGS.paddleHeight >= this.paddle.court.bounds.lower){
                this.paddle.y = this.paddle.court.bounds.lower -SETTINGS.paddleHeight
            }else {
                this.paddle.y = e.clientY
            }
          });
    }
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

        this.paddleController = new PaddleController(this.leftPaddle)

        this.scoreboard = new ScoreBoard

        this.isMatchRunning = false
    }

    get bounds () {
        return {
            upper: SETTINGS.courtMarginY + SETTINGS.wallSize,
            lower: this.canvas.height - (SETTINGS.courtMarginY + SETTINGS.wallSize),
            left: 0,
            right: this.canvas.width
        }
    }

    spawnBall() {
        this.ball.velocity = {
            x: Math.random() > 0.5 ? 100 : -100,
            y: Math.random() > 0.5 ? 100 : -100
        }
        this.ball.x = this.canvas.width / 2
        this.ball.y = this.canvas.height / 2
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

        this.scoreboard.draw(canvas)
    }

    update(dT) {
        if (!this.isMatchRunning){
            return
        }
        this.ball.update(dT)
    }

    startMatch() {
        this.isMatchRunning = true
        this.spawnBall()
        this.scoreboard.reset()
        this.leftPaddle.reset()
        this.rightPaddle.reset()
    }

    scorePoint(player) {
        if (player == PLAYERS.playerOne) {
            this.scoreboard.playerOneScore ++
        } else {
            this.scoreboard.playerTwoScore ++ 
        }
        if (this.scoreboard.winner) {
            this.isMatchRunning = false
        } else {
            this.scoreboard.round ++
            this.spawnBall()
        }
    }
}

class Ball {
    constructor (x, y, radius, court) {
        this.x = x
        this.y = y
        this.radius = radius
        this.court = court
        this.velocity = {x:-100, y:100}
        this.acceleration = 2
    }

    draw(canvas){
        let ctx = canvas.getContext("2d")

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI)
        ctx.fillStyle = "white"
        ctx.fill()
    }

    get collisionBox() {
        return new Rectangle(this.x - this.radius, this.y  - this.radius, this.radius * 2, this.radius * 2)
    }

    update(dT){
        this.y += this.velocity.y * this.acceleration * dT

        if (this.y - this.radius < this.court.bounds.upper) {
            this.velocity.y *= -1
            this.y += 10
        }

        if (this.y + this.radius > this.court.bounds.lower) {
            this.velocity.y *= -1
            this.y -= 10
        }

        if (this.collisionBox.overlaps(this.court.leftPaddle.collisionBox)) {
            this.velocity.x *= -1
            this.x = this.court.leftPaddle.collisionBox.right + this.radius
        }

        else if (this.collisionBox.overlaps(this.court.rightPaddle.collisionBox)) {
            this.velocity.x *= -1
            this.x = this.court.rightPaddle.collisionBox.left - this.radius
        }

        this.x += this.velocity.x * this.acceleration * dT

        if (this.x < this.court.bounds.left) {
            this.court.scorePoint(PLAYERS.playerTwo)
        }
        else if (this.x > this.court.bounds.right) {
            this.court.scorePoint(PLAYERS.playerOne)
        }
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