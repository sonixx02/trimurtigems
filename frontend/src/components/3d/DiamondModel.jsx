import React, { useRef, useState, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF, MeshRefractionMaterial, Caustics } from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

/**
 * DiamondModel - Reusable 3D Diamond Component
 * @param {string} shape - Diamond shape (round, princess, cushion, etc.)
 * @param {string} modelPath - Optional custom 3D model path
 * @param {object} materialProps - Material properties (color, ior, bounces, etc.)
 */
const DiamondModel = ({ shape, modelPath, materialProps }) => {
  const modelRef = useRef();
  const [model, setModel] = useState(null);

  // Load the generic gemstone GLB file
  const defaultModelPath = `${import.meta.env.BASE_URL}images/GemstoneAssets.glb`;
  const actualModelPath = modelPath || defaultModelPath;
  const { scene: originalScene } = useGLTF(actualModelPath);

  const texture = useLoader(
    RGBELoader,
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr"
  );

  // Mapping between URL shape names and GLB model names
  const shapeToModelName = {
    round: "Gem_RoundBrilliant",
    princess: "Gem_Square",
    cushion: "Gem_Cushioned_Square",
    oval: "Gem_Oval",
    emerald: "Gem_Rectangular",
    radiant: "Gem_SquareCornered",
    asscher: "Gem_Octangle",
    marquise: "Gem_Marquise",
    pear: "Gem_Tear_Drop",
    heart: "Gem_HeartSimple",
    triangle: "Gem_Triangle",
    trilliant: "Gem_Trilliant",
    trapizoid: "Gem_Trapizoid",
    hexangular: "Gem_Hexangular",
    octangle: "Gem_Octangle",
    square: "Gem_Square",
    rectangular: "Gem_Rectangular",
    tear: "Gem_Tear_Drop",
    heartcomplex: "Gem_HeartComplex",
    cushionedround: "Gem_Cushioned_Round",
    cushionedrectangular: "Gem_Cushioned_Rectangular",
  };

  useEffect(() => {
    if (originalScene) {
      const clonedScene = originalScene.clone();
      let selectedModel = null;

      // Find the specific model by name
      const targetName = shapeToModelName[shape?.toLowerCase()];

      if (targetName) {
        clonedScene.traverse((child) => {
          if (child.isMesh && child.name === targetName) {
            selectedModel = child;
          }
        });
      }

      if (!selectedModel) {
        // Fallback to first mesh if specific model not found
        clonedScene.traverse((child) => {
          if (child.isMesh && !selectedModel) {
            selectedModel = child;
          }
        });
      }

      if (selectedModel) {
        // Bake the world matrix into the geometry
        const geometry = selectedModel.geometry.clone();
        geometry.applyMatrix4(selectedModel.matrixWorld);

        // Compute the bounding box of the baked geometry
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox.clone();
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Center the geometry at the origin
        geometry.translate(-center.x, -center.y, -center.z);

        setModel({ geometry });
      } else {
        console.error(`No diamond model found for shape: ${shape}`);
      }
    }
  }, [originalScene, shape]);

  if (!model) return null;

  return (
    <group ref={modelRef} scale={1.5}>
      <Caustics
        backfaces
        color={materialProps.color}
        position={[0, -0.5, 0]}
        lightSource={[5, 5, 5]}
        worldRadius={0.1}
        ior={materialProps.ior}
        intensity={0.2}
      >
        <mesh castShadow geometry={model.geometry}>
          <MeshRefractionMaterial
            envMap={texture}
            bounces={materialProps.bounces}
            aberrationStrength={materialProps.aberrationStrength}
            ior={materialProps.ior}
            fresnel={materialProps.fresnel}
            color={materialProps.color}
            transmission={materialProps.transmission}
            toneMapped={false}
            fastChroma
          />
        </mesh>
      </Caustics>
    </group>
  );
};

export default DiamondModel;
