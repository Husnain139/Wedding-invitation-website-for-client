import {
  BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, PerspectiveCamera,
  PlaneGeometry, Points, Scene, ShaderMaterial, SRGBColorSpace, TextureLoader, WebGLRenderer
} from "./assets/three/three.module.js";

const canvas = document.getElementById("motes");
const hero = document.getElementById("invitation");
const actors = hero.querySelector(".actors");
const preference = matchMedia("(prefers-reduced-motion: reduce)");
const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
const scene = new Scene();
const camera = new PerspectiveCamera(36, 1, 1, 4000);
const time = { value: 0 };
const artwork = await new TextureLoader().loadAsync("./assets/couple.webp");
artwork.colorSpace = SRGBColorSpace;
const costume = new MeshBasicMaterial({ map: artwork, transparent: true, depthWrite: false });
costume.onBeforeCompile = shader => {
  shader.uniforms.animationTime = time;
  shader.vertexShader = "uniform float animationTime;\n" + shader.vertexShader.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
     float veil = (1.0 - smoothstep(.03, .46, uv.x)) * sin(uv.y * 3.14159);
     float wind = sin(uv.y * 10.0 + animationTime * 2.1);
     transformed.x += veil * (.028 * wind + .015 * sin(animationTime * 1.6 + uv.x * 12.0));
     transformed.y += veil * .014 * cos(uv.y * 8.0 + animationTime * 2.1);
     transformed.z += veil * .065 * wind;
     float upper = smoothstep(.28, .89, uv.y);
     transformed.y += upper * .0034 * sin(animationTime * 1.45 + uv.x * 4.0);
     transformed.x += upper * .005 * sin(animationTime * .9 + uv.x * 7.0);`
  );
};
const couple = new Mesh(new PlaneGeometry(1, 1, 44, 52), costume);
scene.add(couple);

// Petals occupy different distances from the camera and turn edge-on as they fall.
const coordinates = [];
for (let i = 0; i < 46; i++) coordinates.push(Math.random(), Math.random(), Math.random());
const seeds = new BufferGeometry();
seeds.setAttribute("position", new Float32BufferAttribute(coordinates, 3));
const petals = new ShaderMaterial({
  uniforms: { time, scroll: { value: 0 }, ratio: { value: renderer.getPixelRatio() } },
  transparent: true, depthTest: false, depthWrite: false,
  vertexShader: `uniform float time, scroll, ratio; varying float turn, kind, alpha;
    void main() {
      float depth = position.z;
      float v = fract(position.y - time * (.014 + .014 * depth) + scroll * (.08 + .12 * depth));
      float u = fract(position.x + time * .008 + sin(time*.32 + position.y*40.)*.02);
      gl_Position = vec4(u*2.-1.,v*2.-1.,0.,1.);
      turn = time * (.7 + depth) + position.x * 32.;
      kind = step(.45,depth);
      gl_PointSize = (2. + depth * 9.) * ratio;
      alpha = .28 + .45 * depth;
    }`,
  fragmentShader: `varying float turn, kind, alpha;
    void main() {
      vec2 p = (gl_PointCoord-.5)*2.;
      p = mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p;
      float edge = length(vec2(p.x / mix(.9,.39+.25*abs(sin(turn)),kind),p.y));
      float a = (1.-smoothstep(.38,.94,edge))*alpha;
      gl_FragColor=vec4(mix(vec3(1.,.91,.71),vec3(.99,.75,.85),kind),a);
    }`
});
const blossoms = new Points(seeds, petals);
blossoms.frustumCulled = false;
blossoms.renderOrder = 2;
scene.add(blossoms);
let width, height, anchorX, anchorY;
function size() {
  width = hero.clientWidth;
  height = hero.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = height / (2 * Math.tan(Math.PI / 10));
  camera.updateProjectionMatrix();
  const aspect = artwork.image.width / artwork.image.height;
  const h = Math.min(actors.offsetHeight, actors.offsetWidth / aspect);
  couple.scale.set(h * aspect, h, h);
  anchorX = actors.offsetLeft + actors.offsetWidth / 2 - width / 2;
  anchorY = height / 2 - actors.offsetTop - actors.offsetHeight / 2;
}
new ResizeObserver(size).observe(hero);
size();
let inView = true;
let last = -100;
function render(ms) {
  if (ms - last < 32) return;
  last = ms;
  time.value = ms / 1000;
  const travel = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / height));
  petals.uniforms.scroll.value = travel;
  couple.position.set(anchorX + travel * width * .02, anchorY - travel * height * .09, travel * 38);
  couple.rotation.y = .025 * Math.sin(time.value * .45) + travel * .14;
  renderer.render(scene, camera);
  if (!actors.classList.contains("webgl")) actors.classList.add("webgl");
}
function update() {
  canvas.hidden = preference.matches;
  if (preference.matches) actors.classList.remove("webgl");
  renderer.setAnimationLoop(inView && !document.hidden && !preference.matches ? render : null);
}
canvas.addEventListener("webglcontextlost", () => {
  renderer.setAnimationLoop(null);
  actors.classList.remove("webgl");
});
canvas.addEventListener("webglcontextrestored", update);
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; update(); }).observe(hero);
document.addEventListener("visibilitychange", update);
preference.addEventListener("change", update);
update();
