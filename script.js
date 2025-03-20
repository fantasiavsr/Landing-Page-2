document.addEventListener("scroll", function () {
    const videoWrapper = document.querySelector(".video-wrapper");
    const scrollY = window.scrollY;
    const screenWidth = window.innerWidth;

    // Disable animation if screen width is <= 768px (mobile size)
    if (screenWidth <= 768) {
        videoWrapper.style.width = "100vw"; // Keep full width on mobile
        videoWrapper.style.borderRadius = "0";
        return; // Stop execution
    }

    // Define min and max width for larger screens
    /* const minWidth = 50; // Minimum width in pixels
    const maxWidth = screenWidth; // Maximum width as 100% of viewport width */
    const minVW = 46; // Start at 30vw (30% of screen width)
    const maxVW = 100; // Expand to 100vw (full screen)
    const minRadius = 23; // Start with 23px border-radius
    const maxRadius = 0; // Reduce to 0px when fullscreen

    // Calculate new width dynamically based on scroll
    /* let newWidth = Math.min(maxWidth, Math.max(minWidth, (30 + scrollY / 10) * screenWidth / 100)); */
    let newVW = Math.min(maxVW, Math.max(minVW, minVW + scrollY / 10));

    // Calculate border-radius dynamically based on progress
    let progress = (newVW - minVW) / (maxVW - minVW); // Normalize progress (0 to 1)
    let newRadius = minRadius * (1 - progress); // Decrease radius gradually

    // Apply the calculated width
    /* videoWrapper.style.width = newWidth + "px"; */
    videoWrapper.style.width = newVW + "vw";
    videoWrapper.style.borderRadius = newRadius + "px";
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

        // Dynamically adjust thresholds based on index
        const baseThreshold = 1; // Starting threshold
        const step = 0.05; // How much each word's threshold changes

        const threshold1 = windowHeight * (baseThreshold - index * step);
        const threshold2 = windowHeight * (baseThreshold - index * step - 0.2); // Second threshold, slightly lower

        if (wordPosition < threshold2) {
            word.style.opacity = "1"; // Fully visible
        } else if (wordPosition < threshold1) {
            word.style.opacity = "0.5"; // Half visible
        } else {
            word.style.opacity = "0.05"; // Barely visible
        }
    });
});

/* skeleton load */
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
    /* window.addEventListener("scroll", disableScroll, { passive: false });
    document.addEventListener("wheel", disableScroll, { passive: false });
    document.addEventListener("touchmove", disableScroll, { passive: false }); */

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

        /* window.removeEventListener("scroll", disableScroll);
        document.removeEventListener("wheel", disableScroll);
        document.removeEventListener("touchmove", disableScroll); */

        // Initialize Three.js after skeleton disappears
        /* initThreeJS(); */
    }, 1000); // Simulating 2s loading time
});

