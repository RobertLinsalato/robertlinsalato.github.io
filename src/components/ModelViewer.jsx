import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Html, Bounds, useBounds } from '@react-three/drei';
import * as THREE from 'three';

// 1. Terminal Loading State
function Loader() {
  return (
    <Html center>
      <div style={{ 
        backgroundColor: 'var(--panel)', 
        color: 'var(--accent)', 
        padding: '0.5rem 1rem', 
        border: '1px solid var(--accent)',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)'
      }}>
        &gt; FETCHING_ASSET_DATA...
      </div>
    </Html>
  );
}

// 2. The Dynamic GLTF Loader Component
function LoadedAsset({ file, wireframe, xray, showRig, showTexture }) {
  const { scene } = useGLTF(file);
  const bounds = useBounds();
  const { controls } = useThree(); // <--- Grants direct access to the OrbitControls

  // Automatically generates the Rig visualizer from your imported armature
  const skeleton = useMemo(() => {
    if (!scene) return null;
    const helper = new THREE.SkeletonHelper(scene);
    helper.material.depthTest = false; 
    return helper;
  }, [scene]);

  // Handles traversing the scene to apply Materials and Wireframe overlays
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        
        if (!child.userData.wireframeHelper) {
          const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
          const wireframeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, // True Black
            depthTest: true, 
            opacity: 0.6, 
            transparent: true 
          });
          const line = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
          child.add(line);
          child.userData.wireframeHelper = line;
        }
        child.userData.wireframeHelper.visible = wireframe;

        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          
          materials.forEach((mat) => {
            if (mat.userData.originalOpacity === undefined) {
              mat.userData.originalOpacity = mat.opacity;
              mat.userData.originalTransparent = mat.transparent;
              mat.userData.originalMap = mat.map;
              mat.userData.originalColor = mat.color ? mat.color.clone() : new THREE.Color('#ffffff');
            }
            
            mat.map = showTexture ? mat.userData.originalMap : null;
            mat.color = showTexture ? mat.userData.originalColor : new THREE.Color('#cccccc');

            mat.transparent = xray ? true : mat.userData.originalTransparent;
            mat.opacity = xray ? 0.3 : mat.userData.originalOpacity;
            mat.depthTest = !xray;
            
            mat.wireframe = false;

            mat.needsUpdate = true;
          });
        }
      }
    });
  }, [scene, wireframe, xray, showTexture]);

  return (
    <group>
      {/* 
        onCentered fires exactly when the model finishes its move to the center.
        This fixes the "zooming into the void" race condition! 
      */}
      <Center onCentered={() => {
        bounds.refresh().clip().fit();
        
        // Force the camera's orbit point to jump back to the exact center 
        // so it forgets any previous panning the user did on the last model.
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
      }}>
        <primitive object={scene} />
      </Center>

      {/* The SkeletonHelper MUST sit outside the Center component */}
      {showRig && skeleton && <primitive object={skeleton} />}
    </group>
  );
}

