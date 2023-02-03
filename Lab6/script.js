const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

class Ball {
  color =
    "rgb(" +
    Math.floor(Math.random() * 256) +
    "," +
    Math.floor(Math.random() * 256) +
    "," +
    Math.floor(Math.random() * 256) +
    ")";
  direction = Math.random() * Math.PI * 2;
  speed = Math.random() * 2 + 1;
  id;
  x;
  y;

  constructor(x, y, radius) {
    this.radius = radius;
    this.x = x;
    this.y = y;
  }

  move(width, height) {
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;

    if (this.x - this.radius < 0) {
      this.x = this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction),
        Math.cos(this.direction) * -1
      );
    } else if (this.x + this.radius > width) {
      this.x = width - this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction),
        Math.cos(this.direction) * -1
      );
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction) * -1,
        Math.cos(this.direction)
      );
    } else if (this.y + this.radius > height) {
      this.y = height - this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction) * -1,
        Math.cos(this.direction)
      );
    }
  }
}

class BoardConfig {
  // static yValue = document.getElementById("yValue").value || 0;
  // static xValue = document.getElementById("xValue").value || 0;
  // static energySpeed = document.getElementById("energySpeed").value || 0;
  // static mouseEffectRepulsion = document.getElementById("repulsionEffect")
  //   .checked
  //   ? true
  //   : false;
  minDistance = document.getElementById("distanceValue")?.value || 150;
  numberOfBalls = document.getElementById("numberOfBalls")?.value || 10;
  // static mouseEffectPower =
  // document.getElementById("powerOfMouseEffect").value || 0;
}

class Board {
  balls = [];
  animation = null;
  numberOfBalls = 10;
  numberOfRespawnedBalls = 2;
  minDistance = 150;
  height = document.documentElement.clientHeight - 50;
  width = document.documentElement.clientWidth * 0.75;
  config = new BoardConfig();

  play() {
    this.createBalls();
    this.renderBalls();
  }

  clear() {
    if (!this.animation) return;

    window.cancelAnimationFrame(this.animation);
    this.balls = [];
    this.animation = null;
    context.canvas.height = this.height;
    context.canvas.width = this.width;
  }

  renderBalls() {
    context.canvas.height = this.height;
    context.canvas.width = this.width;

    this.animation = window.requestAnimationFrame((t) => this.renderBalls(t));

    const pairs = [];

    console.log("length", this.balls.length);

    for (let i = 0; i < this.balls.length; i++) {
      let ball = this.balls[i];

      context.fillStyle = ball.color;
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      context.fill();

      for (let j = 0; j < this.balls.length; j++) {
        if (i !== j) {
          let ball2 = this.balls[j];

          let distance = this.getDistanceBetweenBalls({
            x1: ball.x,
            x2: ball2.x,
            y1: ball.y,
            y2: ball2.y,
          });

          const containsPair = pairs.some((pair) => {
            return (
              (pair[0] === i && pair[1] === j) ||
              (pair[0] === j && pair[1] === i)
            );
          });

          if (distance < this.config.minDistance && !containsPair) {
            pairs.push([i, j]);

            context.beginPath();
            context.moveTo(ball.x, ball.y);
            context.lineTo(ball2.x, ball2.y);
            context.stroke();
          }
        }
      }

      ball.move(this.width, this.height);
    }
  }

  getDistanceBetweenBalls({ x1, y1, x2, y2 }) {
    const a = x1 - x2;
    const b = y1 - y2;

    const distance = Math.sqrt(a * a + b * b);

    return distance;
  }

  removeAndRespawnBalls(point) {
    console.log(point);

    this.balls.forEach((ball, idx) => {
      if (
        parseInt(
          Math.sqrt((point.x - ball.x) ** 2 + (point.y - ball.y) ** 2)
        ) <= ball.radius
      ) {
        this.balls.splice(idx, 1);

        this.createBalls(this.numberOfRespawnedBalls);
      }
    });
  }

  pushBalls() {}

  createBall() {
    const x = this.getRandomArbitrary(0, this.width);
    const y = this.getRandomArbitrary(0, this.height);
    this.balls.push(new Ball(x, y, Math.floor(Math.random() * 40 + 20)));
  }

  createBalls(length) {
    length = length || this.config.numberOfBalls;

    for (let index = 0; index < length; index++) {
      this.createBall();
    }
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
}

const board = new Board();

board.play();

canvas.addEventListener("click", (e) => {
  const point = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  };

  board.removeAndRespawnBalls(point);
});

document.getElementById("start").onclick = () => board.play();
document.getElementById("reset").onclick = () => board.clear();
