import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Grid,
  PerspectiveCamera,
  Caustics,
  CubeCamera,
  RandomizedLight,
  AccumulativeShadows,
  MeshRefractionMaterial,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EffectComposer, Bloom, SSAO } from "@react-three/postprocessing";

// color model
const DIAMOND_COLORS = {
  // GIA Diamond Color Scale
  white: [
    { name: "D (Colorless)", hex: "#ffffff" },
    { name: "E (Colorless)", hex: "#f5f5f5" },
    { name: "F (Colorless)", hex: "#eeeeee" },
  ],
  yellow: [
    { name: "G (Near Colorless)", hex: "#f0e68c" },
    { name: "H (Near Colorless)", hex: "#ffd700" },
    { name: "I (Near Colorless)", hex: "#ffa500" },
  ],
  brown: [
    { name: "J (Near Colorless)", hex: "#8b4513" },
    { name: "K (Faint Color)", hex: "#a0522d" },
    { name: "L (Faint Color)", hex: "#cd853f" },
  ],
  fancy: [
    { name: "Fancy Yellow", hex: "#ffdb58" },
    { name: "Fancy Pink", hex: "#ffc0cb" },
    { name: "Fancy Blue", hex: "#87ceeb" },
    { name: "Fancy Green", hex: "#50c878" },
  ],
};

