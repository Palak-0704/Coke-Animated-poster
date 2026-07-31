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

let video;
anchor.onTargetFound=()=>{
    modelVisible=true;
    if(video){
        video.style.filter = "blur(6px)";
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
    /* createFizz(); */
    createFoam();

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
        /* if(fizz_active && fizz){
            fizz.position.y+=0.01;
            fizz.position.x+=Math.sin(Date.now()*0.05)*0.001;
        } */
        /* if (foamActive && foam) {
            foam.position.y += 0.002;
            if (foam.position.y > 0.7) {
                foam.visible = false;
                foamActive = false;
            }
        } */
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
        foam.visible = true;
        foamActive = true;

        bottleOpenSound.currentTime=0;
        bottleOpenSound.play();
        
        setTimeout(() => {
            colaFizzSound.currentTime = 0;
            colaFizzSound.play();
        }, 200);
        /* fizz.visible=true;
        fizz_active=true; */
    }  
})

//crreating fizz 
/* let fizz;
let fizz_active= false;

function createFizz(){
    const count =100;
    // Creating 3d stucture of particle
    const geometry = new THREE.BufferGeometry();

    const position = new Float32Array(count*3);
    for(let i=0;i<count;i++){
        position[i*3]=(Math.random()-0.5)*0.25;
        position[i*3+1]=Math.random()*0.8;
        position[i*3+2]=(Math.random()-0.5)*0.25;
    }
    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(position,3)
    );
    const material = new THREE.PointsMaterial({
        color:0xffffff,
        size:0.4,
        transparent:true,
        opacity:1
    });
    fizz = new THREE.Points(
        geometry,
        material
    );
    fizz.visible=false;
    fizz.position.set(0, 0.5, 0);
    /* fizz.scale.set(2, 2, 2); 
    anchor.group.add(fizz);
} */

let foam;
let foamActive = false;

/* function createFoam(){
    const geometry = new THREE.SphereGeometry(0.08, 16, 16);

    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });

    foam = new THREE.Mesh(geometry, material);

    foam.visible = false;

    foam.position.set(0, 0.5, 0);
    anchor.group.add(foam);
} */

function createFoam() {
    foam = new THREE.Group();

    for (let i = 0; i < 8; i++) {

        const geometry = new THREE.SphereGeometry(
            0.008 + Math.random() * 0.012,
            8,
            8
        );

        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        const bubble = new THREE.Mesh(
            geometry,
            material
        );

        // Bottle ke mouth ke around random position
        bubble.position.set(
            (Math.random() - 0.5) * 0.08,
            Math.random() * 0.06,
            (Math.random() - 0.5) * 0.03
        );

        foam.add(bubble);
    }

    foam.visible = false;

    foam.position.set(0, 0.35, -0.15);

    anchor.group.add(foam);
}