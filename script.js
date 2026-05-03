/* ═══════════════════════════════════════════════
   INTELLEA — Interactive 3D + Physics + GSAP
   Scientific blue theme, anti-gravity interactions
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initThreeHero();
  initNavbar();
  initMobileMenu();
  initPersonaSelector();
  initScrollAnimations();
  initCountUp();
  initFusionBars();
  initSagePipeline();
  initResearchCanvases();
  initCtaCanvas();
  initPillarCards();
});

/* ──────────────────────────────────
   THREE.JS HERO — PHYSICS + SCIENTIFIC OBJECTS
   ────────────────────────────────── */
function initThreeHero() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 300);
  camera.position.set(0, 0, 40);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const BLUES = [0x3B82F6, 0x60A5FA, 0x93C5FD, 0x2563EB, 0x1D4ED8, 0xBFDBFE, 0x1E40AF];

  /* Raycaster */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(9999, 9999);
  let mouseWorld = new THREE.Vector3();
  let mouseScreen = { x: 0, y: 0 };
  let isDragging = false;
  let draggedObj = null;
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const dragOffset = new THREE.Vector3();

  /* Physics objects */
  const physicsObjects = [];

  function addPhysicsObject(mesh, opts = {}) {
    const obj = {
      mesh,
      home: mesh.position.clone(),
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, 0),
      rotSpeed: { x: (Math.random() - 0.5) * 0.006, y: (Math.random() - 0.5) * 0.006 },
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.2 + Math.random() * 0.3,
      baseOpacity: opts.opacity || 0.3,
      hoverOpacity: (opts.opacity || 0.3) + 0.3,
      springK: opts.springK || 0.0004,
      damping: opts.damping || 0.993,
      repelRadius: opts.repelRadius || 18,
      repelStrength: opts.repelStrength || 1.2,
      isGroup: opts.isGroup || false
    };
    physicsObjects.push(obj);
    return obj;
  }

  /* ── DNA Double Helix ── */
  const dnaGroup = new THREE.Group();
  dnaGroup.position.set(-28, 2, -10);
  scene.add(dnaGroup);

  const strandPts1 = [], strandPts2 = [];
  for (let i = 0; i < 120; i++) {
    const t = (i / 120) * Math.PI * 6;
    const y = (i / 120) * 16 - 8;
    strandPts1.push(new THREE.Vector3(Math.cos(t) * 2, y, Math.sin(t) * 2));
    strandPts2.push(new THREE.Vector3(Math.cos(t + Math.PI) * 2, y, Math.sin(t + Math.PI) * 2));
  }
  const strandMat = new THREE.LineBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.35 });
  dnaGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(strandPts1), strandMat));
  dnaGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(strandPts2), strandMat));
  const rungMat = new THREE.LineBasicMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.15 });
  for (let i = 0; i < 120; i += 6) {
    dnaGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([strandPts1[i], strandPts2[i]]), rungMat));
  }
  addPhysicsObject(dnaGroup, { opacity: 0.35, isGroup: true, repelRadius: 14 });

  /* ── Atom Model ── */
  const atomGroup = new THREE.Group();
  atomGroup.position.set(18, 6, -5);
  scene.add(atomGroup);

  const nucleus = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 2),
    new THREE.MeshBasicMaterial({ color: 0x60A5FA, wireframe: true, transparent: true, opacity: 0.5 })
  );
  atomGroup.add(nucleus);

  const orbits = [];
  for (let i = 0; i < 3; i++) {
    const oGroup = new THREE.Group();
    oGroup.rotation.x = [0, Math.PI / 3, -Math.PI / 3][i];
    oGroup.rotation.y = [0, Math.PI / 4, -Math.PI / 4][i];
    atomGroup.add(oGroup);
    oGroup.add(new THREE.Mesh(
      new THREE.TorusGeometry(4.5, 0.03, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.15 })
    ));
    const electron = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xBFDBFE, transparent: true, opacity: 0.9 })
    );
    oGroup.add(electron);
    orbits.push({ group: oGroup, electron, radius: 4.5, speed: 0.7 + i * 0.3, angle: (Math.PI * 2 / 3) * i });
  }
  addPhysicsObject(atomGroup, { opacity: 0.5, isGroup: true, repelRadius: 12 });

  /* ── Wave Function Surface ── */
  const waveGeo = new THREE.PlaneGeometry(10, 5, 100, 50);
  const wavePositions = waveGeo.attributes.position.array;
  for (let i = 0; i < wavePositions.length; i += 3) {
    wavePositions[i + 2] = Math.sin(wavePositions[i] * 1.5) * Math.cos(wavePositions[i + 1] * 1.5) * 0.6;
  }
  waveGeo.computeVertexNormals();
  const waveMesh = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: 0x3B82F6, wireframe: true, transparent: true, opacity: 0.15 }));
  waveMesh.position.set(10, -14, -8);
  waveMesh.rotation.x = -0.3;
  scene.add(waveMesh);
  addPhysicsObject(waveMesh, { opacity: 0.15, repelRadius: 16 });

  /* ── Crystal Lattice ── */
  const latticeGroup = new THREE.Group();
  latticeGroup.position.set(28, 14, -16);
  scene.add(latticeGroup);
  const latticeNodeMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.4 });
  const latticeLineMat = new THREE.LineBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.12 });
  const latticeNodes = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const pos = new THREE.Vector3((x - 1) * 1.8, (y - 1) * 1.8, (z - 1) * 1.8);
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), latticeNodeMat);
        node.position.copy(pos);
        latticeGroup.add(node);
        latticeNodes.push(pos);
      }
    }
  }
  for (let i = 0; i < latticeNodes.length; i++) {
    for (let j = i + 1; j < latticeNodes.length; j++) {
      if (latticeNodes[i].distanceTo(latticeNodes[j]) <= 1.9) {
        latticeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([latticeNodes[i], latticeNodes[j]]), latticeLineMat));
      }
    }
  }
  addPhysicsObject(latticeGroup, { opacity: 0.4, isGroup: true, repelRadius: 10 });

  /* ── Large spread-out wireframe shapes ── */
  function createWireframe(geo, color, pos, opacity) {
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: opacity || 0.25 }));
    mesh.position.copy(pos);
    scene.add(mesh);
    return addPhysicsObject(mesh, { opacity: opacity || 0.25 });
  }

  createWireframe(new THREE.IcosahedronGeometry(5.5, 1), 0x3B82F6, new THREE.Vector3(-16, 14, -18));
  createWireframe(new THREE.OctahedronGeometry(4, 0), 0x60A5FA, new THREE.Vector3(30, -8, -14));
  createWireframe(new THREE.TorusKnotGeometry(3, 0.7, 80, 10), 0x2563EB, new THREE.Vector3(-12, -12, -10), 0.2);
  createWireframe(new THREE.DodecahedronGeometry(3, 0), 0x93C5FD, new THREE.Vector3(5, 18, -20));
  createWireframe(new THREE.TorusGeometry(3.5, 0.8, 12, 40), 0x1D4ED8, new THREE.Vector3(-26, -10, -18), 0.18);
  createWireframe(new THREE.TetrahedronGeometry(3.5, 0), 0x1E40AF, new THREE.Vector3(-8, 12, -6));
  createWireframe(new THREE.IcosahedronGeometry(2.5, 2), 0xBFDBFE, new THREE.Vector3(26, 16, -12), 0.2);
  createWireframe(new THREE.ConeGeometry(2.5, 5, 6), 0x60A5FA, new THREE.Vector3(-22, 8, -22), 0.18);
  createWireframe(new THREE.CylinderGeometry(0, 3, 4, 5), 0x3B82F6, new THREE.Vector3(22, -16, -16), 0.18);

  /* ── Particle Network ── */
  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);
  const netNodes = [];
  for (let i = 0; i < 70; i++) {
    const s = 0.05 + Math.random() * 0.12;
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(s, 6, 6),
      new THREE.MeshBasicMaterial({ color: BLUES[Math.floor(Math.random() * BLUES.length)], transparent: true, opacity: 0.08 + Math.random() * 0.18 })
    );
    m.position.set((Math.random() - 0.5) * 70, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30 - 10);
    nodeGroup.add(m);
    netNodes.push(m);
  }
  const netLineMat = new THREE.LineBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.04 });
  for (let i = 0; i < netNodes.length; i++) {
    for (let j = i + 1; j < netNodes.length; j++) {
      if (netNodes[i].position.distanceTo(netNodes[j].position) < 12) {
        nodeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([netNodes[i].position.clone(), netNodes[j].position.clone()]), netLineMat));
      }
    }
  }

  /* ── Get all interactive meshes for raycasting ── */
  const interactiveMeshes = [];
  physicsObjects.forEach(po => {
    if (po.isGroup) {
      po.mesh.traverse(child => { if (child.isMesh) interactiveMeshes.push({ mesh: child, po }); });
    } else {
      interactiveMeshes.push({ mesh: po.mesh, po });
    }
  });

  /* ── Mouse 3D projection ── */
  function projectMouseToWorld() {
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(plane, mouseWorld);
  }

  /* ── Mouse Events ── */
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseScreen.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseScreen.y = (e.clientY / window.innerHeight - 0.5) * 2;
    projectMouseToWorld();
  }

  canvas.addEventListener('mousemove', (e) => {
    getMousePos(e);
    if (isDragging && draggedObj) {
      raycaster.setFromCamera(mouse, camera);
      const pt = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, pt);
      if (pt) {
        const newPos = pt.sub(dragOffset);
        draggedObj.vel.x = (newPos.x - draggedObj.mesh.position.x) * 0.25;
        draggedObj.vel.y = (newPos.y - draggedObj.mesh.position.y) * 0.25;
        draggedObj.mesh.position.x = newPos.x;
        draggedObj.mesh.position.y = newPos.y;
      }
    } else {
      canvas.style.cursor = 'grab';
      raycaster.setFromCamera(mouse, camera);
      const meshes = interactiveMeshes.map(im => im.mesh);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length) canvas.style.cursor = 'grab';
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    getMousePos(e);
    raycaster.setFromCamera(mouse, camera);
    const meshes = interactiveMeshes.map(im => im.mesh);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      const hit = interactiveMeshes.find(im => im.mesh === hits[0].object);
      if (hit) {
        isDragging = true;
        draggedObj = hit.po;
        canvas.style.cursor = 'grabbing';
        dragPlane.setFromNormalAndCoplanarPoint(
          camera.getWorldDirection(new THREE.Vector3()).negate(),
          draggedObj.mesh.position
        );
        const pt = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, pt);
        if (pt) dragOffset.copy(pt).sub(draggedObj.mesh.position);
      }
    }
  });

  canvas.addEventListener('mouseup', () => { isDragging = false; draggedObj = null; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; draggedObj = null; mouse.set(9999, 9999); });

  /* ── Resize ── */
  function onResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
  window.addEventListener('resize', onResize);

  /* ── Animation Loop ── */
  let time = 0;
  const waveBasePositions = Float32Array.from(wavePositions);

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    /* Electron orbits */
    orbits.forEach(o => {
      o.angle += o.speed * 0.012;
      o.electron.position.x = Math.cos(o.angle) * o.radius;
      o.electron.position.z = Math.sin(o.angle) * o.radius;
    });

    /* Wave function animation */
    const wp = waveMesh.geometry.attributes.position.array;
    for (let i = 0; i < wp.length; i += 3) {
      wp[i + 2] = Math.sin(waveBasePositions[i] * 1.5 + time * 2) * Math.cos(waveBasePositions[i + 1] * 1.5 + time) * 0.6;
    }
    waveMesh.geometry.attributes.position.needsUpdate = true;

    /* Physics update */
    physicsObjects.forEach(po => {
      if (po === draggedObj) {
        po.mesh.rotation.x += po.rotSpeed.x;
        po.mesh.rotation.y += po.rotSpeed.y;
        return;
      }

      /* Spring to home */
      const dx = po.home.x - po.mesh.position.x;
      const dy = po.home.y - po.mesh.position.y;
      po.vel.x += dx * po.springK;
      po.vel.y += dy * po.springK;

      /* Mouse repulsion */
      if (mouseWorld && mouse.x < 9000) {
        const mx = po.mesh.position.x - mouseWorld.x;
        const my = po.mesh.position.y - mouseWorld.y;
        const dist = Math.sqrt(mx * mx + my * my);
        if (dist < po.repelRadius && dist > 0.1) {
          const force = po.repelStrength / (dist * dist);
          po.vel.x += (mx / dist) * force;
          po.vel.y += (my / dist) * force;
        }
      }

      /* Floating */
      po.vel.y += Math.cos(time * po.floatSpeed + po.floatOffset) * 0.0003;

      /* Damping */
      po.vel.x *= po.damping;
      po.vel.y *= po.damping;

      po.mesh.position.x += po.vel.x;
      po.mesh.position.y += po.vel.y;
      po.mesh.rotation.x += po.rotSpeed.x;
      po.mesh.rotation.y += po.rotSpeed.y;
    });

    /* Particle network slow rotation */
    nodeGroup.rotation.y += 0.00015;

    /* Camera parallax */
    camera.position.x += (mouseScreen.x * 4 - camera.position.x) * 0.012;
    camera.position.y += (-mouseScreen.y * 3 - camera.position.y) * 0.012;
    camera.lookAt(0, 0, -5);

    renderer.render(scene, camera);
  }
  animate();
}


