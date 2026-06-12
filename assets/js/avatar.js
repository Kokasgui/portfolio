import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { degToRad } from "three/src/math/MathUtils.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import WebGL from "three/addons/capabilities/WebGL.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const canvas = document.querySelector("#canvas");
const canvasContainer = canvas.parentElement;

// Verifica se o browser suporta WebGL
if (WebGL.isWebGL2Available()) {
    // Caso exista, roda o three.js

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, canvas: canvas });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    // div.appendChild(renderer.domElement);

    /*
    const box = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(box, material);

    scene.add(mesh);
    */

    const light1 = new THREE.DirectionalLight(0xffffff, 2);
    const light1Helper = new THREE.DirectionalLightHelper(light1);

    light1.position.set(-3.36688, 5.62352, 4.35182);
    light1.rotation.set(degToRad(78.5204), 0, degToRad(30.0869));

    scene.add(light1);
    scene.add(light1Helper);

    const light2 = new THREE.DirectionalLight(0xb6b1b2, 3);
    const light2Helper = new THREE.DirectionalLightHelper(light2);

    light2.position.set(6.23226, 6.20467, 8.09388);
    light2.rotation.set(degToRad(91.3945), 0, degToRad(-35.739));

    scene.add(light2);
    scene.add(light2Helper);

    // const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.set(0, 2.25, 5);

    let target = new THREE.Vector3(0, 0, 0);

    const raycast = new THREE.Raycaster(camera.position, 0);

    window.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const mouseXNorm = canvas.clientWidth / 2 + canvas.getBoundingClientRect().x;
        const mouseYNorm = canvas.clientHeight / 4 + canvas.getBoundingClientRect().y;

        // raycast.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 3), 0);
        raycast.ray.intersectPlane(plane);
    });

    // camera.position.z = 5;

    renderer.setAnimationLoop(animate);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;

    const composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const pixelatedPass = new RenderPixelatedPass(2, scene, camera);
    pixelatedPass.depthEdgeStrength = 0;
    pixelatedPass.normalEdgeStrength = 0;
    composer.addPass(pixelatedPass);

    // Shader gerado pelo ChatGPT
    const posterizeShader = {
        uniforms: {
            tDiffuse: { value: null },
            levels: { value: 4.0 },
        },

        vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,

        fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float levels;
        varying vec2 vUv;
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb = floor(color.rgb * levels) / levels;
            gl_FragColor = color;
        }
        `,
    };
    const posterizePass = new ShaderPass(posterizeShader);
    posterizePass.uniforms.levels.value = 82;
    composer.addPass(posterizePass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    const loader = new GLTFLoader();
    loader.load(
        "./assets/avatar.glb",
        function (gltf) {
            scene.add(gltf.scene);
            scene.add(camera);

            // Tratamento dos ossos
            gltf.scene.getObjectByName("mixamorigHead").rotation.set(degToRad(10), 0, 0);
            gltf.scene.getObjectByName("mixamorigLeftArm").rotation.set(degToRad(70), 0, degToRad(4.83884));
            gltf.scene.getObjectByName("mixamorigLeftForeArm").rotation.set(degToRad(6.90126), 0, degToRad(6.90126));
            gltf.scene.getObjectByName("mixamorigRightArm").rotation.set(degToRad(70), 0, degToRad(-4.83884));
            gltf.scene.getObjectByName("mixamorigRightForeArm").rotation.set(degToRad(6.90126), 0, degToRad(-6.90126));
        },
        undefined,
        function (error) {
            console.error(error);
        },
    );

    function animate() {
        // console.log("lol");
        // canvas.style.width = canvasContainer.clientWidth;
        // canvas.style.height = canvasContainer.clientHeight;

        // mesh.rotation.set((mesh.rotation.x += 1), (mesh.rotation.y += 1), (mesh.rotation.z += 1));

        // renderer.render();
        composer.render();
    }
} else {
    // Caso não, mostra o PNG

    const img = document.createElement("img");
    img.src = "./assets/images/avatar.png";
    img.alt = "ISTO É UM TEXTO ALTERNATIVO!!!";
}
