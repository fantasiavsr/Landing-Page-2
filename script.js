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

        // 0.8 is the percentage of the viewport height
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
    /* document.body.style.height = "100vh"; */
    /* document.body.style.position = "fixed"; */
    /* document.body.style.width = "100%"; */

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
        /* document.body.style.height = ""; */
        /* document.body.style.position = ""; */
        /* document.body.style.width = ""; */

        window.removeEventListener("scroll", disableScroll);
        document.removeEventListener("wheel", disableScroll);
        document.removeEventListener("touchmove", disableScroll);

        // Initialize Three.js after skeleton disappears
        initThreeJS();
    }, 2000); // Simulating 2s loading time
});

function initThreeJS() {
    const modelContainer = document.getElementById("modelContainer");
    if (!modelContainer) return;

    let modelScaleFactor = 1.4;
    let scene, camera, renderer, controls, pointLight;
    let modelLocation = "asset/iphone.glb";
    let mipmapEnvLocation = "asset/cayley_interior_1k.hdr";
    let isRotating = true; // Rotation state

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    modelContainer.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        50,
        modelContainer.clientWidth / modelContainer.clientHeight,
        1,
        1000
    ); // Field of view, aspect ratio, near, far
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

    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // Load HDR Environment
    new THREE.RGBELoader().load(mipmapEnvLocation, function (hdrmap) {
        hdrmap.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrmap; // Apply to scene

        // Load Model AFTER HDR is applied
        loadModel(hdrmap);
    });

    function loadModel(envMap) {
        if (modelLocation) {
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelLocation,
                (gltf) => {
                    const model = gltf.scene;
                    model.traverse((n) => {
                        if (n.isMesh) {
                            n.material.envMap = envMap; // Apply HDR to material
                            n.material.needsUpdate = true;
                        }
                    });
                    pivotGroup.add(model);
                    fitModelToScene(model);
                },
                undefined,
                (error) => {
                    console.error("Error loading model:", error);
                    createFallbackSphere(envMap);
                }
            );
        } else {
            createFallbackSphere(envMap);
        }
    }

    function createFallbackSphere(envMap) {
        const ballGeo = new THREE.SphereGeometry(50, 32, 32); // Smaller sphere for testing
        const ballMat = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            metalness: 0.9,
            roughness: 0.5,
            clearCoat: 1,
            clearCoatRoughness: 0.1,
            envMap: envMap
        });

        const ballMesh = new THREE.Mesh(ballGeo, ballMat);

        // Ensure the ball is centered in pivotGroup
        ballMesh.position.set(0, 0, 0);

        pivotGroup.add(ballMesh); // Add to rotating group

        fitModelToScene(ballMesh);
    }

    function fitModelToScene(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        object.position.sub(center); // Center the model

        // Scale the object proportionally
        const maxDim = Math.max(size.x, size.y, size.z);
        const fitSize = 200;
        const scaleFactor = (fitSize / maxDim) * modelScaleFactor;

        object.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Move the model slightly up
        object.position.y += 50; // Adjust this value as needed

        pivotGroup.add(object);
    }


    let rotationDirection = 1; // 1 for right, -1 for left
    // 1 = 180 degrees, 0.5 = 90 degrees, 2 = 360 degrees, etc.
    const minRotation = -Math.PI / 0.5;
    const maxRotation = Math.PI / 0.5; 
    //if want not limit rotation
    /* const minRotation = -Infinity;
    const maxRotation = Infinity; */
    // disable rotation
    /* isRotating = false; */

    const rotationSpeed = 0.002;

    function animate() {
        requestAnimationFrame(animate);

        if (isRotating) {
            pivotGroup.rotation.y += rotationSpeed * rotationDirection;

            // Reverse direction when hitting limits
            if (pivotGroup.rotation.y >= maxRotation || pivotGroup.rotation.y <= minRotation) {
                rotationDirection *= -1; // Reverse the rotation direction
            }
        }

        controls.update();
        renderer.render(scene, camera);
    }


    window.addEventListener("resize", () => {
        camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    });

    // ** UI Panel Controls **
    document.getElementById("zoomCamera").addEventListener("click", () => {
        if (pivotGroup.scale.x === 1) {
            pivotGroup.scale.set(1.5, 1.5, 1.5); // Scale up 2x
        } else {
            pivotGroup.scale.set(1, 1, 1); // Reset to default scale
        }
    });

    document.getElementById("toggleRotation").addEventListener("click", () => {
        isRotating = !isRotating;
    });

    animate();
}









