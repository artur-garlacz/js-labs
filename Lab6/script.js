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

class BoardConfig {
  xValue = 10;
  yValue = 10;
  powerSpeed = 0.25;
  numberOfRespawnedBalls = 2;
  mouseMoveEffect =
    document.querySelector('input[name="mouseMoveEffect"]:checked')?.value ||
    MouseMoveEffect.FETCHING;
  allowMouseMoveEffect =
    document.getElementById("allowMouseMoveEffect")?.checked || false;
  repulsionBallsPower =
    document.getElementById("repulsionBallsPower").value || 40;
  fetchingBallsPower =
    document.getElementById("fetchingBallsPower").value || 40;
  minDistance = parseInt(document.getElementById("minDistance")?.value) || 150;
  numberOfBalls =
    parseInt(document.getElementById("numberOfBalls")?.value) || 10;

  constructor() {
    this.updateMinDistance();
    this.updateNumOfBalls();
    this.updateAllowMouseMoveEffect();
    this.updateMouseMoveEffect();
  }

  updateMinDistance() {
    document.getElementById("minDistance").onkeyup = (e) => {
      this.minDistance = parseInt(e.target.value) || 150;
    };
  }

  updateMouseMoveEffect() {
    const effects = document.querySelectorAll('input[name="mouseMoveEffect"]');
    for (const effect of effects) {
      effect.onclick = (e) => {
        this.mouseMoveEffect = e.target.value || MouseMoveEffect.FETCHING;
      };
    }
  }

  updateAllowMouseMoveEffect() {
    document.getElementById("allowMouseMoveEffect").onclick = (e) => {
      this.allowMouseMoveEffect = e.target.checked || false;
    };
  }

  updateNumOfBalls() {
    document.getElementById("numberOfBalls").onkeyup = (e) => {
      this.numberOfBalls = parseInt(e.target.value) || 10;
    };
  }
}

const boardConfig = new BoardConfig();

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
  speed = 1;
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

  moveFrom(point, distance) {
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;

    if (point.x + distance < this.x - this.radius) {
      this.x = point.x + distance - this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction),
        Math.cos(this.direction) * -1
      );
    } else if (point.x - distance > this.x + this.radius) {
      this.x = point.x - distance - this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction),
        Math.cos(this.direction) * -1
      );
    }

    if (point.y + distance < this.y - this.radius) {
      this.y = point.y + distance - this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction) * -1,
        Math.cos(this.direction)
      );
    } else if (point.y - distance > this.y + this.radius) {
      this.y = point.y - distance - this.radius;

      this.direction = Math.atan2(
        Math.sin(this.direction) * -1,
        Math.cos(this.direction)
      );
    }
  }

  getCircleArea() {
    return Math.PI * this.radius ** 2;
  }

  getBallPower() {
    return (
      boardConfig.xValue * this.speed +
      boardConfig.yValue * this.getCircleArea()
    );
  }

  addPower(radius, speed) {
    this.radius += (boardConfig.powerSpeed * radius) / 100;
    this.speed -= (boardConfig.powerSpeed * speed) / 100;
  }

  removePower() {
    this.radius -= (boardConfig.powerSpeed * this.radius) / 100;
    this.speed += (boardConfig.powerSpeed * this.speed) / 100;
  }
}

const MouseMoveEffect = {
  FETCHING: "fetching",
  REPULSION: "repulsion",
};

// Gdy kulka łączy się z drugą (linia) energia płynie od kulki słabszej do silniejszej (kulki zmieniają rozmiar).
// Siła kulki to X * Prędkość + Y * Masa.
// X, Y oraz prędkość przepływu energii konfigurowalne przez użytkownika.

class Board {
  balls = [];
  animation = null;
  height = document.documentElement.clientHeight - 50;
  width = document.documentElement.clientWidth * 0.75;
  // config = new BoardConfig();

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

    for (let i = 0; i < this.balls.length; i++) {
      let ball = this.balls[i];

      if (ball.getCircleArea() < 100) {
        this.balls.splice(i, 1);
      } else {
        context.fillStyle = ball.color;
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fill();

        for (let j = 0; j < this.balls.length; j++) {
          if (i !== j) {
            let ball2 = this.balls[j];

            let distance = this.getDistanceBetweenPoints({
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

            if (distance < boardConfig.minDistance && !containsPair) {
              pairs.push([i, j]);

              context.beginPath();
              context.moveTo(ball.x, ball.y);
              context.lineTo(ball2.x, ball2.y);
              context.stroke();

              // if (ball.getBallPower() > ball2.getBallPower()) {
              //   ball.addPower(ball2.radius, ball2.speed);
              //   ball2.removePower();
              // } else {
              //   ball2.addPower(ball.radius, ball.speed);
              //   ball.removePower();
              // }
            }
          }
        }

        ball.move(this.width, this.height);
      }
    }
  }

  getDistanceBetweenPoints({ x1, y1, x2, y2 }) {
    const a = x1 - x2;
    const b = y1 - y2;

    const distance = Math.sqrt(a * a + b * b);

    return distance;
  }

  removeAndRespawnBalls(point) {
    this.balls.forEach((ball, idx) => {
      if (
        parseInt(
          Math.sqrt((point.x - ball.x) ** 2 + (point.y - ball.y) ** 2)
        ) <= ball.radius
      ) {
        this.balls.splice(idx, 1);

        this.createBalls(boardConfig.numberOfRespawnedBalls);
      }
    });
  }

  moveCursor(point) {
    if (!boardConfig.allowMouseMoveEffect) return;

    this.fetchBalls(point);

    this.balls.forEach((ball) => {
      let distance = this.getDistanceBetweenPoints({
        x1: ball.x,
        y1: ball.y,
        x2: point.x,
        y2: point.y,
      });

      if (boardConfig.mouseMoveEffect === MouseMoveEffect.FETCHING) {
        this.fetchBalls(point, ball, distance);
      } else if (boardConfig.mouseMoveEffect === MouseMoveEffect.REPULSION) {
        this.repulseBalls(point, ball, distance);
      }
    });
  }

  fetchBalls(point, ball, distance) {
    if (distance <= boardConfig.fetchingBallsPower) {
      console.log("fetchBalls");
      ball.x = point.x;
      ball.y = point.y;
    }
  }

  repulseBalls(point, ball, distance) {
    if (distance < boardConfig.repulsionBallsPower) {
      console.log("repulseBalls");
      ball.moveFrom(point, distance);
    }
  }

  createBall() {
    const x = this.getRandomArbitrary(0, this.width);
    const y = this.getRandomArbitrary(0, this.height);
    this.balls.push(new Ball(x, y, Math.floor(Math.random() * 40 + 20)));
  }

  createBalls(length) {
    length = length || boardConfig.numberOfBalls;

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

canvas.onclick = (e) => {
  const point = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  };

  board.removeAndRespawnBalls(point);
};

canvas.onmousemove = (e) => {
  const point = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  };

  board.moveCursor(point);
};

document.getElementById("start").onclick = () => board.play();
document.getElementById("reset").onclick = () => board.clear();
