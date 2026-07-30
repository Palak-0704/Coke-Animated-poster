import * as THREE from "three"
import  {MindARThree} from "mind-ar/dist/mindar-image-three.prod.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

const mindarThree = new MindARThree({
    container: document.querySelector(".scan-frame"),
    imageTargetSrc: "/targets.mind",
});

const {renderer, scene, camera}=mindarThree;
const anchor = mindarThree.addAnchor(0);

//add lighting 
const ambientLight = new THREE.AmbientLight(0xffffff,2);
scene.add(ambientLight);
const directionLight = new THREE.DirectionalLight(0xffffff,3);
directionLight.position.set(1,2,3);
scene.add(directionLight);


const startBTn = document.querySelector("#startAR");
const loader= new GLTFLoader();

loader.load("/coca_cola_bottle.glb",(gltf)=>{
    const bottle= gltf.scene;
    bottle.scale.set(2,2,2);
    bottle.position.set(0,0,0);
    
    bottle.rotation.y=Math.PI;
    anchor.group.add(bottle);
});
startBTn.addEventListener("click",async()=>{
    await mindarThree.start();
    startBTn.style.display="none";
    renderer.setAnimationLoop(()=>{
        renderer.render(scene,camera);
    });
});


