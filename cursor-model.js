import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#customCursor");
const cursorModelColor = "#ffffff";

if (canvas && window.matchMedia("(pointer: fine)").matches) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  const loader = new GLTFLoader();
  const modelRoot = new THREE.Group();
  const models = new Map();
  const pointer = { x: 0, y: 0, velocityX: 0, velocityY: 0 };
  const rotation = { x: 0, y: 0, z: 0 };

  let activeModel = null;
  let cursorFrame = 0;
  let isClicking = false;
  let previousX = 0;
  let previousY = 0;
  let hasPreviousPointer = false;
  const modelOpacity = 0.8;

  camera.position.set(0, 0, 5);
  scene.add(modelRoot);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3028, 2.2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
  keyLight.position.set(2.8, 3.2, 4);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9ec9ff, 1.4);
  rimLight.position.set(-3, 1.4, -2);
  scene.add(rimLight);

  function resizeRenderer() {
    const size = Math.max(1, Math.round(canvas.getBoundingClientRect().width));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  function frameModel(model) {
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z) || 1;

    model.position.sub(center);
    model.scale.setScalar(2.45 / maxSize);
  }

  function makeModelTransparent(model) {
    applyModelColor(model, cursorModelColor);

    model.traverse((child) => {
      if (!child.isMesh) return;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = modelOpacity;
        material.depthWrite = false;
        material.needsUpdate = true;
      });
    });
  }

  function applyModelColor(model, colorValue) {
    if (!model) return;

    const color = new THREE.Color(colorValue);
    model.traverse((child) => {
      if (!child.isMesh) return;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.color) {
          material.color.copy(color);
        }
        material.needsUpdate = true;
      });
    });
  }

  function showModel(name) {
    const nextModel = models.get(name);
    if (!nextModel || activeModel === nextModel) return;

    if (activeModel) {
      modelRoot.remove(activeModel);
    }

    activeModel = nextModel;
    modelRoot.add(activeModel);
  }

  function loadModel(name, path) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          frameModel(model);
          makeModelTransparent(model);
          models.set(name, model);
          resolve(model);
        },
        undefined,
        reject
      );
    });
  }

  function moveCursor(event) {
    if (hasPreviousPointer) {
      pointer.velocityX = THREE.MathUtils.clamp((event.clientX - previousX) / 80, -1, 1);
      pointer.velocityY = THREE.MathUtils.clamp((event.clientY - previousY) / 80, -1, 1);
    }

    previousX = event.clientX;
    previousY = event.clientY;
    hasPreviousPointer = true;

    pointer.x = event.clientX / window.innerWidth - 0.5;
    pointer.y = event.clientY / window.innerHeight - 0.5;
    canvas.style.setProperty("--cursor-x", `${event.clientX}px`);
    canvas.style.setProperty("--cursor-y", `${event.clientY}px`);
    canvas.classList.add("is-visible");
  }

  function animate() {
    const targetY = pointer.x * 1.9 + pointer.velocityX * 0.58;
    const targetX = -pointer.y * 1.35 - pointer.velocityY * 0.42;
    const targetZ = pointer.velocityX * -0.34 + (isClicking ? -0.24 : 0);

    rotation.y += (targetY - rotation.y) * 0.15;
    rotation.x += (targetX - rotation.x) * 0.15;
    rotation.z += (targetZ - rotation.z) * 0.18;
    pointer.velocityX *= 0.86;
    pointer.velocityY *= 0.86;
    modelRoot.rotation.set(rotation.x, rotation.y, rotation.z);
    modelRoot.scale.setScalar(isClicking ? 0.86 : 1);
    renderer.render(scene, camera);
    cursorFrame = requestAnimationFrame(animate);
  }

  Promise.all([
    loadModel("default", "models/wata.glb"),
    loadModel("click", "models/wata1.glb"),
  ]).then(() => {
    resizeRenderer();
    showModel("default");
    document.documentElement.classList.add("has-custom-cursor");
    animate();
  }).catch((error) => {
    console.warn("Could not load 3D cursor models", error);
  });

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    moveCursor(event);
  }, { passive: true });

  window.addEventListener("pointerdown", () => {
    isClicking = true;
    canvas.classList.add("is-clicking");
    showModel("click");
  });

  window.addEventListener("pointerup", () => {
    isClicking = false;
    canvas.classList.remove("is-clicking");
    showModel("default");
  });

  window.addEventListener("blur", () => {
    isClicking = false;
    canvas.classList.remove("is-clicking");
    showModel("default");
  });

  document.addEventListener("pointerleave", () => {
    canvas.classList.remove("is-visible", "is-clicking");
    isClicking = false;
    showModel("default");
  });

  window.addEventListener("resize", resizeRenderer);
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(cursorFrame);
    renderer.dispose();
  });
}
