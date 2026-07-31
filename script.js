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

const bottleOpenSound = new Audio("/bottle_opening.mp3");
const colaFizzSound = new Audio("/coke_fizz.mp3");


const colaText= document.querySelector("#colaText");
let video;
anchor.onTargetFound=()=>{
    modelVisible=true;
    if(video){
        video.style.filter = "blur(6px)";
    }
    if(colaText){
        colaText.style.display="none";
    }
};
anchor.onTargetLost=()=>{
    modelVisible=false;
    if(video){
        video.style.filter = "none";
    }
};
let bottle;
let modelVisible=false;
let cap;
let capOpen = false;
let capVelocityY = 0;
let capVelocityX = 0;
let capFlying = false;

loader.load("/coca_cola_bottle.glb", (gltf) => {

    bottle = gltf.scene;

    cap = bottle.getObjectByName("Circle002_Lid_0");

    // Bottle ki original settings
    bottle.scale.set(2, 2, 2);
    bottle.position.set(0, -0.5, 0);
    bottle.rotation.y = Math.PI;

    // Bottle ko pehle anchor mein add karo
    anchor.group.add(bottle);

    

    // Background hide
    bottle.traverse((child) => {
        if (child.isMesh && child.name === "Cube_Background_0") {
            child.visible = false;
        }
    });

});
startBTn.addEventListener("click",async()=>{
    await mindarThree.start();
    video = document.querySelector(".scan-frame video");
    startBTn.style.display="none";
    renderer.setAnimationLoop(()=>{
        if(bottle && !capOpen){
            bottle.rotation.y+=0.015;
        }
        if(capFlying && cap){
            cap.position.y +=capVelocityY;

            cap.position.x+=capVelocityX;
            cap.rotation.x += 0.18;
            cap.rotation.y += 0.12;
            cap.rotation.z += 0.08;
        }
        renderer.render(scene,camera);
    });
});


// cap open

const raycaster= new THREE.Raycaster();
const mouse = new THREE.Vector2();

const frame = document.querySelector(".scan-frame");
frame.addEventListener("click",(event)=>{
    if(!bottle || !cap){
        return;
    }
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x=((event.clientX-rect.left)/rect.width)*2-1;  
    mouse.y=-((event.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const intersects =raycaster.intersectObject(bottle,true);

    if(intersects.length>0 && !capOpen){
        anchor.group.attach(cap);

        capVelocityY = 0.08;
        capVelocityX=0;

        capOpen=true;
        capFlying=true;

        colaText.style.display="block";
        bottleOpenSound.currentTime=0;
        bottleOpenSound.play();
        
        setTimeout(() => {
            colaFizzSound.currentTime = 0;
            colaFizzSound.play();
        }, 200);
    }  
})

