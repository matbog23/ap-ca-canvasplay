const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let bounds = canvas.getBoundingClientRect();

const mouse = { x: 0, y: 0, ox: 0, oy: 0, dx: 0, dy: 0 };
let mouseMoved = false;

let particles;

console.clear();

const properties = {
  margin: 10,
  rows: 50,
  columns: 50,
  gap: 2,
  radius: 16,
  manual_control: true,
  field_radius: 30,
  field_repulsive: true,
  field_strength: 2.5,
  field_limit: false,
  field_limit_strength: 15,
};

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.draw_x = x;
    this.draw_y = y;
    this.x_dest = 0;
    this.y_dest = 0;
    this.radius = properties.radius;
  }

  draw() {
    ctx.fillRect(this.draw_x, this.draw_y, this.radius, this.radius);
  }
}

function createControls() {
  // No GUI library, so controls are omitted
}

createControls();
initProps();

function initProps() {
  particles = [];

  for (let i = 0; i <= properties.rows; i++) {
    for (let j = 0; j <= properties.columns; j++) {
      particles.push(
        new Particle(
          i * (properties.radius + properties.gap) + properties.margin,
          j * (properties.radius + properties.gap) + properties.margin
        )
      );
    }
  }

  console.log("Particle count: ", particles.length);

  canvas.width =
    properties.rows * (properties.radius + properties.gap) +
    properties.margin * 2 +
    properties.gap;
  canvas.height =
    properties.columns * (properties.radius + properties.gap) +
    properties.margin * 2 +
    properties.gap;
}

bounds = canvas.getBoundingClientRect();
window.requestAnimationFrame(tick);

const updateSpeed = 0.05;

function tick(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  t = t / 4;
  if (!mouseMoved || !properties.manual_control) {
    mouse.ox =
      (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) *
      window.innerWidth;
    mouse.oy =
      (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) *
      window.innerHeight;

    mouse.x = mouse.ox - bounds.left;
    mouse.y = mouse.oy - bounds.top;
  }

  particles.forEach((particle) => {
    const con = properties.field_repulsive ? -1 : 1;
    const relPos = {
      x: con * (mouse.x - particle.x),
      y: con * (mouse.y - particle.y),
    };
    const d = Math.sqrt(relPos.x ** 2 + relPos.y ** 2);

    if (properties.field_limit) {
      if (d > properties.field_radius) relPos = { x: 0, y: 0 };

      particle.dest_x =
        particle.x + (relPos.x * properties.field_limit_strength) / d;
      particle.dest_y =
        particle.y + (relPos.y * properties.field_limit_strength) / d;
    } else {
      particle.dest_x =
        particle.x +
        (relPos.x * properties.field_radius * properties.field_strength) / d;
      particle.dest_y =
        particle.y +
        (relPos.y * properties.field_radius * properties.field_strength) / d;
    }

    if (
      particle.dest_x !== particle.draw_x ||
      particle.dest_x !== particle.draw_x
    ) {
      particle.draw_x += (particle.dest_x - particle.draw_x) * updateSpeed;
      particle.draw_y += (particle.dest_y - particle.draw_y) * updateSpeed;
    }

    particle.draw();
  });

  mouse.dx = mouse.x;
  mouse.dy = mouse.y;
  window.requestAnimationFrame(tick);
}

window.addEventListener("resize", () => {
  bounds = canvas.getBoundingClientRect();
});

window.addEventListener("mousemove", (e) => {
  mouse.ox = e.clientX;
  mouse.oy = e.clientY;
  mouse.x = e.clientX - bounds.left;
  mouse.y = e.clientY - bounds.top;
  if (!mouseMoved) mouseMoved = true;
});

window.addEventListener("touchmove", (e) => {
  mouse.ox = e.touches[0].clientX;
  mouse.oy = e.touches[0].clientY;
  mouse.x = e.touches[0].clientX - bounds.left;
  mouse.y = e.touches[0].clientY - bounds.top;
  mouseMoved = true;
});
