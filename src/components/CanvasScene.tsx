import React, { useRef, useState, useEffect } from "react";
import { useDrawingTools } from "../utils/useDrawingTools.ts";
import SketchHandler from "./SketchHandler.tsx";
import ExtrudeHandler from "./ExtrudeHandler.tsx";
import MoveHandler from "./MoveHandler.tsx";
// import VertexHandler from "./VertexHandler.tsx";
import * as BABYLON from "@babylonjs/core";

const CanvasScene: React.FC = () => {
  const canvasElement = useRef<HTMLCanvasElement>(null!);

  const {
    sceneRef,
    groundRef,
    isDrawingActive,
    toggleDrawingMode,
    vertices,
    setVertices,
    linesCollection,
    setLinesCollection,
    isShapeClosed,
    setIsShapeClosed,
    isTransformActive,
    toggleMoveMode,
  } = useDrawingTools(canvasElement);

  // State for selected shape
  const [selectedGeometry, setSelectedGeometry] = useState<BABYLON.Mesh | null>(null);
  // const [isVertexEditMode, setIsVertexEditMode] = useState(false);

  // Resize canvas dynamically
  useEffect(() => {
    const handleResize = () => {
      if (canvasElement.current) {
        canvasElement.current.width = window.innerWidth;
        canvasElement.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial set
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to select a shape
  const handleSelectGeometry = (pickInfo: BABYLON.PickingInfo) => {
    if (!sceneRef.current) return;
    const { hit, pickedMesh } = pickInfo;
    if (!hit || !pickedMesh || pickedMesh === groundRef.current) return;

    setSelectedGeometry(pickedMesh as BABYLON.Mesh); // Store selected shape
  };

  return (
    <>
      
      <div
        style={{
          zIndex: 999,
          width: "100%",
          position: "absolute",
          top: "0px",
          left: "0px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
        }}
      >
        <button onClick={toggleDrawingMode}>
          {isDrawingActive ? "Exit Draw Mode" : "Draw Mode"}
        </button>

        <button 
          onClick={toggleMoveMode} 
          disabled={!selectedGeometry} // Disable button if no shape is selected
        >
          {isTransformActive ? "Exit Move Mode" : "Move Object"}
        </button>

        {/* Vertex Edit Mode Button
        <button 
          onClick={() => setIsVertexEditMode((prev) => !prev)}
          disabled={!selectedGeometry}
        >
          {isVertexEditMode ? "Exit Vertex Edit Mode" : "Vertex Edit Mode"}
        </button> */}

        {/* Extrude Button */}
        <ExtrudeHandler
          sceneRef={sceneRef}
          points={vertices}
          setPoints={setVertices}
          linesCollection={linesCollection}
          setLinesCollection={setLinesCollection}
          isShapeClosed={isShapeClosed}
          setIsShapeClosed={setIsShapeClosed}
          selectedShape={selectedGeometry} 
          setSelectedShape={setSelectedGeometry}  
        />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasElement}
        style={{ position: "absolute", top: "0px", left: "0px" }}
        onClick={() => {
          if (!sceneRef.current) return;
          const pickInfo = sceneRef.current.pick(sceneRef.current.pointerX, sceneRef.current.pointerY);
          if (pickInfo) handleSelectGeometry(pickInfo);
        }}
      />

      {/* SketchHandler for drawing */}
      <SketchHandler
        sceneRef={sceneRef}
        groundRef={groundRef}
        isDrawingActive={isDrawingActive}
        toggleDrawingMode={toggleDrawingMode}
        vertices={vertices}
        setVertices={setVertices}
        linesCollection={linesCollection}
        setLinesCollection={setLinesCollection}
        isShapeClosed={isShapeClosed}
        toggleShapeClosure={() => setIsShapeClosed((prev) => !prev)}
      />

      {/* MoveHandler for moving selected objects */}
      {isTransformActive && selectedGeometry && (
        <MoveHandler
          sceneRef={sceneRef}
          groundRef={groundRef}
          selectedGeometry={selectedGeometry}
          setSelectedGeometry={setSelectedGeometry}
        />
      )}

      {/* VertexHandler for editing vertices
      {isVertexEditMode && selectedGeometry && sceneRef.current?.activeCamera && (
        <VertexHandler
          sceneRef={sceneRef}
          camera={sceneRef.current.activeCamera as BABYLON.ArcRotateCamera}
          groundRef={groundRef}
          selectedGeometry={selectedGeometry}
          setSelectedGeometry={setSelectedGeometry}
        />
      )} */}
    </>
  );
};

export default CanvasScene;
