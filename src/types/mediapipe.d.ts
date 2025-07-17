// MediaPipe type definitions
declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    FACEMESH_TESSELATION: any;
    FACEMESH_RIGHT_EYE: any;
    FACEMESH_LEFT_EYE: any;
    FACEMESH_FACE_OVAL: any;
  }
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface FaceMeshResults {
  multiFaceLandmarks: Landmark[][];
}

export interface EyeLandmarks {
  leftEye: Landmark[];
  rightEye: Landmark[];
}

export {};