/* ──────────────────────────────────
   NAVBAR
   ────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { nav.classList.toggle('scrolled', window.scrollY > 60); ticking = false; });
      ticking = true;
    }
  });
}


/* ──────────────────────────────────
   MOBILE MENU
   ────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}


/* ──────────────────────────────────
   PERSONA SELECTOR
   ────────────────────────────────── */
function initPersonaSelector() {
  const demo = document.getElementById('personaDemo');
  if (!demo) return;

  const presets = {
    socratic:  { patience: 70, encourage: 85, formality: 45, hint: 60, chat: "What do you think would happen if we changed the loop condition here?" },
    direct:    { patience: 40, encourage: 60, formality: 80, hint: 30, chat: "The loop iterates from 0 to n. On each iteration, we multiply the accumulator by the current index. Let me show you step by step." },
    collab:    { patience: 90, encourage: 95, formality: 30, hint: 80, chat: "That's an interesting approach! What if we tried thinking about this together and find a pattern?" },
    scaffold:  { patience: 80, encourage: 75, formality: 50, hint: 95, chat: "Great start! Now, can you think about what the base case should be? Consider what happens when n equals zero." }
  };

  const cards = demo.querySelectorAll('.style-card');
  const fills = {
    patience: document.getElementById('fill-patience'),
    encourage: document.getElementById('fill-encourage'),
    formality: document.getElementById('fill-formality'),
    hint: document.getElementById('fill-hint')
  };
  const vals = {
    patience: document.getElementById('val-patience'),
    encourage: document.getElementById('val-encourage'),
    formality: document.getElementById('val-formality'),
    hint: document.getElementById('val-hint')
  };
  const chatEl = demo.querySelector('.chat-bubble');

  function setPreset(style) {
    const p = presets[style];
    if (!p) return;
    cards.forEach(c => c.classList.toggle('style-card--active', c.dataset.style === style));
    Object.keys(fills).forEach(k => { if (fills[k]) fills[k].style.width = p[k] + '%'; });
    Object.keys(vals).forEach(k => { if (vals[k]) vals[k].textContent = (p[k] / 10).toFixed(1); });
    if (chatEl) {
      chatEl.style.opacity = '0';
      setTimeout(() => { chatEl.textContent = p.chat; chatEl.style.opacity = '1'; }, 200);
    }
  }

  cards.forEach(card => card.addEventListener('click', () => setPreset(card.dataset.style)));
  setTimeout(() => setPreset('socratic'), 500);
}