function initThreeJS(containerId, modelLocation, mipmapEnvLocation, modelScaleFactor) {
    const modelContainer = document.getElementById(containerId);
    if (!modelContainer) return;

    modelScaleFactor = modelScaleFactor;
    let scene, camera, renderer, controls, pointLight;
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
    );
    camera.position.set(0, -50, 500);

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

    // 1. Disable shadows for mobile
    if (window.innerWidth < 768) {
        renderer.shadowMap.enabled = false;
    }

    // 2. Optimize controls for mobile
    if (window.innerWidth < 768) {
        controls.enableDamping = false;
        controls.enableZoom = false;
        controls.enabled = false;  // Completely disable OrbitControls on mobile
    }

    // 3. Adjust lighting for mobile
    if (window.innerWidth < 768) {
        ambientLight.intensity = 0.8;
        pointLight.intensity = 1.0;
        renderer.shadowMap.enabled = false;
    }

    // Load HDR Environment
    new THREE.RGBELoader().load(mipmapEnvLocation, function (hdrmap) {
        hdrmap.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrmap;

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
        const ballGeo = new THREE.SphereGeometry(50, 32, 32);
        const ballMat = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            metalness: 0.9,
            roughness: 0.5,
            envMap: envMap,
        });

        const ballMesh = new THREE.Mesh(ballGeo, ballMat);
        ballMesh.position.set(0, 0, 0);

        pivotGroup.add(ballMesh);
        fitModelToScene(ballMesh);
    }

    function fitModelToScene(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        object.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fitSize = 200;
        const scaleFactor = (fitSize / maxDim) * modelScaleFactor;

        object.scale.set(scaleFactor, scaleFactor, scaleFactor);
        object.position.y += 50;

        pivotGroup.add(object);
    }

    let rotationDirection = 1;
    const minRotation = -Math.PI / 0.5;
    const maxRotation = Math.PI / 0.5;

    const rotationSpeed = 0.002;

    function animate() {
        requestAnimationFrame(animate);

        if (isRotating) {
            pivotGroup.rotation.y += rotationSpeed * rotationDirection;

            if (
                pivotGroup.rotation.y >= maxRotation ||
                pivotGroup.rotation.y <= minRotation
            ) {
                rotationDirection *= -1;
            }
        }

        controls.update();
        renderer.render(scene, camera);
    }

    // Resize Handling
    window.addEventListener('resize', () => {
        const width = modelContainer.clientWidth;
        const height = modelContainer.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
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


// Call initThreeJS for the first model
initThreeJS("modelContainer", "asset/iphone.glb", "asset/cayley_interior_1k.hdr", 1.5);

// Call initThreeJS for the second model
initThreeJS("modelContainer2", "asset/console.glb", "asset/cayley_interior_1k.hdr", 3);


document.addEventListener("DOMContentLoaded", function () {
    const texts = document.querySelectorAll(".changing-text");
    let index = 0;

    function changeText() {
        texts.forEach((text, i) => {
            text.style.transform = i === index ? "translateY(0)" : "translateY(100%)";
            text.style.opacity = i === index ? "1" : "0";
        });

        index = (index + 1) % texts.length; // Cycle index
    }

    setInterval(changeText, 3000); // Change every 3 seconds
    changeText(); // Initialize
});

document.addEventListener("DOMContentLoaded", function () {
    const texts = document.querySelectorAll(".changing-bottom-text");
    let index = 0;

    function changeText() {
        texts.forEach((text, i) => {
            text.classList.remove("visible"); // Hide all texts initially
        });

        // Add the 'visible' class to the current text
        texts[index].classList.add("visible");

        // Move to the next index
        index = (index + 1) % texts.length; // Cycle index
    }

    setInterval(changeText, 3000); // Change every 3 seconds
    changeText(); // Initialize
});

document.addEventListener("DOMContentLoaded", function () {
    const scrollingWrapper = document.querySelector(".scrolling-wrapper");
    const dots = document.querySelectorAll(".dot");
    const playBtn = document.querySelector(".play-btn");
    let currentIndex = 0;
    let autoScroll;
    let isPlaying = false; // Track autoplay state

    // Function to smoothly scroll to a specific image
    function scrollToImage(index) {
        const imageWidth = document.querySelector(".image-wrapper").clientWidth;
        scrollingWrapper.scrollTo({
            left: index * (imageWidth + 20), // Adjust for the gap
            behavior: "smooth" // Ensure smooth animation
        });

        // Update active dot
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");

        currentIndex = index;
    }

    // Auto-play functionality (loops through images)
    function startAutoScroll() {
        stopAutoScroll(); // Prevent multiple intervals
        autoScroll = setInterval(() => {
            currentIndex = (currentIndex + 1) % dots.length;
            scrollToImage(currentIndex);
        }, 3000); // Change every 3 seconds
        isPlaying = true;
        playBtn.innerHTML = `<span class="material-symbols-outlined filled" style="color: #555; font-size:35px">pause</span>`; // Change icon to pause
    }

    function stopAutoScroll() {
        clearInterval(autoScroll);
        isPlaying = false;
        playBtn.innerHTML = `<span class="material-symbols-outlined filled" style="color: #555; font-size:35px">play_arrow</span>`; // Change icon to play
    }

    // Toggle autoplay on play button click
    playBtn.addEventListener("click", () => {
        if (isPlaying) {
            stopAutoScroll();
        } else {
            startAutoScroll();
        }
    });

    // Dots navigation click
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            stopAutoScroll();
            scrollToImage(index);
        });
    });

    // Start auto-scroll initially
    /* startAutoScroll(); */
});

document.addEventListener("DOMContentLoaded", function () {
    const textSpans = document.querySelectorAll(".desc2 span");
    let index = 0;

    function animateText() {
        // Remove active class from all spans
        textSpans.forEach(span => span.classList.remove("active"));

        // Add active class to the current span
        textSpans[index].classList.add("active");

        // Move to the next span, looping back to the start
        index = (index + 1) % textSpans.length;

        // Call function again after delay
        setTimeout(animateText, 2000); // Adjust time as needed
    }

    // Start animation
    animateText();
});

















