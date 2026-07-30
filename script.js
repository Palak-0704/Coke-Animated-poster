import * as THREE from "three"
import  {MindARThree} from "mind-ar/dist/mindar-image-three.prod.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";


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
let cap;
let capOpen=false;
let capVelocity= 0;
/* loader.load("/coca_cola_bottle.glb",(gltf)=>{

    bottle= gltf.scene;
    
    cap = bottle.getObjectByName("Circle002_Lid_0");

    
    bottle.scale.set(2,2,2);
    bottle.position.set(0,-0.5,0);
    bottle.rotation.y=Math.PI;


    const capPosition = new THREE.Vector3();
    cap.getWorldPosition(capPosition);
    
    bottle.remove(cap);

    anchor.group.add(cap);

    anchor.worldToLocal(capPosition);
    
    cap.position.copy(capPosition);

    bottle.traverse((child)=>{
        if(child.isMesh){
            if(child.name==="Cube_Background_0"){
                child.visible=false;
            }
        }
    });
    anchor.group.add(bottle);
}); */
/* loader.load("/coca_cola_bottle.glb", (gltf) => {

    bottle = gltf.scene;

    // Cap find karo
    cap = bottle.getObjectByName("Circle002_Lid_0");

    // Cap ki original local transform save karo
    const capPosition = cap.position.clone();
    const capRotation = cap.rotation.clone();
    const capScale = cap.scale.clone();

    // Cap ko bottle se remove karo
    bottle.remove(cap);

    // Cap ko anchor mein add karo
    anchor.group.add(cap);

    cap.scale.set(1,1,1);

    // Cap ki transform restore karo
    cap.position.copy(capPosition);
    cap.rotation.copy(capRotation);
    cap.scale.copy(capScale);


    // Background hide
    bottle.traverse((child) => {
        if (child.isMesh) {
            if (child.name === "Cube_Background_0") {
                child.visible = false;
            }
        }
    });


    // Bottle
    bottle.scale.set(2, 2, 2);
    bottle.position.set(0, -0.5, 0);
    bottle.rotation.y = Math.PI;

    anchor.group.add(bottle);

}); */
loader.load("/coca_cola_bottle.glb", (gltf) => {

    bottle = gltf.scene;

    cap = bottle.getObjectByName("Circle002_Lid_0");

    // Bottle ki original settings
    bottle.scale.set(2, 2, 2);
    bottle.position.set(0, -0.5, 0);
    bottle.rotation.y = Math.PI;

    // Bottle ko pehle anchor mein add karo
    anchor.group.add(bottle);

    // Ab cap ko bottle se nikaal kar
    // uski WORLD position/rotation/scale preserve karo
    anchor.group.attach(cap);

    // Background hide
    bottle.traverse((child) => {
        if (child.isMesh && child.name === "Cube_Background_0") {
            child.visible = false;
        }
    });

});

startBTn.addEventListener("click",async()=>{
    await mindarThree.start();
    startBTn.style.display="none";
    renderer.setAnimationLoop(()=>{
        if(bottle && !capOpen){
            bottle.rotation.y+=0.015;
        }
        if(capOpen && cap){
            cap.position.y +=capVelocity;
            capVelocity -=0.01;
            if(capVelocity<=0){
                capVelocity=0;
            }
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
        capVelocity=0.1;
        capOpen=true;
    }  
})