/* ──────────────────────────────────
   GSAP SCROLL ANIMATIONS
   ────────────────────────────────── */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance */
  const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTL
    .to('#heroBadge',    { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
    .to('#heroTitle',    { opacity: 1, y: 0, duration: 0.9 }, '-=0.5')
    .to('#heroSubtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('#heroActions',  { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');

  /* Section reveals */
  const selectors = [
    '.section-header', '.stat-card', '.vision-text', '.pillar-card',
    '.innovation-header', '.innovation-text-col', '.innovation-visual-col',
    '.research-card', '.module-card', '.cta-content', '.cta-stat',
    '.sage-feature', '.blockcode-highlights li'
  ];
  selectors.forEach(sel => {
    gsap.utils.toArray(sel).forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        y: 36, opacity: 0, duration: 0.7, delay: i * 0.06, ease: 'power3.out'
      });
    });
  });

  /* Hero parallax */
  gsap.to('#heroCanvas', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    y: 80, ease: 'none'
  });
}


/* ──────────────────────────────────
   COUNT UP
   ────────────────────────────────── */
function initCountUp() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        animateCount(el, 0, parseInt(el.dataset.count, 10), 1600);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

function animateCount(el, start, end, duration) {
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* ──────────────────────────────────
   PILLAR CARDS INTERACTIVITY
   ────────────────────────────────── */
function initPillarCards() {
  const targetMap = { persona: '#innovations', emotion: '#emotion', sage: '#sage', blockcode: '#blockcode' };
  document.querySelectorAll('.pillar-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
    card.addEventListener('click', () => {
      const target = card.dataset.target;
      const el = document.querySelector(targetMap[target]);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ──────────────────────────────────
   FUSION BARS
   ────────────────────────────────── */
function initFusionBars() {
  const bars = document.querySelectorAll('.fusion-bar-fill');
  if (!bars.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.target + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => obs.observe(b));
}


/* ──────────────────────────────────
   SAGE PIPELINE — PARTICLE ANIMATION
   ────────────────────────────────── */
function initSagePipeline() {
  const pipeline = document.getElementById('sagePipeline');
  if (!pipeline) return;

  const steps = pipeline.querySelectorAll('.sage-step');
  const trackFill = document.getElementById('sageTrackFill');
  const particle = document.getElementById('sageParticle');
  let animated = false;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !animated) {
        animated = true;
        animatePipeline();
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  obs.observe(pipeline);

  function animatePipeline() {
    const total = steps.length;
    if (particle) { particle.style.opacity = '1'; }

    steps.forEach((step, i) => {
      setTimeout(() => {
        step.classList.add('active');

        /* Move particle */
        if (particle) {
          const pct = (i / (total - 1)) * 100;
          particle.style.top = pct + '%';
        }

        /* Fill track */
        if (trackFill) {
          trackFill.style.height = ((i + 1) / total * 100) + '%';
        }

        /* Pulse effect on step dot */
        const dot = step.querySelector('.sage-step-dot');
        if (dot) {
          dot.style.transform = 'scale(1.15)';
          setTimeout(() => { dot.style.transform = 'scale(1)'; }, 300);
        }
      }, i * 600);
    });

    /* Hide particle after last step */
    setTimeout(() => {
      if (particle) {
        particle.style.opacity = '0';
      }
    }, total * 600 + 400);
  }
}


/* ──────────────────────────────────
   RESEARCH SECTION — MINI 3D CANVASES
   ────────────────────────────────── */
function initResearchCanvases() {
  if (typeof THREE === 'undefined') return;

  initMiniScene('canvasBKT', (scene) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x3B82F6, wireframe: true, transparent: true, opacity: 0.25 })
    );
    scene.add(sphere);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.5 + i * 0.6, 0.03, 8, 48),
        new THREE.MeshBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.12 + i * 0.05 })
      );
      ring.rotation.x = Math.PI / 2 + i * 0.3;
      ring.rotation.y = i * 0.5;
      scene.add(ring);
    }
    /* Small data point orbiting */
    const dataPoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xBFDBFE })
    );
    scene.add(dataPoint);
    return (time) => {
      sphere.rotation.y = time * 0.25;
      sphere.rotation.x = Math.sin(time * 0.15) * 0.15;
      scene.children.forEach((c, i) => { if (i > 0 && i < 4) c.rotation.z = time * 0.12 * (i + 1); });
      dataPoint.position.x = Math.cos(time * 0.8) * 3;
      dataPoint.position.z = Math.sin(time * 0.8) * 3;
      dataPoint.position.y = Math.sin(time * 0.4) * 0.5;
    };
  });

  initMiniScene('canvasZPD', (scene) => {
    const colors = [0x1D4ED8, 0x3B82F6, 0x93C5FD];
    const sizes = [3.5, 2.4, 1.3];
    const meshes = [];
    sizes.forEach((s, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(s, 28, 28),
        new THREE.MeshBasicMaterial({ color: colors[i], wireframe: true, transparent: true, opacity: 0.08 + i * 0.06 })
      );
      scene.add(m);
      meshes.push(m);
    });
    /* Orbiting point in ZPD zone */
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xBFDBFE })
    );
    scene.add(dot);
    /* Zone label rings */
    const labelRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.02, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.3 })
    );
    scene.add(labelRing);
    return (time) => {
      meshes.forEach((m, i) => {
        m.rotation.y = time * (0.15 + i * 0.08);
        m.rotation.x = Math.sin(time * 0.2 + i) * 0.1;
        m.scale.setScalar(1 + Math.sin(time * 0.6 + i * 1.5) * 0.03);
      });
      dot.position.x = Math.cos(time * 0.5) * 1.85;
      dot.position.y = Math.sin(time * 0.5) * 1.85;
      dot.position.z = Math.sin(time * 0.25) * 0.3;
      labelRing.rotation.x = Math.PI / 2;
      labelRing.rotation.z = time * 0.1;
    };
  });

  initMiniScene('canvasRAG', (scene) => {
    const nodes = [];
    for (let i = 0; i < 25; i++) {
      const s = 0.08 + Math.random() * 0.18;
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(s, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.25 + Math.random() * 0.35 })
      );
      m.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3);
      scene.add(m);
      nodes.push(m);
    }
    const lMat = new THREE.LineBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.08 });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].position.distanceTo(nodes[j].position) < 3.5) {
          scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([nodes[i].position.clone(), nodes[j].position.clone()]), lMat));
        }
      }
    }
    return (time) => {
      nodes.forEach((n, i) => {
        n.position.y += Math.sin(time * 0.4 + i) * 0.002;
        n.position.x += Math.cos(time * 0.25 + i * 0.7) * 0.0015;
      });
    };
  });
}

