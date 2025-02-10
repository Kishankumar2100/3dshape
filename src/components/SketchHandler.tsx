import { useEffect, useState, useCallback } from "react";
import * as BABYLON from "@babylonjs/core";

interface SketchHandlerProps {
  sceneRef: React.RefObject<BABYLON.Scene>;
  groundRef: React.RefObject<BABYLON.Mesh>;
  isDrawingActive: boolean;
  toggleDrawingMode: () => void;
  vertices: BABYLON.Vector3[];
  setVertices: React.Dispatch<React.SetStateAction<BABYLON.Vector3[]>>;
  linesCollection: BABYLON.LinesMesh[];
  setLinesCollection: React.Dispatch<React.SetStateAction<BABYLON.LinesMesh[]>>;
  isShapeClosed: boolean;
  toggleShapeClosure: () => void;
}

// Define a single fixed color for all lines
const LINE_COLOR = BABYLON.Color3.Blue();

const SketchHandler: React.FC<SketchHandlerProps> = ({
  sceneRef,
  groundRef,
  isDrawingActive,
  vertices,
  setVertices,
  linesCollection,
  setLinesCollection,
  isShapeClosed,
  toggleShapeClosure,
}) => {
  if (!sceneRef.current || !groundRef.current) return null;

  const [undoStack, setUndoStack] = useState<BABYLON.Vector3[]>([]);
  const [redoStack, setRedoStack] = useState<BABYLON.Vector3[]>([]);

  const addVertex = (point: BABYLON.Vector3) => {
    setVertices((prev) => [...prev, point]);
    setUndoStack((prev) => [...prev, point]);
    setRedoStack([]); // Clear redo stack when new points are added
  };

  const handleDrawing = () => {
    if (!sceneRef.current || !isDrawingActive) return;

    const groundName = groundRef.current?.name ?? "";
    const pickResult = sceneRef.current.pick(
      sceneRef.current.pointerX,
      sceneRef.current.pointerY,
      (mesh) => mesh.name === groundName
    );

    if (!pickResult?.hit || !pickResult.pickedPoint) return;
    addVertex(pickResult.pickedPoint);
  };

  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const handleClick = () => {
      if (isDrawingActive) {
        handleDrawing();
      }
    };

    scene.onPointerDown = handleClick;

    return () => {
      scene.onPointerDown = undefined;
    };
  }, [isDrawingActive]);

  const connectLastTwoVertices = () => {
    if (!sceneRef.current || vertices.length < 2) return;

    const newLine = BABYLON.MeshBuilder.CreateLines(
      `line${vertices.length}`,
      { points: [vertices[vertices.length - 2], vertices[vertices.length - 1]] },
      sceneRef.current
    );

    newLine.color = LINE_COLOR; // Apply fixed color
    setLinesCollection((prev) => [...prev, newLine]);
  };

  useEffect(() => {
    if (vertices.length > 1 && isDrawingActive) {
      connectLastTwoVertices();
    }
  }, [vertices.length]);

  const completeDrawing = () => {
    if (!sceneRef.current || vertices.length < 3) return;

    const finalLine = BABYLON.MeshBuilder.CreateLines(
      `line${vertices.length + 1}`,
      { points: [vertices[vertices.length - 1], vertices[0]] },
      sceneRef.current
    );

    finalLine.color = LINE_COLOR; // Apply fixed color
    setLinesCollection((prev) => [...prev, finalLine]);

    toggleShapeClosure();
  };

  useEffect(() => {
    if (isShapeClosed) {
      completeDrawing();
    }
  }, [isShapeClosed]);

  /** Undo the last action */
  const undo = useCallback(() => {
    if (vertices.length === 0) return;

    const lastVertex = vertices[vertices.length - 1];
    setRedoStack((prev) => [lastVertex, ...prev]); // Save for redo
    setVertices((prev) => prev.slice(0, -1)); // Remove last vertex

    if (linesCollection.length > 0) {
      const lastLine = linesCollection[linesCollection.length - 1];
      lastLine.dispose(); // Remove from scene
      setLinesCollection((prev) => prev.slice(0, -1)); // Remove from state
    }
  }, [vertices, linesCollection]);

  /** Redo the last undone action */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const restoredVertex = redoStack[0];
    setRedoStack((prev) => prev.slice(1)); // Remove from redo stack
    setVertices((prev) => [...prev, restoredVertex]); // Add back to vertices
  }, [redoStack]);

  /** Keyboard event listeners for undo (Ctrl+Z) and redo (Ctrl+Y) */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  return null;
};

export default SketchHandler;
