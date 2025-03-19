const lenis = new Lenis({
    duration: 0.8,  // Speed of scroll (higher = slower)
    easing: (t) => 1 - Math.pow(1 - t, 3), // Smooth easing
    smooth: true,   // Enable smooth scrolling
    direction: "vertical", // Vertical scrolling (default)
    smoothTouch: false, // Disable smooth scrolling on touch devices (optional)
  });
  
  // Run animation on every frame
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  
  requestAnimationFrame(raf);
  