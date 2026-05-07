import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#suzanneCanvas");

if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  const modelRoot = new THREE.Group();
  const pointer = { x: 0, y: 0 };
  const rotation = { x: 0, y: 0 };
  let animationFrame = 0;

  camera.position.set(0, 0.08, 5.8);
  scene.add(modelRoot);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a160d, 2.4));

  const keyLight = new THREE.DirectionalLight(0xffd7a6, 3.2);
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x6aa4ff, 1.2);
  rimLight.position.set(-3, 1.5, -2);
  scene.add(rimLight);

  function resizeRenderer() {
    const { width, height } = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(width));
    const nextHeight = Math.max(1, Math.round(height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(nextWidth, nextHeight, false);
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
  }

  function frameModel(model) {
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z) || 1;

    model.position.sub(center);
    modelRoot.scale.setScalar(2.45 / maxSize);
  }

  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    pointer.x = Math.max(-1, Math.min(1, (clientX - centerX) / (window.innerWidth / 2)));
    pointer.y = Math.max(-1, Math.min(1, (clientY - centerY) / (window.innerHeight / 2)));
  }

  function resetPointer() {
    pointer.x = 0;
    pointer.y = 0;
  }

  new GLTFLoader().load(
    "models/sheep.glb",
    (gltf) => {
      const model = gltf.scene;
      frameModel(model);
      modelRoot.add(model);
    },
    undefined,
    (error) => {
      console.warn("Could not load models/sheep.glb", error);
    }
  );

  function animate() {
    rotation.y += (pointer.x * 0.58 - rotation.y) * 0.08;
    rotation.x += (pointer.y * 0.34 - rotation.x) * 0.08;
    modelRoot.rotation.set(rotation.x, rotation.y, 0);
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }

  function startRendering() {
    if (!animationFrame) {
      animate();
    }
  }

  function stopRendering() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  resizeRenderer();
  startRendering();

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      startRendering();
    } else {
      stopRendering();
    }
  });
  visibilityObserver.observe(canvas);

  window.addEventListener("resize", resizeRenderer);
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    updatePointer(event.clientX, event.clientY);
  }, { passive: true });
  document.addEventListener("pointerleave", resetPointer);
}
