// // const ctx = document.getElementById("canvas").getContext("2d");
// // var circ = new Circle(100, 100, 20);

// // //Define the circle
// // function Circle(x, y, r) {
// //   "use strict";
// //   this.x = x === null ? 0 : x;
// //   this.y = y === null ? 0 : y;
// //   this.r = r === null ? 0 : r;

// //   this.fill = function (ctx) {
// //     ctx.beginPath();
// //     ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
// //     ctx.stroke();
// //   };
// // }

// // //Draw the circle as object
// // circ.fill(ctx);

// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");
// let raf;

// const ball = {
//   x: 100,
//   y: 100,
//   ball: 5,
//   vx: 2,
//   vy: 2,
//   radius: 25,
//   draw() {
//     ctx.beginPath();
//     ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
//     ctx.closePath();
//     ctx.stroke();
//   },
// };

// // var ballRadius = 10;
// // var x = canvas.width / 2;
// // var y = canvas.height - 30;

// function draw() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ball.draw();

//   if (
//     ball.x + ball.vx > canvas.width - ball.radius ||
//     ball.x + ball.vx < ball.radius
//   ) {
//     ball.vx = -ball.vx;
//   }
//   if (
//     ball.y + ball.vy > canvas.height - ball.radius ||
//     ball.y + ball.vy < ball.radius
//   ) {
//     ball.vy = -ball.vy;
//   }

//   ball.x += ball.vx;
//   ball.y += ball.vy;

//   console.log(ball);
//   window.requestAnimationFrame(draw);
// }

// // canvas.addEventListener("mouseover", (e) => {
// //   raf = window.requestAnimationFrame(draw);
// // });

// // canvas.addEventListener("mouseout", (e) => {
// //   window.cancelAnimationFrame(raf);
// // });

// ball.draw();

// draw();

canvas.width = innerWidth - 20;
canvas.height = innerHeight - 20;
const ctx = canvas.getContext("2d");
const GRAVITY = 0;
const WALL_LOSS = 1;
const BALL_COUNT = 20; // approx as will not add ball if space can not be found
const MIN_BALL_SIZE = 13;
const MAX_BALL_SIZE = 20;
const VEL_MIN = 1;
const VEL_MAX = 5;
const MAX_RESOLUTION_CYCLES = 100;
Math.TAU = Math.PI * 2;
Math.rand = (min, max) => Math.random() * (max - min) + min;
Math.randI = (min, max) => (Math.random() * (max - min) + min) | 0; // only for positive numbers 32bit signed int
Math.randItem = (arr) => arr[(Math.random() * arr.length) | 0]; // only for arrays with length < 2 ** 31 - 1
// contact points of two circles radius r1, r2 moving along two lines (a,e)-(b,f) and (c,g)-(d,h) [where (,) is coord (x,y)]
Math.circlesInterceptUnitTime = (a, e, b, f, c, g, d, h, r1, r2) => {
  // args (x1, y1, x2, y2, x3, y3, x4, y4, r1, r2)
  const A = a * a,
    B = b * b,
    C = c * c,
    D = d * d;
  const E = e * e,
    F = f * f,
    G = g * g,
    H = h * h;
  var R = (r1 + r2) ** 2;
  const AA =
    A +
    B +
    C +
    F +
    G +
    H +
    D +
    E +
    b * c +
    c * b +
    f * g +
    g * f +
    2 *
      (a * d -
        a * b -
        a * c -
        b * d -
        c * d -
        e * f +
        e * h -
        e * g -
        f * h -
        g * h);
  const BB =
    2 *
    (-A +
      a * b +
      2 * a * c -
      a * d -
      c * b -
      C +
      c * d -
      E +
      e * f +
      2 * e * g -
      e * h -
      g * f -
      G +
      g * h);
  const CC = A - 2 * a * c + C + E - 2 * e * g + G - R;
  return Math.quadRoots(AA, BB, CC);
};
Math.quadRoots = (a, b, c) => {
  // find roots for quadratic
  if (Math.abs(a) < 1e-6) {
    return b != 0 ? [-c / b] : [];
  }
  b /= a;
  var d = b * b - 4 * (c / a);
  if (d > 0) {
    d = d ** 0.5;
    return [0.5 * (-b + d), 0.5 * (-b - d)];
  }
  return d === 0 ? [0.5 * -b] : [];
};
Math.interceptLineBallTime = (x, y, vx, vy, x1, y1, x2, y2, r) => {
  const xx = x2 - x1;
  const yy = y2 - y1;
  const d = vx * yy - vy * xx;
  if (d > 0) {
    // only if moving towards the line
    const dd = r / (xx * xx + yy * yy) ** 0.5;
    const nx = xx * dd;
    const ny = yy * dd;
    return (xx * (y - (y1 + nx)) - yy * (x - (x1 - ny))) / d;
  }
};
const balls = [];
const lines = [];
function Line(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
}
Line.prototype = {
  draw() {
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
  },
  reverse() {
    const x = this.x1;
    const y = this.y1;
    this.x1 = this.x2;
    this.y1 = this.y2;
    this.x2 = x;
    this.y2 = y;
    return this;
  },
};

