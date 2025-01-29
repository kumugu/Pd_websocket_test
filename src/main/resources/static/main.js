import * as THREE from './node_modules/three/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threejs-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(geometry, material);
scene.add(player);

const otherPlayers = {};

const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
scene.add(floor);

camera.position.z = 5;
camera.position.y = 2;

let speed = { x: 0, z: 0 };

const gameSocket = new WebSocket('ws://localhost:8080/game');

gameSocket.onopen = () => {
    console.log('Connected to WebSocket server');
};

gameSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (!otherPlayers[data.id]) {
        const otherPlayerGeometry = new THREE.BoxGeometry();
        const otherPlayerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const otherPlayer = new THREE.Mesh(otherPlayerGeometry, otherPlayerMaterial);
        scene.add(otherPlayer);
        otherPlayers[data.id] = otherPlayer;
    }
    otherPlayers[data.id].position.x = data.position.x;
    otherPlayers[data.id].position.z = data.position.z;
};

gameSocket.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

// 키 입력 이벤트 처리
window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') speed.z = -0.1;
    if (event.key === 'ArrowDown') speed.z = 0.1;
    if (event.key === 'ArrowLeft') speed.x = -0.1;
    if (event.key === 'ArrowRight') speed.x = 0.1;
});

window.addEventListener('keyup', () => {
    speed.x = 0;
    speed.z = 0;
});

function animate() {
    requestAnimationFrame(animate);

    player.position.x += speed.x;
    player.position.z += speed.z;

    gameSocket.send(JSON.stringify({
        id: gameSocket.id,
        position: { x: player.position.x, z: player.position.z }
    }));

    renderer.render(scene, camera);
}
animate();