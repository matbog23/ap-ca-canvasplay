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
  radius: 8,
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
    this.x_dest = x;
    this.y_dest = y;
    this.radius = properties.radius;
    this.original_x = x; // Store original position
    this.original_y = y;
    this.moved = false; // Flag to track if particle has been moved by the circle
  }

  draw(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.draw_x, this.draw_y, this.radius, this.radius);
  }
}

// Initialize properties and particles
initProps();
bounds = canvas.getBoundingClientRect();
window.requestAnimationFrame(tick);

// Animation update speed
const updateSpeed = 0.02; // Adjusted update speed for slower return

// Bouncing circle properties
const smallCircle = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 30,
  speed: 2,
  angle: Math.random() * Math.PI * 2,
};

// Trail gradient properties
const trailGradient = ctx.createRadialGradient(
  smallCircle.x,
  smallCircle.y,
  0,
  smallCircle.x,
  smallCircle.y,
  smallCircle.radius
);
trailGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
trailGradient.addColorStop(1, "rgba(255, 255, 255, 0.2)");

// Event listeners for mouse dragging
let isDragging = false;
let offsetX, offsetY;

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  const distance = Math.sqrt(
    (offsetX - smallCircle.x) ** 2 + (offsetY - smallCircle.y) ** 2
  );

  if (distance <= smallCircle.radius) {
    isDragging = true;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    smallCircle.x = x;
    smallCircle.y = y;
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

// Event listeners for touch dragging
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  offsetX = touch.clientX - rect.left;
  offsetY = touch.clientY - rect.top;

  const distance = Math.sqrt(
    (offsetX - smallCircle.x) ** 2 + (offsetY - smallCircle.y) ** 2
  );

  if (distance <= smallCircle.radius) {
    isDragging = true;
  }
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (isDragging) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    smallCircle.x = x;
    smallCircle.y = y;
  }
});

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

// Animation loop
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

  updateCircle(); // Update bouncing circle

  // Draw trail gradient behind the small circle
  ctx.fillStyle = trailGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    // Calculate distance between particle and bouncing circle
    let distToSmallCircle = Math.sqrt(
      (smallCircle.x - particle.x) ** 2 + (smallCircle.y - particle.y) ** 2
    );

    // Calculate color gradient based on distance from small circle
    let colorGradient = getColorGradient(distToSmallCircle);

    // Draw particle with color gradient
    particle.draw(colorGradient);

    // Particle movement with snake effect
    if (
      particle.x_dest !== particle.draw_x ||
      particle.y_dest !== particle.draw_y
    ) {
      particle.draw_x += (particle.x_dest - particle.draw_x) * updateSpeed;
      particle.draw_y += (particle.y_dest - particle.draw_y) * updateSpeed;
    }

    // Push particles away from the small circle
    let dist = Math.sqrt(
      (particle.draw_x - smallCircle.x) ** 2 +
        (particle.draw_y - smallCircle.y) ** 2
    );
    if (dist < smallCircle.radius) {
      let angle = Math.atan2(
        particle.draw_y - smallCircle.y,
        particle.draw_x - smallCircle.x
      );
      let moveX = Math.cos(angle) * (smallCircle.radius - dist) * 0.1;
      let moveY = Math.sin(angle) * (smallCircle.radius - dist) * 0.1;
      particle.draw_x += moveX;
      particle.draw_y += moveY;
      particle.x_dest += moveX;
      particle.y_dest += moveY;
    }

    // Reset particle to original position after small circle passes
    if (!isIntersecting(particle, smallCircle)) {
      particle.x_dest = particle.original_x;
      particle.y_dest = particle.original_y;
    }
  });

  mouse.dx = mouse.x;
  mouse.dy = mouse.y;
  window.requestAnimationFrame(tick);
}

// Check if a particle intersects with a circle
function isIntersecting(particle, circle) {
  let dx =
    particle.x -
    Math.max(circle.x, Math.min(particle.x, circle.x + circle.radius));
  let dy =
    particle.y -
    Math.max(circle.y, Math.min(particle.y, circle.y + circle.radius));
  return dx ** 2 + dy ** 2 < particle.radius ** 2;
}

// Update function for bouncing circle
function updateCircle() {
  // Update small circle
  smallCircle.x += Math.cos(smallCircle.angle) * smallCircle.speed;
  smallCircle.y += Math.sin(smallCircle.angle) * smallCircle.speed;

  if (
    smallCircle.x - smallCircle.radius < 0 ||
    smallCircle.x + smallCircle.radius > canvas.width
  ) {
    smallCircle.angle = Math.PI - smallCircle.angle;
  }
  if (
    smallCircle.y - smallCircle.radius < 0 ||
    smallCircle.y + smallCircle.radius > canvas.height
  ) {
    smallCircle.angle = -smallCircle.angle;
  }
}