function Ball(x, y, vx, vy, r = 45, m = (4 / 3) * Math.PI * r ** 3) {
  this.r = r;
  this.m = m;
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
}
Ball.prototype = {
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY;
  },
  draw() {
    ctx.moveTo(this.x + this.r, this.y);
    ctx.arc(this.x, this.y, this.r, 0, Math.TAU);
  },
  interceptLineTime(l, time) {
    const u = Math.interceptLineBallTime(
      this.x,
      this.y,
      this.vx,
      this.vy,
      l.x1,
      l.y1,
      l.x2,
      l.y2,
      this.r
    );
    if (u >= time && u <= 1) {
      return u;
    }
  },
  checkBallBallTime(t, minTime) {
    return t > minTime && t <= 1;
  },
  interceptBallTime(b, time) {
    const x = this.x - b.x;
    const y = this.y - b.y;
    const d = (x * x + y * y) ** 0.5;
    if (d > this.r + b.r) {
      const times = Math.circlesInterceptUnitTime(
        this.x,
        this.y,
        this.x + this.vx,
        this.y + this.vy,
        b.x,
        b.y,
        b.x + b.vx,
        b.y + b.vy,
        this.r,
        b.r
      );
      if (times.length) {
        if (times.length === 1) {
          if (this.checkBallBallTime(times[0], time)) {
            return times[0];
          }
          return;
        }
        if (times[0] <= times[1]) {
          if (this.checkBallBallTime(times[0], time)) {
            return times[0];
          }
          if (this.checkBallBallTime(times[1], time)) {
            return times[1];
          }
          return;
        }
        if (this.checkBallBallTime(times[1], time)) {
          return times[1];
        }
        if (this.checkBallBallTime(times[0], time)) {
          return times[0];
        }
      }
    }
  },
  collideLine(l, time) {
    const x1 = l.x2 - l.x1;
    const y1 = l.y2 - l.y1;
    const d = (x1 * x1 + y1 * y1) ** 0.5;
    const nx = x1 / d;
    const ny = y1 / d;
    const u = (this.vx * nx + this.vy * ny) * 2;
    this.x += this.vx * time;
    this.y += this.vy * time;
    this.vx = (nx * u - this.vx) * WALL_LOSS;
    this.vy = (ny * u - this.vy) * WALL_LOSS;
    this.x -= this.vx * time;
    this.y -= this.vy * time;
  },
  collide(b, time) {
    const a = this;
    const m1 = a.m;
    const m2 = b.m;
    const x = a.x - b.x;
    const y = a.y - b.y;
    const d = x * x + y * y;
    const u1 = (a.vx * x + a.vy * y) / d;
    const u2 = (x * a.vy - y * a.vx) / d;
    const u3 = (b.vx * x + b.vy * y) / d;
    const u4 = (x * b.vy - y * b.vx) / d;
    const mm = m1 + m2;
    const vu3 = ((m1 - m2) / mm) * u1 + ((2 * m2) / mm) * u3;
    const vu1 = ((m2 - m1) / mm) * u3 + ((2 * m1) / mm) * u1;
    a.x = a.x + a.vx * time;
    a.y = a.y + a.vy * time;
    b.x = b.x + b.vx * time;
    b.y = b.y + b.vy * time;
    b.vx = x * vu1 - y * u4;
    b.vy = y * vu1 + x * u4;
    a.vx = x * vu3 - y * u2;
    a.vy = y * vu3 + x * u2;
    a.x = a.x - a.vx * time;
    a.y = a.y - a.vy * time;
    b.x = b.x - b.vx * time;
    b.y = b.y - b.vy * time;
  },
  doesOverlap(ball) {
    const x = this.x - ball.x;
    const y = this.y - ball.y;
    return this.r + ball.r > (x * x + y * y) ** 0.5;
  },
};

