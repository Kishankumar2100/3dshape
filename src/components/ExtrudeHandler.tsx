import React, { useState, useEffect } from "react";
import * as BABYLON from "@babylonjs/core";
import earcut from "earcut";

interface ExtrudeHandlerProps {
  sceneRef: React.RefObject<BABYLON.Scene>;
  points: BABYLON.Vector3[];
  setPoints: React.Dispatch<React.SetStateAction<BABYLON.Vector3[]>>;
  linesCollection: BABYLON.LinesMesh[];
  setLinesCollection: React.Dispatch<React.SetStateAction<BABYLON.LinesMesh[]>>;
  isShapeClosed: boolean;
  setIsShapeClosed: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShape: BABYLON.Mesh | null;
  setSelectedShape: React.Dispatch<React.SetStateAction<BABYLON.Mesh | null>>;
}

const ExtrudeHandler: React.FC<ExtrudeHandlerProps> = ({
  sceneRef,
  points,
  setPoints,
  linesCollection,
  setLinesCollection,
  isShapeClosed,
  setIsShapeClosed,
}) => {
  const [extrudeHeight, setExtrudeHeight] = useState<number>(1);
  const [isHeightSelectionVisible, setIsHeightSelectionVisible] = useState<boolean>(false);
  const [selectedShape, setSelectedShape] = useState<BABYLON.Mesh | null>(null);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtrudeHeight(parseFloat(e.target.value));
  };

  const initiateExtrude = () => {
    if (!sceneRef.current) return;
    if (points.length < 3) {
      alert("Minimum 3 points are required");
      clearSketch();
      return;
    }
    setIsHeightSelectionVisible(true);
  };

  const extrudeShape = () => {
    if (!sceneRef.current) return;

    const shape = points.map((p) => new BABYLON.Vector3(p.x, 0, p.z));
    const extrudedMesh = BABYLON.MeshBuilder.ExtrudePolygon(
      `extrudedShape`,
      {
        shape,
        depth: extrudeHeight,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        updatable: true,
        wrap: true,
      },
      sceneRef.current,
      earcut
    );

    extrudedMesh.position.y = extrudeHeight;
    extrudedMesh.convertToFlatShadedMesh();

    // Assign a beige material to the extruded shape
    const beigeMaterial = new BABYLON.StandardMaterial("extrudeMaterial", sceneRef.current);
    beigeMaterial.diffuseColor = new BABYLON.Color3(0.96, 0.96, 0.86); // Beige color
    extrudedMesh.material = beigeMaterial;
    extrudedMesh.metadata = { defaultMaterial: beigeMaterial }; // Store original material

    // Remove drawn lines after extrusion
    linesCollection.forEach((line) => line.dispose());
    setLinesCollection([]);

    // Hide UI and clear sketch
    setIsHeightSelectionVisible(false);
    clearSketch();
  };

  const clearSketch = () => {
    setPoints([]);
    setIsShapeClosed(false);
  };

  // Function to highlight the selected shape
  const selectShape = (mesh: BABYLON.AbstractMesh | null) => {
    if (!mesh || !(mesh instanceof BABYLON.Mesh)) return;

    // Restore previous shape's original material if another shape is selected
    if (selectedShape && selectedShape.metadata?.defaultMaterial) {
      selectedShape.material = selectedShape.metadata.defaultMaterial;
    }

    // Set new selected shape
    setSelectedShape(mesh);

    // Apply highlight color
    const highlightMaterial = new BABYLON.StandardMaterial("highlightMaterial", sceneRef.current);
    highlightMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0); 
    mesh.material = highlightMaterial;
  };

  // Add event listener for shape selection
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const handlePointerDown = (evt: BABYLON.IPointerEvent, pickInfo: BABYLON.PickingInfo) => {
      if (pickInfo.hit && pickInfo.pickedMesh) {
        selectShape(pickInfo.pickedMesh);
      }
    };

    scene.onPointerDown = handlePointerDown;
    return () => {
      scene.onPointerDown = undefined;
    };
  }, [selectedShape]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", marginTop: "10px" }}>
      {!isHeightSelectionVisible && (
        <button onClick={initiateExtrude} style={{ padding: "5px 10px", cursor: "pointer" }}>
          Extrude
        </button>
      )}

      {isHeightSelectionVisible && (
        <>
          <input
            type="number"
            value={extrudeHeight}
            onChange={handleHeightChange}
            min="0.1"
            step="0.1"
            placeholder="Enter extrusion height"
            style={{ padding: "5px", width: "150px" }}
          />
          <button onClick={extrudeShape} style={{ padding: "5px 10px", cursor: "pointer" }}>
            Confirm Extrude
          </button>
        </>
      )}
    </div>
  );
};

export default ExtrudeHandler;
