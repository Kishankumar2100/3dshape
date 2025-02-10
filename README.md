# Babylon.js 3D Shape Designer  

This project is a **3D Shape Designer** built using **Babylon.js** and **TypeScript**. It allows users to create 2D shapes, extrude them into 3D objects with adjustable height, move objects, and undo/redo actions while drawing.  




## Approach  

The project is structured into different components for better organization and maintainability.  

1. Initialized with **Vite** and **TypeScript**.  
2. Users can click on the ground mesh to create points and draw lines.  
3. Allows users to create closed 2D shapes by right click mouse on the ground mesh.  
4. Users can undo or redo actions while drawing.  
5. Users can dynamically adjust the height before finalizing the extrusion.  
6. Users can move 3D objects after creation.  
7. Smooth camera navigation for better interaction.  
8. Each mode is implemented as a separate component for modularity.  




## Challenges and Solutions  

    1. Click Event Handling for Shape Creation  
    - Issue: Inaccurate point placement.  
    - Solution: Used **raycasting** to ensure points align correctly on the ground.  

    2. Dynamic Extrusion
    - Issue: Allowing users to adjust extrusion height in real-time.  
    - Solution: Added a **slider-based height adjustment** before the final extrusion.  

    3. Undo/Redo in Draw Mode  
    - Issue: Managing drawing history without breaking the shape creation process.  
    - Solution: Implemented a **stack-based approach** to store and retrieve previous states.  

    4. Moving 3D Objects  
    - Issue: Preventing movement of other objects.  
    - Solution: Added **object selection** for movement.  




## Running the Project Locally  

  1. Clone the Repository  
```sh
  git clone https://github.com/your-username/babylon-3d-shape-designer.git
  cd babylonjs-proj
  npm install
  npm run dev

```


## Potential Improvements  


  **Snap to Grid** for precise alignment.  
  **Save & Load Designs** in `.obj` or `.glb` format.  
  **Advanced UI Tools** for rotation and scaling.   
