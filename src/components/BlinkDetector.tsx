import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle, Eye, Activity } from 'lucide-react';
import { BlinkDetector as BlinkDetectorUtil, calculateEAR, extractEyeLandmarks } from '../utils/eyeAspectRatio';
import { MediaPipeFaceDetector, MediaPipeFaceResult } from '../utils/mediapipeFaceDetection';

interface BlinkDetectorProps {
  isActive: boolean;
  onBlinkDetected?: () => void;
  onBlinkRateUpdate?: (rate: number) => void;
}

const BlinkDetector: React.FC<BlinkDetectorProps> = ({
  isActive,
  onBlinkDetected,
  onBlinkRateUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<MediaPipeFaceDetector>(new MediaPipeFaceDetector());
  const blinkDetectorRef = useRef<BlinkDetectorUtil>(new BlinkDetectorUtil());
  
  const [isCamera, setIsCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentEAR, setCurrentEAR] = useState(0);
  const [detectorReady, setDetectorReady] = useState(false);

  // Initialize MediaPipe detector
  useEffect(() => {
    const initializeDetector = async () => {
      setIsLoading(true);
      try {
        await detectorRef.current.initialize();
        setDetectorReady(true);
        console.log('MediaPipe Face Detector ready');
      } catch (err) {
        console.error('Detector initialization failed:', err);
        setError(`Failed to initialize face detection: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDetector();

    return () => {
      detectorRef.current.dispose();
    };
  }, []);

  // Handle MediaPipe results
  const handleResults = useCallback((results: MediaPipeFaceResult) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];

      // Draw all landmarks
      ctx.fillStyle = '#00FF00';
      landmarks.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 1, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Extract and draw eye landmarks
      const { leftEye, rightEye } = extractEyeLandmarks(landmarks);
      
      if (leftEye.length === 6 && rightEye.length === 6) {
        // Draw left eye (green)
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        leftEye.forEach((point, index) => {
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();

        // Draw right eye (red)
        ctx.strokeStyle = '#FF0000';
        ctx.beginPath();
        rightEye.forEach((point, index) => {
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();

        // Calculate EAR and detect blinks
        const leftEAR = calculateEAR(leftEye);
        const rightEAR = calculateEAR(rightEye);
        const avgEAR = (leftEAR + rightEAR) / 2;
        
        setCurrentEAR(avgEAR);

        // Detect blink
        const blinkDetected = blinkDetectorRef.current.detectBlink(leftEAR, rightEAR);
        if (blinkDetected && onBlinkDetected) {
          onBlinkDetected();
        }

        // Update blink rate
        if (onBlinkRateUpdate) {
          const rate = blinkDetectorRef.current.getBlinkRate();
          onBlinkRateUpdate(rate);
        }
      }
    } else {
      setFaceDetected(false);
    }
  }, [onBlinkDetected, onBlinkRateUpdate]);

  // Camera management
  useEffect(() => {
    const startCamera = async () => {
      if (!isActive || !detectorReady || !videoRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Set up MediaPipe results handler
        detectorRef.current.setOnResults(handleResults);

        // Start MediaPipe camera
        await detectorRef.current.startCamera(videoRef.current);
        
        setIsCamera(true);
        setIsLoading(false);
        
        // Set canvas size
        if (canvasRef.current) {
          canvasRef.current.width = 640;
          canvasRef.current.height = 480;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Camera access denied. Please allow camera permissions and refresh the page.');
        setIsCamera(false);
        setIsLoading(false);
      }
    };

    const stopCamera = () => {
      detectorRef.current.stop();
      setIsCamera(false);
      setFaceDetected(false);
      setIsLoading(false);
    };

    if (isActive && detectorReady) {
      startCamera();
    } else {
      stopCamera();
    }

    return stopCamera;
  }, [isActive, detectorReady, handleResults]);

  // Reset blink detector when monitoring starts
  useEffect(() => {
    if (isActive) {
      blinkDetectorRef.current.reset();
    }
  }, [isActive]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Real-time Blink Detection</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {faceDetected ? (
              <Eye className="w-5 h-5 text-green-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-sm font-medium ${faceDetected ? 'text-green-600' : 'text-gray-400'}`}>
              {faceDetected ? 'Face Detected' : 'No Face'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isCamera ? (
              <Camera className="w-5 h-5 text-green-600" />
            ) : (
              <CameraOff className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-sm font-medium ${isCamera ? 'text-green-600' : 'text-gray-400'}`}>
              {isLoading ? 'Initializing...' : isCamera ? 'Camera Active' : 'Camera Inactive'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Feed with Overlay */}
        <div className="relative">
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
            
            {isActive && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>MediaPipe Detection</span>
              </div>
            )}

            {isActive && faceDetected && (
              <div className="absolute top-4 right-4 bg-green-600 bg-opacity-90 text-white px-3 py-1 rounded-full text-sm">
                Face Tracked
              </div>
            )}
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Live Detection Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eye Aspect Ratio</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-200 ${
                        currentEAR < 0.25 ? 'bg-red-500' : 
                        currentEAR < 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(currentEAR * 200, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {currentEAR.toFixed(3)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Blink Threshold</span>
                <span className="text-sm font-medium">0.250</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Blinks</span>
                <span className="text-sm font-medium">{blinkDetectorRef.current.getBlinkCount()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Face Detection</span>
                <span className={`text-sm font-medium ${faceDetected ? 'text-green-600' : 'text-gray-400'}`}>
                  {faceDetected ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Detector Status</span>
                <span className={`text-sm font-medium ${detectorReady ? 'text-green-600' : 'text-yellow-600'}`}>
                  {detectorReady ? 'Ready' : 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">MediaPipe Face Mesh</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Direct MediaPipe implementation</li>
              <li>• 468 facial landmarks</li>
              <li>• Real-time eye tracking</li>
              <li>• Optimized for performance</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Usage Tips</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Position face clearly in camera view</li>
              <li>• Ensure good lighting conditions</li>
              <li>• Maintain 18-24 inches from camera</li>
              <li>• Avoid excessive head movement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlinkDetector;