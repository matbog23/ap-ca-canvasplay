// Canvas setup
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let bounds = canvas.getBoundingClientRect();

// Mouse properties
const mouse = { x: 0, y: 0, ox: 0, oy: 0, dx: 0, dy: 0 };
let mouseMoved = false;

// Particle properties and class
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

// Initialize properties and particles
initProps();
bounds = canvas.getBoundingClientRect();
window.requestAnimationFrame(tick);

// Animation update speed
const updateSpeed = 0.02; // Adjusted update speed for slower return

// Animation loop
function tick(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  t = t / 4;
  if (!mouseMoved || !properties.manual_control) {
    // Mouse movement calculation
    mouse.ox =
      (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) *
      window.innerWidth;
    mouse.oy =
      (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) *
      window.innerHeight;
    mouse.x = mouse.ox - bounds.left;
    mouse.y = mouse.oy - bounds.top;
  }

  // Particle movement calculation and drawing
  particles.forEach((particle) => {
    const con = properties.field_repulsive ? -1 : 1;
    let relPos = {
      x: con * (mouse.x - particle.x),
      y: con * (mouse.y - particle.y),
    };
    let d = Math.sqrt(relPos.x ** 2 + relPos.y ** 2);

    if (properties.field_limit) {
      if (d > properties.field_radius) relPos = { x: 0, y: 0 };
      particle.dest_x =
        particle.x + (relPos.x * properties.field_limit_strength) / d;
      particle.dest_y =
        particle.y + (relPos.y * properties.field_limit_strength) / d;
    } else {
      if (d > 0) {
        particle.dest_x =
          particle.x +
          (relPos.x * properties.field_radius * properties.field_strength) / d;
        particle.dest_y =
          particle.y +
          (relPos.y * properties.field_radius * properties.field_strength) / d;
      }
    }

    // Particle movement with snake effect
    if (
      particle.dest_x !== particle.draw_x ||
      particle.dest_y !== particle.draw_y
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

// Event listeners
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

// Initialize particles
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
