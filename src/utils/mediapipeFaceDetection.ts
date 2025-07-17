export interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
}

export interface MediaPipeFaceResult {
  multiFaceLandmarks: MediaPipeLandmark[][];
}

export class MediaPipeFaceDetector {
  private faceMesh: any = null;
  private camera: any = null;
  private isInitialized = false;
  private onResultsCallback: ((results: MediaPipeFaceResult) => void) | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;

  async initialize(): Promise<void> {
    try {
      console.log('Initializing MediaPipe Face Mesh...');
      
      // Load MediaPipe scripts dynamically
      await this.loadMediaPipeScripts();
      
      // Wait for MediaPipe to be available
      await this.waitForMediaPipe();
      
      const { FaceMesh } = window as any;
      
      this.faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.faceMesh.onResults((results: any) => {
        if (this.onResultsCallback) {
          this.onResultsCallback(results);
        }
      });

      this.isInitialized = true;
      console.log('MediaPipe Face Mesh initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaPipe Face Mesh:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  private async loadMediaPipeScripts(): Promise<void> {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
    ];

    for (const src of scripts) {
      await this.loadScript(src);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private waitForMediaPipe(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkMediaPipe = () => {
        attempts++;
        
        if ((window as any).FaceMesh && (window as any).Camera) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('MediaPipe failed to load after maximum attempts'));
        } else {
          setTimeout(checkMediaPipe, 100);
        }
      };
      
      checkMediaPipe();
    });
  }

  async startCamera(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.faceMesh || !this.isInitialized) {
      throw new Error('Face Mesh not initialized');
    }

    try {
      this.videoElement = videoElement;
      
      // Get user media
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      videoElement.srcObject = this.stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          resolve();
        };
      });

      // Start processing frames
      this.processFrame();
      
      console.log('MediaPipe camera started');
    } catch (error) {
      console.error('Failed to start MediaPipe camera:', error);
      throw error;
    }
  }

  private processFrame = async () => {
    if (!this.videoElement || !this.faceMesh || !this.stream) {
      return;
    }

    try {
      // Check if video is playing and has valid dimensions
      if (this.videoElement.readyState >= 2 && 
          this.videoElement.videoWidth > 0 && 
          this.videoElement.videoHeight > 0) {
        
        await this.faceMesh.send({ image: this.videoElement });
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }

    // Continue processing if stream is active
    if (this.stream && this.stream.active) {
      this.animationFrame = requestAnimationFrame(this.processFrame);
    }
  };

  setOnResults(callback: (results: MediaPipeFaceResult) => void): void {
    this.onResultsCallback = callback;
  }

  stop(): void {
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Stop media stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Clear video element
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  dispose(): void {
    this.stop();
    if (this.faceMesh) {
      try {
        this.faceMesh.close();
      } catch (error) {
        console.warn('Error closing face mesh:', error);
      }
      this.faceMesh = null;
    }
    this.isInitialized = false;
    this.onResultsCallback = null;
  }

  isReady(): boolean {
    return this.isInitialized && this.faceMesh !== null;
  }
}