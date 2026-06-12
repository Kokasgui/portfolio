import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#laptop");

const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
// document.body.appendChild(renderer.domElement);

camera.position.z = 5;
camera.setRotationFromEuler(new THREE.Euler());
// camera.zoom

// const light1 = new THREE.light();

loader.load(
    "./assets/laptop.glb",
    function (gltf) {
        scene.add(gltf.scene);
        const glftCamera = gltf.scene.getObjectByName("Camera");

        glftCamera.position.set(-0.58, 0.5, 0.7);
        glftCamera.rotation.set(-2.61, -0.6, -2.81);

        // console.log(gltf.parser.json.extensionsUsed);

        const light1Orig = gltf.scene.getObjectByName("Sun");
        const light2Orig = gltf.scene.getObjectByName("Sun001");

        // console.log(light1, light2);

        const light1 = new THREE.DirectionalLight(0xffffff, 2);
        light1.position.copy(light1Orig.position);
        light1.rotation.copy(light1Orig.rotation);
        light1.scale.copy(light1Orig.scale);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 2);
        light2.position.copy(light2Orig.position);
        light2.rotation.copy(light2Orig.rotation);
        light2.scale.copy(light2Orig.scale);
        scene.add(light2);

        // const controls = new OrbitControls(glftCamera, renderer.domElement);
        // controls.update() must be called after any manual changes to the camera's transform
        // controls.update();

        // light1.intensity = 1;
        // light2.intensity = 1;

        // scene.add(light1);
        // scene.add(light2);

        function animate(time) {
            // required if controls.enableDamping or controls.autoRotate are set to true
            // controls.update();
            renderer.render(scene, glftCamera);

            // console.log(glftCamera.position, glftCamera.rotation);
        }

        renderer.setAnimationLoop(animate);
    },
    undefined,
    function (error) {
        console.error(error);
    },
);
