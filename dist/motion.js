import { BufferGeometry, Float32BufferAttribute, OrthographicCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from "./assets/three/three.module.js";

const canvas = document.getElementById("motes");
const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
const scene = new Scene();
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 5);
camera.position.z = 2;
const points = [];
for (let i = 0; i < 65; i++) points.push(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random());
const geometry = new BufferGeometry();
geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
const material = new ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { time: { value: 0 }, ratio: { value: Math.min(devicePixelRatio, 1.5) } },
  vertexShader: `uniform float time; uniform float ratio; varying float opacity;
    void main() {
      vec3 p = position;
      p.x += sin(time * .10 + p.z * 40.) * .018;
      p.y = mod(p.y + time * (.008 + p.z * .009) + 1., 2.) - 1.;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
      gl_PointSize = (1.6 + p.z * 2.4) * ratio;
      opacity = .28 + .32 * pow(sin(p.z * 31. + time * .45), 2.);
    }`,
  fragmentShader: `varying float opacity;
    void main() {
      float glow = 1. - smoothstep(.06, .5, length(gl_PointCoord - .5));
      gl_FragColor = vec4(1., .86, .56, glow * opacity);
    }`
});
scene.add(new Points(geometry, material));
renderer.setPixelRatio(material.uniforms.ratio.value);
new ResizeObserver(() => renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)).observe(canvas);
let inView = true;
const preference = matchMedia("(prefers-reduced-motion: reduce)");
function update() {
  canvas.hidden = preference.matches;
  renderer.setAnimationLoop(inView && !document.hidden && !preference.matches ? render : null);
}
let last = -100;
function render(ms) {
  if (ms - last < 32) return;
  last = ms;
  material.uniforms.time.value = ms / 1000;
  renderer.render(scene, camera);
}
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; update(); }).observe(canvas.parentElement);
document.addEventListener("visibilitychange", update);
preference.addEventListener("change", update);