// Generate color gradient based on distance from the small circle
function getColorGradient(distance) {
  // Calculate the color index based on the distance
  let colorIndex = Math.floor((distance / smallCircle.radius) * 255);

  // Adjust the color components based on the color index
  let r = 0 - colorIndex;
  let g = 256 - colorIndex;
  let b = 128;

  // Return the RGB color string
  return `rgb(${r},${g},${b})`;
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

/*
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
  radius: 8,
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
    this.x_dest = x;
    this.y_dest = y;
    this.radius = properties.radius;
    this.original_x = x; // Store original position
    this.original_y = y;
    this.moved = false; // Flag to track if particle has been moved by the circle
  }

  draw(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.draw_x, this.draw_y, this.radius, this.radius);
  }
}

// Initialize properties and particles
initProps();
bounds = canvas.getBoundingClientRect();
window.requestAnimationFrame(tick);

// Animation update speed
const updateSpeed = 0.02; // Adjusted update speed for slower return

// Bouncing circle properties
const smallCircle = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 30,
  speed: 0, // Speed controlled by user interaction
  angle: 0, // Angle controlled by user interaction
  velocityX: 0, // Velocity X component
  velocityY: 0, // Velocity Y component
  friction: 0.95, // Friction to slow down the velocity
  isDragging: false, // Flag to track dragging
};

// Event listeners for mouse dragging
let offsetX, offsetY;

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  const distance = Math.sqrt(
    (offsetX - smallCircle.x) ** 2 + (offsetY - smallCircle.y) ** 2
  );

  if (distance <= smallCircle.radius) {
    smallCircle.isDragging = true;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (smallCircle.isDragging) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    smallCircle.x = x;
    smallCircle.y = y;
  }
});

canvas.addEventListener("mouseup", () => {
  smallCircle.isDragging = false;
});

// Event listeners for touch dragging
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;

    const distance = Math.sqrt(
      (offsetX - smallCircle.x) ** 2 + (offsetY - smallCircle.y) ** 2
    );

    if (distance <= smallCircle.radius) {
      smallCircle.isDragging = true;
    }
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    if (smallCircle.isDragging) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      smallCircle.x = x;
      smallCircle.y = y;
    }
  },
  { passive: false }
);

canvas.addEventListener("touchend", () => {
  smallCircle.isDragging = false;
});

// Animation loop
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

  updateCircle(); // Update bouncing circle

  particles.forEach((particle) => {
    // Calculate distance between particle and bouncing circle
    let distToSmallCircle = Math.sqrt(
      (smallCircle.x - particle.x) ** 2 + (smallCircle.y - particle.y) ** 2
    );

    // Calculate color gradient based on distance from small circle
    let colorGradient = getColorGradient(distToSmallCircle);

    // Draw particle with color gradient
    particle.draw(colorGradient);

    // Particle movement with snake effect
    if (
      particle.x_dest !== particle.draw_x ||
      particle.y_dest !== particle.draw_y
    ) {
      particle.draw_x += (particle.x_dest - particle.draw_x) * updateSpeed;
      particle.draw_y += (particle.y_dest - particle.draw_y) * updateSpeed;
    }

    // Push particles away from the small circle
    let dist = Math.sqrt(
      (particle.draw_x - smallCircle.x) ** 2 +
        (particle.draw_y - smallCircle.y) ** 2
    );
    if (dist < smallCircle.radius) {
      let angle = Math.atan2(
        particle.draw_y - smallCircle.y,
        particle.draw_x - smallCircle.x
      );
      let moveX = Math.cos(angle) * (smallCircle.radius - dist) * 0.1;
      let moveY = Math.sin(angle) * (smallCircle.radius - dist) * 0.1;
      particle.draw_x += moveX;
      particle.draw_y += moveY;
      particle.x_dest += moveX;
      particle.y_dest += moveY;
    }

    // Reset particle to original position after small circle passes
    if (!isIntersecting(particle, smallCircle)) {
      particle.x_dest = particle.original_x;
      particle.y_dest = particle.original_y;
    }
  });

  mouse.dx = mouse.x;
  mouse.dy = mouse.y;
  window.requestAnimationFrame(tick);
}

// Check if a particle intersects with a circle
function isIntersecting(particle, circle) {
  let dx =
    particle.x -
    Math.max(circle.x, Math.min(particle.x, circle.x + circle.radius));
  let dy =
    particle.y -
    Math.max(circle.y, Math.min(particle.y, circle.y + circle.radius));
  return dx ** 2 + dy ** 2 < particle.radius ** 2;
}

// Update function for bouncing circle
function updateCircle() {
  // Apply friction
  smallCircle.velocityX *= smallCircle.friction;
  smallCircle.velocityY *= smallCircle.friction;

  // Bounce from the edges
  if (
    smallCircle.x + smallCircle.radius > canvas.width ||
    smallCircle.x - smallCircle.radius < 0
  ) {
    smallCircle.velocityX = -smallCircle.velocityX;
  }
  if (
    smallCircle.y + smallCircle.radius > canvas.height ||
    smallCircle.y - smallCircle.radius < 0
  ) {
    smallCircle.velocityY = -smallCircle.velocityY;
  }

  // Update position
  smallCircle.x += smallCircle.velocityX;
  smallCircle.y += smallCircle.velocityY;
}

// Generate color gradient based on distance from the small circle
function getColorGradient(distance) {
  // Calculate the color index based on the distance
  let colorIndex = Math.floor((distance / smallCircle.radius) * 255);

  // Adjust the color components based on the color index
  let r = 0 - colorIndex;
  let g = 256 - colorIndex;
  let b = 128;

  // Return the RGB color string
  return `rgb(${r},${g},${b})`;
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
*/
