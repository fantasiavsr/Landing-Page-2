document.addEventListener("scroll", function () {
    const videoWrapper = document.querySelector(".video-wrapper");
    const scrollY = window.scrollY;
    const screenWidth = window.innerWidth;

    // Disable animation if screen width is <= 768px (mobile size)
    if (screenWidth <= 768) {
        videoWrapper.style.width = "100%"; // Keep full width on mobile
        return; // Stop execution
    }

    // Define min and max width for larger screens
    const minWidth = 600; // Minimum width in pixels
    const maxWidth = screenWidth; // Maximum width as 100% of viewport width

    // Calculate new width dynamically based on scroll
    let newWidth = Math.min(maxWidth, Math.max(minWidth, (30 + scrollY / 10) * screenWidth / 100));

    // Apply the calculated width
    videoWrapper.style.width = newWidth + "px";
});


const lenis = new Lenis({
    duration: 0.8, // Lower value = more responsive scrolling
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smooth: true,
    direction: "vertical",
    smoothTouch: false,
    syncScroll: true,  // 🟢 Makes scrolling feel more real-time
});

function raf(time) {
    lenis.raf(time);
    window.requestAnimationFrame(raf); // 🟢 Ensures smoother refresh rates
}

window.requestAnimationFrame(raf);

const header = document.querySelector("header");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    let currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        // 🛑 Hide header when scrolling down
        header.style.transform = "translateY(-100%)";
    } else {
        // ✅ Show header with a gap from the top
        header.style.transform = "translateY(10px)"; // Adjust the value as needed
    }

    lastScrollY = currentScrollY;
});

document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".style_burger");
    const mobileNav = document.querySelector(".mobileNav");

    burger.addEventListener("click", function () {
        mobileNav.classList.toggle("active");
    });
});

document.addEventListener("scroll", function () {
    const words = document.querySelectorAll(".style_heroTitle2 span");
    const windowHeight = window.innerHeight;

    words.forEach((word, index) => {
        const wordPosition = word.getBoundingClientRect().top;

        if (wordPosition < windowHeight * 0.8) {
            setTimeout(() => {
                word.classList.add("visible");
            }, index * 150); // Delay effect per word
        } else {
            word.classList.remove("visible"); // Remove when scrolling up
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    // Disable scrolling completely
    /* document.documentElement.style.overflow = "hidden"; */
    /* document.body.style.overflow = "hidden"; */
    document.body.style.height = "100vh";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";

    function disableScroll(event) {
        event.preventDefault();
    }

    // Disable all scroll events
    window.addEventListener("scroll", disableScroll, { passive: false });
    document.addEventListener("wheel", disableScroll, { passive: false });
    document.addEventListener("touchmove", disableScroll, { passive: false });

    setTimeout(() => {
        // Hide skeletons
        document.querySelectorAll(".skeleton").forEach(el => el.style.display = "none");

        // Show actual content
        document.querySelectorAll(".hidden").forEach(el => el.classList.remove("hidden"));

        // Re-enable scrolling
        /* document.documentElement.style.overflow = ""; */
        /* document.body.style.overflow = ""; */
        document.body.style.height = "";
        document.body.style.position = "";
        document.body.style.width = "";

        window.removeEventListener("scroll", disableScroll);
        document.removeEventListener("wheel", disableScroll);
        document.removeEventListener("touchmove", disableScroll);

        // Initialize Three.js after skeleton disappears
        initThreeJS();
    }, 2000); // Simulating 2s loading time
});


function initThreeJS1() {
    const modelContainer = document.getElementById("modelContainer");

    // Ensure container is visible before setting up Three.js
    if (!modelContainer) return;

    // Create scene
    const scene = new THREE.Scene();

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
        12,
        modelContainer.clientWidth / modelContainer.clientHeight,
        1,
        500
    );
    camera.position.set(0, 25, 25);

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });
    renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    modelContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xfffbe1, 4);
    sunLight.position.set(10, 50, 20);
    sunLight.castShadow = true;
    scene.add(sunLight);
    const skyLight = new THREE.HemisphereLight(0xcce6ff, 0xffffff, 1);
    scene.add(skyLight);
    const bottomLight = new THREE.PointLight(0xffcc88, 2, 100);
    bottomLight.position.set(-4, -10, 0);
    scene.add(bottomLight);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 3;

    // Load GLTF model
    const loader = new THREE.GLTFLoader();
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    loader.load("asset/iphone.glb", (gltf) => {
        const model = gltf.scene;
        scaleValue = 0.5;
        model.scale.set(scaleValue, scaleValue, scaleValue);
        model.traverse(n => {
            if (n.isMesh) {
                n.castShadow = true;
                n.receiveShadow = true;
            }
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        pivotGroup.add(model);
        animate();
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        pivotGroup.rotation.y += 0.005;
        controls.update();
        renderer.render(scene, camera);
    }

    // Handle resize
    window.addEventListener("resize", () => {
        camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    });
}

function initThreeJS() {
    const modelContainer = document.getElementById("modelContainer");

    if (!modelContainer) return;

    // Define adjustable model scaling factor
    let modelScaleFactor = 1.2; // Change this value to adjust the model size

    let scene, camera, renderer, controls, pointLight, modelLocation = "asset/iphone.glb";

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    modelContainer.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        50,
        modelContainer.clientWidth / modelContainer.clientHeight,
        1,
        1000
    );
    camera.position.set(0, -50, 500); // x = left/right, y = up/down, z = forward/backward

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 3;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(200, 200, 200);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    function loadModel() {
        if (modelLocation) {
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelLocation,
                (gltf) => {
                    const model = gltf.scene;
                    pivotGroup.add(model);
                    fitModelToScene(model);
                },
                undefined,
                (error) => {
                    console.error("Error loading model:", error);
                    createFallbackSphere();
                }
            );
        } else {
            createFallbackSphere();
        }
    }

    function createFallbackSphere() {
        const ballGeo = new THREE.SphereGeometry(100, 64, 64);
        const ballMat = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            metalness: 0.5,
            roughness: 0.5,
        });
        const ballMesh = new THREE.Mesh(ballGeo, ballMat);
        pivotGroup.add(ballMesh);
        fitModelToScene(ballMesh);
    }

    function fitModelToScene(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        object.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fitSize = 200; // Desired model size
        const scaleFactor = (fitSize / maxDim) * modelScaleFactor;
        object.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    function animate() {
        requestAnimationFrame(animate);
        pivotGroup.rotation.y += 0.005;
        controls.update();
        renderer.render(scene, camera);
    }

    window.addEventListener("resize", () => {
        camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    });

    loadModel();
    animate();
}