function initMiniScene(canvasId, setupFn) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const scene = new THREE.Scene();
  const w = canvas.clientWidth || 380;
  const h = canvas.clientHeight || 160;
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const updateFn = setupFn(scene);
  let time = 0;
  let isVisible = false;
  let hoverX = 0, hoverY = 0;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    hoverX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    hoverY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  canvas.addEventListener('mouseleave', () => { hoverX = 0; hoverY = 0; });
  canvas.style.cursor = 'pointer';

  const obs = new IntersectionObserver((entries) => { isVisible = entries[0].isIntersecting; }, { threshold: 0.1 });
  obs.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    time += 0.016;
    if (updateFn) updateFn(time);
    camera.position.x += (hoverX * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (-hoverY * 1 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    if (nw && nh) { camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh); }
  });
}


/* ──────────────────────────────────
   CTA — PARTICLE BACKGROUND CANVAS
   ────────────────────────────────── */
function initCtaCanvas() {
  const canvas = document.getElementById('ctaCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Create particles */
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 2000,
      y: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 2,
      alpha: 0.05 + Math.random() * 0.15
    });
  }

  let isVisible = false;
  const obs = new IntersectionObserver((entries) => { isVisible = entries[0].isIntersecting; }, { threshold: 0.1 });
  obs.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
      ctx.fill();
    });

    /* Connect nearby particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
  animate();
}