// 3. The Main UI Shell
export default function ModelViewer({ assetLibrary = [] }) {
  
  if (!assetLibrary || assetLibrary.length === 0) {
    return (
      <div className="hardware-panel" style={{ textAlign: 'center', padding: '3rem', border: '1px dashed red', color: 'red' }}>
        <span className="panel-tag">/// SYS.ERROR</span>
        <p>NO ASSETS FOUND IN DIRECTORY.<br/>Please add .glb files to `/public/models/Project_Name/`</p>
      </div>
    );
  }

  const [wireframe, setWireframe] = useState(false);
  const [xray, setXray] = useState(false);
  const [showRig, setShowRig] = useState(false);
  const [showTexture, setShowTexture] = useState(true);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({ [assetLibrary[0].category]: true });
  const [activeAsset, setActiveAsset] = useState(assetLibrary[0].items[0]);

  const toggleFolder = (category) => {
    setExpandedFolders(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="hardware-panel" style={{ position: 'relative', display: 'flex', height: '600px', width: '100%', overflow: 'hidden', padding: 0, border: '1px solid var(--border)' }}>
      
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '180px' }}>
        <div style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase' }}>Asset_Data</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#ccc', wordBreak: 'break-all' }}>
            FILE: {activeAsset.name}<br/>
            STATE: LOADED
          </p>
        </div>

        <button className="terminal-btn" onClick={() => setShowRig(!showRig)} style={{ width: '100%', justifyContent: 'flex-start' }}>
          {showRig ? '> RIG: ON' : '> RIG: OFF'}
        </button>

        <button className="terminal-btn" onClick={() => setShowTexture(!showTexture)} style={{ width: '100%', justifyContent: 'flex-start' }}>
          {showTexture ? '> TEXTURE: ON' : '> TEXTURE: OFF'}
        </button>

        <button className="terminal-btn" onClick={() => setWireframe(!wireframe)} style={{ width: '100%', justifyContent: 'flex-start' }}>
          {wireframe ? '> WIREFRAME: ON' : '> WIREFRAME: OFF'}
        </button>
        
        <button className="terminal-btn" onClick={() => setXray(!xray)} style={{ width: '100%', justifyContent: 'flex-start' }}>
          {xray ? '> X-RAY: ON' : '> X-RAY: OFF'}
        </button>
      </div>

      <div style={{ 
        width: sidebarOpen ? '260px' : '45px', 
        minWidth: sidebarOpen ? '260px' : '45px',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        backgroundColor: 'var(--panel)', 
        borderRight: '1px dashed var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 30 
      }}>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: sidebarOpen ? '0.75rem' : '50%',
            transform: sidebarOpen ? 'none' : 'translateX(50%)',
            background: 'transparent',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            fontSize: '1.2rem',
            zIndex: 40
          }}
          aria-label="Toggle Directory"
        >
          {sidebarOpen ? '[<]' : '[>]'}
        </button>

        <div style={{ 
          padding: '1.5rem 1rem', 
          opacity: sidebarOpen ? 1 : 0, 
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          whiteSpace: 'nowrap',
          overflowY: 'auto'
        }}>
          <span className="panel-tag" style={{ position: 'relative', top: 0, left: 0, display: 'inline-block', width: 'fit-content', marginBottom: '0.5rem' }}>
            /// SYS.DIRECTORY
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assetLibrary.map((folder) => {
              const isOpen = expandedFolders[folder.category];
              return (
                <div key={folder.category}>
                  <button 
                    className="terminal-btn"
                    onClick={() => toggleFolder(folder.category)}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'flex-start',
                      borderStyle: 'dashed',
                      padding: '0.4rem 0.8rem'
                    }}
                  >
                    {isOpen ? '[-] ' : '[+] '}{folder.category}
                  </button>

                  {isOpen && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.25rem', 
                      marginTop: '0.5rem',
                      paddingLeft: '1rem',
                      borderLeft: '1px solid var(--border)',
                      marginLeft: '0.5rem'
                    }}>
                      {folder.items.map((asset) => (
                        <button 
                          key={asset.id}
                          className="terminal-btn"
                          style={{ 
                            justifyContent: 'flex-start',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            borderColor: activeAsset.id === asset.id ? 'var(--accent)' : 'transparent',
                            backgroundColor: activeAsset.id === asset.id ? '#222528' : 'transparent',
                            boxShadow: 'none',
                            transform: 'none'
                          }}
                          onClick={() => setActiveAsset(asset)}
                        >
                          {activeAsset.id === asset.id ? '> ' : '  '}{asset.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!sidebarOpen && (
          <div style={{
            position: 'absolute',
            top: '4rem',
            left: '50%',
            transform: 'translateX(-50%)',
            writingMode: 'vertical-rl',
            color: 'var(--accent)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            /// SYS.DIRECTORY
          </div>
        )}
      </div>

      <div style={{ flexGrow: 1, backgroundColor: 'var(--bg)', zIndex: 10 }}>
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          
          <Suspense fallback={<Loader />}>
            <Bounds fit margin={1.2}>
              <LoadedAsset 
                file={activeAsset.file} 
                wireframe={wireframe} 
                xray={xray} 
                showRig={showRig}
                showTexture={showTexture}
              />
            </Bounds>
          </Suspense>
          
          <OrbitControls 
            makeDefault 
            enableDamping 
            dampingFactor={0.05} 
          />
        </Canvas>
      </div>
    </div>
  );
}