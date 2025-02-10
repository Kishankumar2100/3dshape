import React, { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";

interface MoveHandlerProps {
  sceneRef: React.RefObject<BABYLON.Scene>;
  groundRef: React.RefObject<BABYLON.Mesh>;
  selectedGeometry: BABYLON.Mesh | null;
  setSelectedGeometry: React.Dispatch<React.SetStateAction<BABYLON.Mesh | null>>;
}

const MoveHandler: React.FC<MoveHandlerProps> = ({
  sceneRef,
  groundRef,
  selectedGeometry,
  setSelectedGeometry
}) => {
  const initialOffsetRef = useRef<BABYLON.Vector3 | null>(null);
  const isDraggingRef = useRef(false);

  const getGroundPosition = () => {
    if (!sceneRef.current || !groundRef.current) return null;

    const pickInfo = sceneRef.current.pick(
      sceneRef.current.pointerX,
      sceneRef.current.pointerY,
      (mesh) => mesh === groundRef.current
    );

    return pickInfo?.hit ? pickInfo.pickedPoint : null;
  };

  const pointerDown = (pickInfo: BABYLON.PickingInfo) => {
    if (!sceneRef.current || !selectedGeometry || !pickInfo.hit || pickInfo.pickedMesh === groundRef.current) return;

    isDraggingRef.current = true;
    const groundPos = getGroundPosition();
    if (groundPos) {
      initialOffsetRef.current = selectedGeometry.position.subtract(groundPos);
    }
  };

  const pointerMove = () => {
    if (!sceneRef.current || !selectedGeometry || !isDraggingRef.current) return;

    const groundPos = getGroundPosition();
    if (groundPos && initialOffsetRef.current) {
      selectedGeometry.position = groundPos.add(initialOffsetRef.current);
    }
  };

  const pointerUp = () => {
    isDraggingRef.current = false;
    initialOffsetRef.current = null;
  };

  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    scene.onPointerDown = (evt, pickInfo) => pointerDown(pickInfo);
    scene.onPointerMove = () => pointerMove();
    scene.onPointerUp = () => pointerUp();

    return () => {
      scene.onPointerDown = undefined;
      scene.onPointerMove = undefined;
      scene.onPointerUp = undefined;
    };
  }, [selectedGeometry]);

  return null;
};

export default MoveHandler;