// color palette
const DiamondColorPalette = ({ onColorSelect, currentColor }) => {
  return (
    <div className="flex flex-col space-y-2">
      {Object.entries(DIAMOND_COLORS).map(([category, colors]) => (
        <div key={category} className="mb-2">
          <h4 className="text-sm font-semibold capitalize mb-1">
            {category} Tones
          </h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.hex}
                onClick={() => onColorSelect(color.hex)}
                className={`w-8 h-8 rounded-full border-2 ${
                  currentColor === color.hex
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                style={{
                  backgroundColor: color.hex,
                  boxShadow:
                    currentColor === color.hex
                      ? "0 0 0 2px white, 0 0 0 4px blue"
                      : "",
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Scene setup component to handle lighting and environment
const SceneSetup = ({ children }) => {
  const { scene } = useThree();

  return (
    <>
      <color attach="background" args={['#f8f8f8']} />
      <ambientLight intensity={0.5 * Math.PI} />
      <spotLight 
        decay={0} 
        position={[5, 5, -10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={3}
        castShadow
      />
      <pointLight decay={0} position={[-10, -10, -10]} intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
      
      <Grid 
        position={[0, -1, 0]} 
        args={[10, 10]} 
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#D0D0D0" 
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#A0A0A0"
        fadeDistance={30}
      />
      
      <AccumulativeShadows
        temporal
        frames={100}
        color="#FFB366"
        colorBlend={2}
        toneMapped={true}
        alphaTest={0.7}
        opacity={1}
        scale={12}
        position={[0, -1, 0]}>
        <RandomizedLight 
          amount={8} 
          radius={10} 
          ambient={0.5} 
          position={[5, 5, -10]} 
          bias={0.001} 
        />
      </AccumulativeShadows>
      
      {children}
    </>
  );
};

// Realistic DiamondModel component
// const DiamondModel = ({ 
//   modelPath, 
//   materialProps, 
//   showWireframe = false 
// }) => {
//   const { shape } = useParams();
//   const { scene: originalScene } = useGLTF(modelPath);
//   const modelRef = useRef();
//   const [model, setModel] = useState(null);
//   const [boundingBox, setBoundingBox] = useState(null);
  
//   // Load HDR environment map for realistic reflections
//   const texture = useLoader(
//     RGBELoader, 
//     'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr'
//   );

//   useEffect(() => {
//     if (originalScene) {
//       // Clone the entire scene to avoid mutating the original
//       const clonedScene = originalScene.clone();

//       // Define a mapping between URL shape parameter and model object names
//       const shapeToModelName = {
//         round: ["round", "round_brilliant", "round_diamond"],
//         princess: ["princess", "princess_cut", "square"],
//         cushion: ["cushion", "cushion_cut"],
//         oval: ["oval", "oval_cut", "oval_diamond"],
//         emerald: ["emerald", "emerald_cut", "rect"],
//         radiant: ["radiant", "radiant_cut"],
//         asscher: ["asscher", "asscher_cut"],
//         marquise: ["marquise", "marquise_cut"],
//         pear: ["pear", "pear_shaped", "tear"],
//         heart: ["heart", "heart_shaped", "heart_cut"],
//       };

//       // Get possible model names for the current shape
//       const possibleModelNames = shapeToModelName[shape.toLowerCase()] || [
//         shape.toLowerCase(),
//       ];

//       // Find the specific shape model
//       let selectedModel = null;

//       clonedScene.traverse((child) => {
//         if (child.isMesh) {
//           // Check if the child's name matches any possible model names
//           for (const possibleName of possibleModelNames) {
//             if (child.name.toLowerCase().includes(possibleName)) {
//               selectedModel = child;
//               break;
//             }
//           }
//         }
//       });

//       // If we couldn't find the specific shape, fall back to the first mesh as default
//       if (!selectedModel) {
//         clonedScene.traverse((child) => {
//           if (child.isMesh && !selectedModel) {
//             console.log(
//               `Could not find ${shape} diamond model, using fallback: ${child.name}`
//             );
//             selectedModel = child;
//           }
//         });
//       }

//       if (selectedModel) {
//         // Calculate bounding box for proper camera framing
//         const bbox = new THREE.Box3().setFromObject(selectedModel);
//         setBoundingBox(bbox);

//         // Create a group to hold both solid and wireframe versions
//         const modelGroup = new THREE.Group();

//         // Create the realistic diamond with refraction material
//         const solidModelClone = selectedModel.clone();
//         modelGroup.add(solidModelClone);

//         // Wireframe model (if showWireframe is true)
//         if (showWireframe) {
//           const wireframeModelClone = selectedModel.clone();
//           const wireframeMaterial = new THREE.MeshBasicMaterial({
//             color: 0x000000,
//             wireframe: true,
//             transparent: true,
//             opacity: 0.3,
//           });
//           wireframeModelClone.material = wireframeMaterial;
//           modelGroup.add(wireframeModelClone);
//         }

//         // Center the model based on its bounding box
//         const center = new THREE.Vector3();
//         bbox.getCenter(center);
//         modelGroup.position.set(-center.x, -center.y, -center.z);

//         setModel({ group: modelGroup, geometry: selectedModel.geometry });
//       } else {
//         console.error(`No diamond model found for shape: ${shape}`);
//       }
//     }
//   }, [originalScene, shape, showWireframe, texture]);

//   if (!model) return null;

//   return (
//     <group ref={modelRef}>
//       <CubeCamera resolution={256} frames={1} envMap={texture}>
//         {(envTexture) => (
//           <Caustics
//             backfaces
//             color={materialProps.color}
//             position={[0, -0.8, 0]}
//             lightSource={[5, 5, -10]}
//             worldRadius={0.1}
//             ior={1.8}
//             backfaceIor={1.1}
//             intensity={0.15}>
//             <mesh 
//               castShadow 
//               geometry={model.geometry} 
//               scale={1}
//               rotation={[0, 0, 0]}
//             >
//               <MeshRefractionMaterial 
//                 envMap={envTexture}
//                 bounces={materialProps.bounces}
//                 aberrationStrength={materialProps.aberrationStrength}
//                 ior={materialProps.ior}
//                 fresnel={materialProps.fresnel}
//                 color={materialProps.color}
//                 toneMapped={false}
//               />
//             </mesh>
//           </Caustics>
//         )}
//       </CubeCamera>
//     </group>
//   );
// };

// Updated DiamondModel component with proper model mapping
const DiamondModel = ({ 
  modelPath, 
  materialProps, 
  showWireframe = false 
}) => {
  const { shape } = useParams();
  const { scene: originalScene } = useGLTF(modelPath);
  const modelRef = useRef();
  const [model, setModel] = useState(null);
  
  // Create a direct mapping between URL shape names and GLB model names
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
    cushionedrectangular: "Gem_Cushioned_Rectangular"
  };

  useEffect(() => {
    if (originalScene) {
      // Clone the scene to avoid mutating the original
      const clonedScene = originalScene.clone();
      let selectedModel = null;

      // Find the specific model by name
      const targetName = shapeToModelName[shape.toLowerCase()];
      
      if (targetName) {
        clonedScene.traverse((child) => {
          if (child.isMesh && child.name === targetName) {
            console.log(`Found model: ${child.name} for shape: ${shape}`);
            selectedModel = child;
          }
        });
      }

      if (!selectedModel) {
        // Fallback to first mesh if specific model not found
        clonedScene.traverse((child) => {
          if (child.isMesh && !selectedModel) {
            console.warn(
              `Could not find ${shape} diamond model, using fallback: ${child.name}`
            );
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
    <group ref={modelRef}>
      <CubeCamera resolution={256} frames={1}>
        {(envTexture) => (
          <Caustics
            backfaces
            color={materialProps.color}
            position={[0, -0.8, 0]}
            lightSource={[5, 5, -10]}
            worldRadius={0.1}
            ior={1.8}
            backfaceIor={1.1}
            intensity={0.15}>
            <mesh 
              castShadow 
              geometry={model.geometry} 
              scale={1}
              rotation={[0, 0, 0]}
            >
              <MeshRefractionMaterial 
                envMap={envTexture}
                bounces={materialProps.bounces}
                aberrationStrength={materialProps.aberrationStrength}
                ior={materialProps.ior}
                fresnel={materialProps.fresnel}
                color={materialProps.color}
                toneMapped={false}
              />
            </mesh>
          </Caustics>
        )}
      </CubeCamera>
      
      {showWireframe && (
        <mesh geometry={model.geometry}>
          <meshBasicMaterial 
            wireframe
            color="black"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

// Custom auto-rotation component
const AutoRotate = ({ enabled, rotationSpeed = 0.01 }) => {
  const { scene } = useThree();

  useFrame(() => {
    if (enabled && scene) {
      scene.rotation.y += rotationSpeed;
    }
  });

  return null;
};

// DiamondViewControls component
const DiamondViewControls = ({
  autoRotate,
  setAutoRotate,
  materialProps,
  setMaterialProps,
  showWireframe,
  setShowWireframe,
  resetCamera,
}) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="mt-4 flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 rounded text-sm ${
            autoRotate ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {autoRotate ? "Stop Rotation" : "Auto Rotate"}
        </button>

        <button
          onClick={() => setShowWireframe(!showWireframe)}
          className={`px-3 py-1 rounded text-sm ${
            showWireframe ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {showWireframe ? "Hide Wireframe" : "Show Wireframe"}
        </button>

        <button
          onClick={() => setShowColorPalette(!showColorPalette)}
          className="bg-gray-200 px-3 py-1 rounded text-sm"
        >
          {showColorPalette ? "Hide Colors" : "Choose Color"}
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="bg-gray-200 px-3 py-1 rounded text-sm"
        >
          {showAdvanced ? "Hide Advanced" : "Advanced"}
        </button>

        <button
          onClick={resetCamera}
          className="bg-gray-200 px-3 py-1 rounded text-sm"
        >
          Reset View
        </button>
      </div>

      {showColorPalette && (
        <DiamondColorPalette
          onColorSelect={(color) =>
            setMaterialProps({ ...materialProps, color })
          }
          currentColor={materialProps.color}
        />
      )}

      {showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Bounces: {materialProps.bounces}
            </label>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={materialProps.bounces}
              onChange={(e) =>
                setMaterialProps({
                  ...materialProps,
                  bounces: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              IOR: {materialProps.ior.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={materialProps.ior}
              onChange={(e) =>
                setMaterialProps({
                  ...materialProps,
                  ior: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Aberration: {materialProps.aberrationStrength.toFixed(3)}
            </label>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.001"
              value={materialProps.aberrationStrength}
              onChange={(e) =>
                setMaterialProps({
                  ...materialProps,
                  aberrationStrength: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fresnel: {materialProps.fresnel.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.fresnel}
              onChange={(e) =>
                setMaterialProps({
                  ...materialProps,
                  fresnel: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// DiamondView component
const DiamondView = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const { shape, id } = useParams();
  const navigate = useNavigate();
  const [diamond, setDiamond] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWireframe, setShowWireframe] = useState(false);
  const [viewMode, setViewMode] = useState("3d"); // Default to 3D now
  const [autoRotate, setAutoRotate] = useState(true);

  const [materialProps, setMaterialProps] = useState({
    bounces: 3,
    aberrationStrength: 0.01,
    ior: 2.75,
    fresnel: 1,
    color: 'white',
  });

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(-5, 0.5, 5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  useEffect(() => {
    const fetchDiamond = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/diamonds/${shape}/${id}`
        );

        if (response.data && response.data.diamond) {
          setDiamond(response.data.diamond);
        } else {
          throw new Error("Diamond data not found in response");
        }
      } catch (err) {
        console.error("Error fetching diamond:", err);
        setError(err.message || "Failed to fetch diamond details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiamond();
  }, [id, shape]);

  const handleBack = () => {
    navigate(`/diamonds/${shape}`);
  };

  if (loading)
    return <div className="p-8 text-center">Loading diamond details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!diamond)
    return <div className="p-8 text-center">No diamond details found.</div>;

  // Determine which model to use based on diamond shape
  const getModelPath = () => {
    return "/images/GemstoneAssets.glb"; // Update with your actual path
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={handleBack}
        className="text-blue-600 hover:text-blue-800 mb-6 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back To Gallery
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Diamond 3D Viewer */}
        <div className="lg:w-1/2 h-[500px]">
          <div className="border rounded-lg p-4 bg-white h-full">
            <div className="mb-4">
              <button
                className={`px-3 py-1 rounded text-sm mr-2 ${
                  viewMode === "3d"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => setViewMode("3d")}
              >
                3D Model
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === "image"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => setViewMode("image")}
              >
                Image
              </button>
            </div>

            <div className="h-[400px] relative">
              {viewMode === "3d" ? (
                <Canvas
                  ref={canvasRef}
                  shadows
                  style={{ width: "100%", height: "100%" }}
                  camera={{ 
                    position: [-5, 0.5, 5], 
                    fov: 45,
                    near: 0.1,
                    far: 1000,
                  }}
                  gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.5,
                  }}
                >
                  <Environment
                    files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr"
                    background={false}
                    intensity={1}
                  />

                  <SceneSetup>
                    <DiamondModel
                      modelPath={getModelPath()}
                      materialProps={materialProps}
                      showWireframe={showWireframe}
                    />

                    {autoRotate && (
                      <AutoRotate
                        enabled={autoRotate}
                        rotationSpeed={0.1}
                      />
                    )}
                  </SceneSetup>

                  <OrbitControls
                    makeDefault
                    autoRotate={false} // We handle rotation manually
                    enableRotate={!autoRotate}
                    enableZoom={true}
                    enablePan={true}
                    minDistance={2}
                    maxDistance={15}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2}
                    target={[0, 0, 0]}
                  />

                  <EffectComposer>
                    <Bloom 
                      luminanceThreshold={1} 
                      intensity={2} 
                      levels={9} 
                      mipmapBlur 
                    />
                  </EffectComposer>
                </Canvas>
              ) : (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${diamond.imageUrl}`}
                  alt={`${diamond.shape} Diamond`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {viewMode === "3d" && (
              <DiamondViewControls
                autoRotate={autoRotate}
                setAutoRotate={setAutoRotate}
                materialProps={materialProps}
                setMaterialProps={setMaterialProps}
                showWireframe={showWireframe}
                setShowWireframe={setShowWireframe}
                resetCamera={resetCamera}
              />
            )}
          </div>
        </div>

        {/* Right side - Diamond Details (unchanged) */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg p-6 border">
            {/* Diamond Title */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">
                {diamond.certification || "GIA"} {diamond.carat} Carat{" "}
                {diamond.shape} Diamond
              </h1>
              <button className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>

            {/* Diamond Specs */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {diamond.carat}ct
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {diamond.color} Color
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {diamond.clarity} Clarity
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {diamond.cut}
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {diamond.certification}
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {diamond.fluorescence}
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {diamond.lengthWidthRatio}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-2xl font-bold">
                ${diamond.price?.toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm">Diamond Price</p>
            </div>

            {/* Payment Options */}
            <div className="mb-6">
              <p className="font-medium mb-2">Flexible Payment Options:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>
                  4 Interest-Free Payments of ${Math.round(diamond.price / 4)}
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium">
                SELECT THIS DIAMOND
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 rounded-md font-medium">
                CONSULT AN EXPERT
              </button>
            </div>

            {/* Shipping Info */}
            <div className="border-t pt-4">
              <p className="font-medium mb-1">
                Ships by:{" "}
                {new Date(
                  Date.now() + 3 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Order Includes Section */}
          <div className="mt-6 bg-white rounded-lg p-6 border">
            <h3 className="font-bold text-lg mb-4">Your Order Includes</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                GIA Diamond Grading Report
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiamondView;