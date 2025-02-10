import { useEffect, useState, useRef } from "react";
import * as BABYLON from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials/grid";

export const useDrawingTools = (canvasElement: React.RefObject<HTMLCanvasElement>) => {
  const engineRef = useRef<BABYLON.Engine>(null!);
  const sceneRef = useRef<BABYLON.Scene>(null!);
  const groundRef = useRef<BABYLON.Mesh>(null!);
  const cameraRef = useRef<BABYLON.ArcRotateCamera>(null!);

  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [vertices, setVertices] = useState<BABYLON.Vector3[]>([]);
  const [linesCollection, setLinesCollection] = useState<BABYLON.LinesMesh[]>([]);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const [isTransformActive, setIsTransformActive] = useState(false);

  useEffect(() => {
    if (canvasElement.current) {
      const engine = new BABYLON.Engine(canvasElement.current, true);
      engineRef.current = engine;

      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Black background
      sceneRef.current = scene;

      const lighting = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 1), scene);
      lighting.intensity = 0.8;

      const cameraInstance = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 3,
        15,
        BABYLON.Vector3.Zero(),
        scene
      );
      cameraInstance.attachControl(canvasElement.current, true);
      cameraRef.current = cameraInstance;

      // Ground Plane with Grid Material
      const ground = BABYLON.MeshBuilder.CreateGround("groundPlane", { width: 20, height: 20 }, scene);
      const gridMaterial = new GridMaterial("gridMaterial", scene);
      gridMaterial.majorUnitFrequency = 5;
      gridMaterial.minorUnitVisibility = 0.45;
      gridMaterial.gridRatio = 1;
      gridMaterial.mainColor = BABYLON.Color3.White();
      gridMaterial.lineColor = BABYLON.Color3.Black();
      gridMaterial.opacity = 0.8;
      ground.material = gridMaterial;
      groundRef.current = ground;

      engine.runRenderLoop(() => {
        scene.render();
      });

      const resizeHandler = () => engine.resize();
      window.addEventListener("resize", resizeHandler);

      return () => {
        window.removeEventListener("resize", resizeHandler);
        engine.dispose();
      };
    }
  }, [canvasElement]);

  const toggleMoveMode = () => {
    setIsTransformActive((prev) => {
      if (cameraRef.current) {
        prev ? cameraRef.current.attachControl(canvasElement.current, false) : cameraRef.current.detachControl();
      }
      return !prev;
    });
  };

  const toggleDrawingMode = () => setIsDrawingActive((prev) => !prev);

  return {
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
  };
};