function canAdd(ball) {
  for (const b of balls) {
    if (ball.doesOverlap(b)) {
      return false;
    }
  }
  return true;
}
function create(bCount) {
  lines.push(new Line(-10, 10, ctx.canvas.width + 10, 5));
  lines.push(
    new Line(
      -10,
      ctx.canvas.height - 2,
      ctx.canvas.width + 10,
      ctx.canvas.height - 10
    ).reverse()
  );
  lines.push(new Line(10, -10, 4, ctx.canvas.height + 10).reverse());
  lines.push(
    new Line(
      ctx.canvas.width - 3,
      -10,
      ctx.canvas.width - 10,
      ctx.canvas.height + 10
    )
  );
  while (bCount--) {
    let tries = 100;
    while (tries--) {
      const dir = Math.rand(0, Math.TAU);
      const vel = Math.rand(VEL_MIN, VEL_MAX);
      const ball = new Ball(
        Math.rand(MAX_BALL_SIZE + 10, canvas.width - MAX_BALL_SIZE - 10),
        Math.rand(MAX_BALL_SIZE + 10, canvas.height - MAX_BALL_SIZE - 10),
        Math.cos(dir) * vel,
        Math.sin(dir) * vel,
        Math.rand(MIN_BALL_SIZE, MAX_BALL_SIZE)
      );
      if (canAdd(ball)) {
        balls.push(ball);
        break;
      }
    }
  }
}
function resolveCollisions() {
  var minTime = 0,
    minObj,
    minBall,
    resolving = true,
    idx = 0,
    idx1,
    after = 0,
    e = 0;
  while (resolving && e++ < MAX_RESOLUTION_CYCLES) {
    // too main ball may create very lone resolution cycle. e limits this
    resolving = false;
    minObj = undefined;
    minBall = undefined;
    minTime = 1;
    idx = 0;
    for (const b of balls) {
      idx1 = idx + 1;
      while (idx1 < balls.length) {
        const b1 = balls[idx1++];
        const time = b.interceptBallTime(b1, after);
        if (time !== undefined) {
          if (time <= minTime) {
            minTime = time;
            minObj = b1;
            minBall = b;
            resolving = true;
          }
        }
      }
      for (const l of lines) {
        const time = b.interceptLineTime(l, after);
        if (time !== undefined) {
          if (time <= minTime) {
            minTime = time;
            minObj = l;
            minBall = b;
            resolving = true;
          }
        }
      }
      idx++;
    }
    if (resolving) {
      if (minObj instanceof Ball) {
        minBall.collide(minObj, minTime);
      } else {
        minBall.collideLine(minObj, minTime);
      }
      after = minTime;
    }
  }
}
create(BALL_COUNT);
mainLoop();
function mainLoop() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  resolveCollisions();
  for (const b of balls) {
    b.update();
  }
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  for (const b of balls) {
    b.draw();
  }
  for (const l of lines) {
    l.draw();
  }
  ctx.stroke();
  requestAnimationFrame(mainLoop);
}
