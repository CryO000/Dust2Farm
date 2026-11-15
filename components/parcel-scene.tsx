"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { zones } from "@/lib/field-data";

type Props = {
  selectedZone: string;
  onSelectZone: (zone: (typeof zones)[number]) => void;
  showSensors: boolean;
  showIrrigation?: boolean;
  irrigationActive?: boolean;
  onReady?: () => void;
};

function terrainHeight(x: number, z: number) {
  return 0.12 * Math.sin(x * 0.7) * Math.cos(z * 0.65) + 0.05 * Math.sin(z * 1.4);
}

export default function ParcelScene({
  selectedZone,
  onSelectZone,
  showSensors,
  showIrrigation = true,
  irrigationActive = false,
  onReady,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef(selectedZone);
  const sensorVisibilityRef = useRef(showSensors);
  const selectCallbackRef = useRef(onSelectZone);
  const irrigationVisibilityRef = useRef(showIrrigation);
  const irrigationActiveRef = useRef(irrigationActive);
  const readyCallbackRef = useRef(onReady);

  useEffect(() => {
    selectionRef.current = selectedZone;
    sensorVisibilityRef.current = showSensors;
    selectCallbackRef.current = onSelectZone;
    irrigationVisibilityRef.current = showIrrigation;
    irrigationActiveRef.current = irrigationActive;
    readyCallbackRef.current = onReady;
  }, [selectedZone, showSensors, onSelectZone, showIrrigation, irrigationActive, onReady]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f7f3eb");
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(12.4, 11.6, 15.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.minDistance = 11;
    controls.maxDistance = 26;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight("#ffffff", "#788671", 2.2));
    const sunlight = new THREE.DirectionalLight("#fff5dc", 3.1);
    sunlight.position.set(-5, 12, 8);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    scene.add(sunlight);
    const fillLight = new THREE.DirectionalLight("#cce8e1", 1.1);
    fillLight.position.set(8, 5, -8);
    scene.add(fillLight);

    const terrainGeometry = new THREE.PlaneGeometry(14, 10, 48, 36);
    terrainGeometry.rotateX(-Math.PI / 2);
    const positions = terrainGeometry.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const soilLow = new THREE.Color("#8f805f");
    const soilHigh = new THREE.Color("#b5a27c");
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      positions.setY(i, terrainHeight(x, z) - 0.04);
      const color = soilLow.clone().lerp(soilHigh, Math.max(0, Math.min(1, (Math.sin(x * 0.45 + z * 0.25) + 1) * 0.35)));
      colors.push(color.r, color.g, color.b);
    }
    terrainGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    terrainGeometry.computeVertexNormals();
    const terrain = new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    terrain.receiveShadow = true;
    scene.add(terrain);

    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);
    const irrigationGroup = new THREE.Group();
    irrigationGroup.userData.kind = "irrigation";
    parcelGroup.add(irrigationGroup);
    const flowMarkers: THREE.Mesh[] = [];
    const fieldTopMaterials = new Map<string, THREE.MeshStandardMaterial>();
    const zoneMeshes: THREE.Mesh[] = [];
    const defectiveSensorDots: { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial }[] = [];

    zones.forEach((zone) => {
      const [x, , z] = zone.position;
      const patchGeometry = new THREE.PlaneGeometry(5.55, 3.25, 16, 10);
      patchGeometry.rotateX(-Math.PI / 2);
      const patchPositions = patchGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < patchPositions.count; i++) {
        const px = patchPositions.getX(i) + x;
        const pz = patchPositions.getZ(i) + z;
        patchPositions.setY(i, terrainHeight(px, pz) + 0.025);
      }
      patchGeometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({
        color: zone.color,
        roughness: 0.94,
        metalness: 0,
        transparent: true,
        opacity: zone.id === selectionRef.current ? 0.83 : 0.67,
        side: THREE.DoubleSide,
      });
      fieldTopMaterials.set(zone.id, material);
      const patch = new THREE.Mesh(patchGeometry, material);
      patch.position.set(x, 0, z);
      patch.userData = { zoneId: zone.id, kind: "zone" };
      patch.receiveShadow = true;
      patch.castShadow = true;
      parcelGroup.add(patch);
      zoneMeshes.push(patch);

      const rows = new THREE.Group();
      const rowMaterial = new THREE.MeshStandardMaterial({
        color: "#766446",
        roughness: 0.82,
        transparent: true,
        opacity: 0.74,
      });
      for (let row = 0; row < 7; row++) {
        const rowZ = z - 1.25 + row * 0.4;
        const rowGeometry = new THREE.BufferGeometry();
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 20; i++) {
          const rowX = x - 2.45 + (i / 20) * 4.9;
          points.push(new THREE.Vector3(rowX, terrainHeight(rowX, rowZ) + 0.1, rowZ));
        }
        rowGeometry.setFromPoints(points);
        const cropRow = new THREE.Line(rowGeometry, rowMaterial);
        rows.add(cropRow);
        for (let i = 1; i < 10; i++) {
          const plantX = x - 2.15 + i * 0.43;
          const plant = new THREE.Mesh(
            new THREE.ConeGeometry(0.075, 0.27, 5),
            new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? "#947b4f" : "#826e4b", roughness: 0.9 }),
          );
          plant.position.set(plantX, terrainHeight(plantX, rowZ) + 0.18, rowZ);
          plant.rotation.z = (i % 2 ? 1 : -1) * 0.16;
          rows.add(plant);
        }
      }
      parcelGroup.add(rows);

      const sensor = new THREE.Group();
      sensor.name = `sensor-${zone.id}`;
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 0.48, 8),
        new THREE.MeshStandardMaterial({ color: "#f2f2e7", roughness: 0.5 }),
      );
      stem.position.y = 0.24;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 14, 12),
        new THREE.MeshStandardMaterial({ color: zone.moisture < 22 ? "#d47e55" : "#f4efe6", emissive: zone.moisture < 22 ? "#8f321b" : "#836c43", emissiveIntensity: 0.45 }),
      );
      head.position.y = 0.51;
      sensor.add(stem, head);
      if (zone.id === "south") {
        const defectMaterial = new THREE.MeshBasicMaterial({ color: "#ed3025", transparent: true, toneMapped: false });
        const defectDot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), defectMaterial);
        defectDot.position.set(0.14, 0.53, 0.02);
        sensor.add(defectDot);
        defectiveSensorDots.push({ mesh: defectDot, material: defectMaterial });
      }
      sensor.position.set(x + (zone.id === "south" ? 1.55 : -1.7), terrainHeight(x, z) + 0.06, z + 0.25);
      sensor.userData = { zoneId: zone.id, kind: "sensor" };
      parcelGroup.add(sensor);
    });

    const borderPoints = [
      new THREE.Vector3(-7, 0.12, -5),
      new THREE.Vector3(7, 0.12, -5),
      new THREE.Vector3(7, 0.12, 5),
      new THREE.Vector3(-7, 0.12, 5),
      new THREE.Vector3(-7, 0.12, -5),
    ];
    const boundary = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(borderPoints),
      new THREE.LineBasicMaterial({ color: "#f5f2e7", linewidth: 2 }),
    );
    parcelGroup.add(boundary);

    const pipeMaterial = new THREE.MeshStandardMaterial({ color: "#6d9d97", roughness: 0.48, metalness: 0.24 });
    const pipePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.4, 0.14, 0),
      new THREE.Vector3(-3.2, 0.14, 0),
      new THREE.Vector3(-1, 0.14, 0),
      new THREE.Vector3(1, 0.14, 0),
      new THREE.Vector3(3.2, 0.14, 0),
      new THREE.Vector3(5.4, 0.14, 0),
    ]);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipePath, 36, 0.055, 8, false), pipeMaterial);
    irrigationGroup.add(pipe);
    [-3.5, 0, 3.5].forEach((x) => {
      const branchPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 0.14, 0),
        new THREE.Vector3(x, 0.14, -1.3),
        new THREE.Vector3(x, 0.14, -2.8),
      ]);
      irrigationGroup.add(new THREE.Mesh(new THREE.TubeGeometry(branchPath, 10, 0.035, 7, false), pipeMaterial));
    });
    for (let index = 0; index < 5; index++) {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 8),
        new THREE.MeshStandardMaterial({ color: "#b9e8d9", emissive: "#56ab9b", emissiveIntensity: 0.65 }),
      );
      marker.visible = false;
      irrigationGroup.add(marker);
      flowMarkers.push(marker);
    }

    const reservoir = new THREE.Group();
    const reservoirBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.88, 0.52, 24),
      new THREE.MeshStandardMaterial({ color: "#8ab8ac", roughness: 0.38, metalness: 0.18 }),
    );
    reservoirBody.position.y = 0.25;
    const waterSurface = new THREE.Mesh(
      new THREE.CircleGeometry(0.72, 24),
      new THREE.MeshStandardMaterial({ color: "#6da9a0", roughness: 0.22, metalness: 0.2 }),
    );
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.y = 0.52;
    reservoir.add(reservoirBody, waterSurface);
    reservoir.position.set(-5.65, 0.06, 3.55);
    irrigationGroup.add(reservoir);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: "#f7f3eb", roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerUp = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const sensors = parcelGroup.children.filter((child) => child.userData.kind === "sensor" && sensorVisibilityRef.current);
      const hits = raycaster.intersectObjects([...zoneMeshes, ...sensors], true);
      if (!hits.length) return;
      let target: THREE.Object3D | null = hits[0].object;
      while (target && !target.userData.zoneId) target = target.parent;
      const zone = zones.find((item) => item.id === target?.userData.zoneId);
      if (zone) selectCallbackRef.current(zone);
    };
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    let frame = 0;
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    let firstFrame = true;
    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update();
      fieldTopMaterials.forEach((material, id) => {
        const selected = id === selectionRef.current;
        material.opacity = selected ? 0.88 : 0.66;
        material.emissive.set(selected ? "#3c2f18" : "#000000");
        material.emissiveIntensity = selected ? 0.12 : 0;
      });
      parcelGroup.children.forEach((child) => {
        if (child.userData.kind === "sensor") child.visible = sensorVisibilityRef.current;
      });
      const defectVisible = Math.sin(performance.now() * 0.012) > -0.1;
      defectiveSensorDots.forEach(({ mesh, material }) => {
        mesh.visible = sensorVisibilityRef.current;
        material.opacity = defectVisible ? 1 : 0.18;
      });
      irrigationGroup.visible = irrigationVisibilityRef.current;
      flowMarkers.forEach((marker, index) => {
        marker.visible = irrigationVisibilityRef.current && irrigationActiveRef.current;
        if (marker.visible) {
          marker.position.copy(pipePath.getPointAt((performance.now() * 0.000035 + index / flowMarkers.length) % 1));
        }
      });
      renderer.render(scene, camera);
      if (firstFrame) {
        firstFrame = false;
        readyCallbackRef.current?.();
      }
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="three-host" aria-label="Interactive 3D field model" />;
}
