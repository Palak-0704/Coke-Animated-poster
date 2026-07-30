import * as THREE from "three"
import  {MindARThree} from "mind-ar/dist/mindar-image-three.prod.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

const mindarThree = new MindARThree({
    container: document.querySelector(".scan-frame"),
    imageTargetSrc: "/targets.mind",
});

const {renderer, scene, camera}=mindarThree;
const anchor = mindarThree.addAnchor(0);
const startBTn = document.querySelector("#startAR");
const loader= new GLTFLoader();

loader.load("/coca_cola_bottle.glb",(gltf)=>{
    const bottle= gltf.scene;
    anchor.group.add(bottle);
});
startBTn.addEventListener("click",async()=>{
    await mindarThree.start();
    startBTn.style.display="none";
    renderer.setAnimationLoop(()=>{
        renderer.render(scene,camera);
    });
});


