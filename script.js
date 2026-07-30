import * as THREE from "three"
import  {MindARThree} from "mind-ar/dist/mindar-image-three.prod.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import { L } from "mind-ar/dist/controller-mGt1s8dJ";

const mindarThree = new MindARThree({
    container: document.querySelector(".scan-frame"),
    imageTargetSrc: "/targets.mind",
});

const {renderer, scene, camera}=mindarThree;
const anchor = mindarThree.addAnchor(0);
anchor.onTargetFound=()=>{
    modelVisible=true;
};
anchor.onTargetLost=()=>{
    modelVisible=false;
};

//add lighting 
const ambientLight = new THREE.AmbientLight(0xffffff,2);
scene.add(ambientLight);
const directionLight = new THREE.DirectionalLight(0xffffff,3);
directionLight.position.set(1,2,3);
scene.add(directionLight);


const startBTn = document.querySelector("#startAR");
/* const video= document.querySelector("video"); */
const loader= new GLTFLoader();

let bottle;
let modelVisible=false;
loader.load("/coca_cola_bottle.glb",(gltf)=>{
    bottle= gltf.scene;
    bottle.traverse((child)=>{
        if(child.isMesh){
            if(child.name==="Cube_Background_0"){
                child.visible=false;
            }
        }
    });
    bottle.scale.set(2,2,2);
    bottle.position.set(0,-0.5,0);
    
    bottle.rotation.y=Math.PI;
    anchor.group.add(bottle);
});
/* 
anchor.group.addEventListener("targetFound",()=>{
    modelVisible=true;
    document.querySelector("video").style.filter="blur(6px)";
});
anchor.group.addEventListener("targetLost",()=>{
    modelVisible=false;
    document.querySelector("video").style.filter="none";
}); 

anchor.onTargetFound=()=>{
         modelVisible= true;
    document.querySelector("video").style.filter="blur(6px)";
};
anchor.onTargetLost=()=>{
    modelVisible= false;
    document.querySelector("video").style.filter="none";
}; */
startBTn.addEventListener("click",async()=>{
    await mindarThree.start();
    startBTn.style.display="none";
    renderer.setAnimationLoop(()=>{
        if(bottle){
            bottle.rotation.y+=0.015;
        }
        /* if(modelVisible){
             video.style.filter="blur(6px)";
        }
        else{
              video.style.filter="none";   
        } */
        renderer.render(scene,camera);
    });
});


// cap open
let cap;
cap= bottle.getObjectByName("Circle002_Lid_0");
cap.userData.originalPosition = cap.position.clone();

const raycaster= new THREE.Raycaster();
const mouse = new THREE.Vector2();

const frame = document.querySelector(".scan-frame");
frame.addEventListener("click",(event)=>{
    if(!bottle || !cap){
        return;
    }
    const rect = renderer.docElement.getBoundingClientRect();
    mouse.x=((event.clientX-rect.left)/rect.width)*2-1;  
     mouse.y=-((event.clientY-rect.top)/rect.height)*2-1;
    raycaster.setFromCamera(mouse,camera);
    const intersects =raycaster.intersectObject(cap,true);
    if(intersects.length>0){
        cap.position.y+=0.3;
    }  
})