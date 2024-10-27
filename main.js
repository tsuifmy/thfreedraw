import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -2, // left
    window.innerWidth / 2, // right
    window.innerHeight / 2, // top
    window.innerHeight / -2, // bottom
    0.1, // near
    1000 // far
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);

let lines = [];
let isDrawing = false;
let currentPoints = [];
let currentLine;
let lastPointerPosition = null;
let lastPointerTime = null;

canvas.addEventListener('pointerdown', (event) => {
    isDrawing = true;
    const { x, y } = getMousePosition(event);
    lastPointerPosition = { x, y, clientX: event.clientX, clientY: event.clientY };
    lastPointerTime = performance.now();
  });
  
  canvas.addEventListener('pointermove', (event) => {
    if (isDrawing) {
      const currentTime = performance.now();
      const { x, y } = getMousePosition(event);
  
      const deltaX = event.clientX - lastPointerPosition.clientX;
      const deltaY = event.clientY - lastPointerPosition.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
      const timeDelta = currentTime - lastPointerTime;
      const speed = distance / timeDelta;
      const pressure = Math.max(0.1, Math.min(1, 1 / (speed + 0.1)));
  
      // 创建新的线段
      const points = [
        lastPointerPosition.x, lastPointerPosition.y, 0,
        x, y, 0
      ];
  
      const line = createLine(points, pressure);
      scene.add(line);
      lines.push(line);
  
      // 更新最后的指针位置和时间
      lastPointerPosition = { x, y, clientX: event.clientX, clientY: event.clientY };
      lastPointerTime = currentTime;
    }
  });
  
  canvas.addEventListener('pointerup', () => {
    isDrawing = false;
    lastPointerPosition = null;
    lastPointerTime = null;
  });
  
  function createLine(points, pressure) {
    const geometry = new LineGeometry();
    geometry.setPositions(points);
    const material = new LineMaterial({ color: 0x000000, linewidth: pressure * 10 });
    material.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(geometry, material);
    return line;
  }
  


function getMousePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * window.innerWidth - window.innerWidth / 2,
    y: -((event.clientY - rect.top) / rect.height) * window.innerHeight + window.innerHeight / 2,
  };
}


function updateLine(line, points, pressure) {
  line.geometry.setPositions(points);
  line.geometry.attributes.position.needsUpdate = true;
  line.geometry.computeBoundingSphere();
  line.computeLineDistances(); // 确保更新距离，使线段正确渲染
  line.material.linewidth = pressure * 10;
  line.material.resolution.set(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();


