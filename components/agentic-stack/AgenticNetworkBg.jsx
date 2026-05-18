'use client';
import { useEffect, useRef } from 'react';

// Subtle animated neural-network particle canvas using the same dynamic-import
// Three.js pattern as DatacenterModel3D.jsx. Alpha canvas sits behind white cards.
export default function AgenticNetworkBg() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let animFrameId;
    let mounted = true;

    import('three').then(THREE => {
      if (!mounted || !mountRef.current) return;

      const { WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute,
        LineBasicMaterial, Line, SphereGeometry, MeshBasicMaterial, Mesh, Color, Vector3 } = THREE;

      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      const renderer = new WebGLRenderer({ antialias: false, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      const scene = new Scene();
      const camera = new PerspectiveCamera(60, w / h, 0.1, 200);
      camera.position.set(0, 0, 30);

      // ── Nodes ──
      const NODE_COUNT = 28;
      const RANGE = 20;
      const nodes = Array.from({ length: NODE_COUNT }, () => {
        const x = (Math.random() - 0.5) * RANGE * 2;
        const y = (Math.random() - 0.5) * RANGE;
        const z = (Math.random() - 0.5) * 10;
        const vx = (Math.random() - 0.5) * 0.012;
        const vy = (Math.random() - 0.5) * 0.008;
        const size = 0.12 + Math.random() * 0.22;
        const colorIdx = Math.random();
        const color = colorIdx < 0.5 ? 0x0077C8 : colorIdx < 0.8 ? 0x00338D : 0x00A36C;
        const geo = new SphereGeometry(size, 6, 6);
        const mat = new MeshBasicMaterial({ color, transparent: true, opacity: 0.35 + Math.random() * 0.25 });
        const mesh = new Mesh(geo, mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        return { mesh, vx, vy, x, y, z };
      });

      // ── Edges (connect nearby nodes) ──
      const CONNECT_DIST = 10;
      const edgeMeshes = [];

      function buildEdges() {
        edgeMeshes.forEach(l => scene.remove(l));
        edgeMeshes.length = 0;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i].mesh.position;
            const b = nodes[j].mesh.position;
            const d = a.distanceTo(b);
            if (d < CONNECT_DIST) {
              const opacity = (1 - d / CONNECT_DIST) * 0.18;
              const geo = new BufferGeometry().setFromPoints([a.clone(), b.clone()]);
              const mat = new LineBasicMaterial({ color: 0x0077C8, transparent: true, opacity });
              const line = new Line(geo, mat);
              scene.add(line);
              edgeMeshes.push(line);
            }
          }
        }
      }

      buildEdges();

      let frame = 0;
      function animate() {
        if (!mounted) return;
        animFrameId = requestAnimationFrame(animate);
        frame++;

        nodes.forEach(n => {
          n.mesh.position.x += n.vx;
          n.mesh.position.y += n.vy;
          // Wrap around bounds
          if (n.mesh.position.x > RANGE) n.mesh.position.x = -RANGE;
          if (n.mesh.position.x < -RANGE) n.mesh.position.x = RANGE;
          if (n.mesh.position.y > RANGE / 2) n.mesh.position.y = -RANGE / 2;
          if (n.mesh.position.y < -RANGE / 2) n.mesh.position.y = RANGE / 2;
        });

        // Rebuild edges every 3 frames for performance
        if (frame % 3 === 0) buildEdges();

        renderer.render(scene, camera);
      }
      animate();

      // Resize handler
      const onResize = () => {
        if (!mountRef.current) return;
        const nw = mountRef.current.clientWidth;
        const nh = mountRef.current.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);

      // Cleanup
      return () => {
        mounted = false;
        cancelAnimationFrame(animFrameId);
        window.removeEventListener('resize', onResize);
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    });

    return () => { mounted = false; cancelAnimationFrame(animFrameId); };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
