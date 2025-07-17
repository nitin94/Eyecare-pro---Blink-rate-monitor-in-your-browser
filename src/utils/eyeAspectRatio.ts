import { MediaPipeLandmark } from './mediapipeFaceDetection';

// MediaPipe Face Mesh landmark indices for eyes (468 landmarks total)
// Left eye landmarks (viewer's perspective - person's right eye)
export const LEFT_EYE_LANDMARKS = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
];

// Right eye landmarks (viewer's perspective - person's left eye)
export const RIGHT_EYE_LANDMARKS = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
];

// Simplified eye contour for EAR calculation (6 points each)
export const LEFT_EYE_EAR_POINTS = [33, 160, 158, 133, 153, 144];
export const RIGHT_EYE_EAR_POINTS = [362, 385, 387, 263, 373, 380];

/**
 * Calculate Eye Aspect Ratio (EAR) for blink detection
 * EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
 */
export function calculateEAR(eyeLandmarks: MediaPipeLandmark[]): number {
  if (eyeLandmarks.length !== 6) {
    return 0;
  }

  try {
    // Vertical distances
    const vertical1 = euclideanDistance(eyeLandmarks[1], eyeLandmarks[5]);
    const vertical2 = euclideanDistance(eyeLandmarks[2], eyeLandmarks[4]);
    
    // Horizontal distance
    const horizontal = euclideanDistance(eyeLandmarks[0], eyeLandmarks[3]);
    
    if (horizontal === 0) {
      return 0;
    }
    
    // Calculate EAR
    const ear = (vertical1 + vertical2) / (2.0 * horizontal);
    return ear;
  } catch (error) {
    console.error('Error calculating EAR:', error);
    return 0;
  }
}

function euclideanDistance(point1: MediaPipeLandmark, point2: MediaPipeLandmark): number {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Extract eye landmarks from MediaPipe face landmarks
 */
export function extractEyeLandmarks(faceLandmarks: MediaPipeLandmark[]) {
  if (faceLandmarks.length < 468) {
    return { leftEye: [], rightEye: [] };
  }

  try {
    const leftEye = LEFT_EYE_EAR_POINTS.map(index => faceLandmarks[index]);
    const rightEye = RIGHT_EYE_EAR_POINTS.map(index => faceLandmarks[index]);
    
    return { leftEye, rightEye };
  } catch (error) {
    console.error('Error extracting eye landmarks:', error);
    return { leftEye: [], rightEye: [] };
  }
}

/**
 * Blink detection using EAR values
 */
export class BlinkDetector {
  private earBuffer: number[] = [];
  private readonly bufferSize = 5;
  private readonly blinkThreshold = 0.25;
  private readonly consecutiveFrames = 3;
  private isBlinking = false;
  private blinkCount = 0;
  private lastBlinkTime = 0;
  private blinkTimes: number[] = [];

  detectBlink(leftEAR: number, rightEAR: number): boolean {
    const avgEAR = (leftEAR + rightEAR) / 2;
    
    // Validate EAR values
    if (isNaN(avgEAR) || avgEAR <= 0) {
      return false;
    }
    
    // Add to buffer
    this.earBuffer.push(avgEAR);
    if (this.earBuffer.length > this.bufferSize) {
      this.earBuffer.shift();
    }

    // Need enough frames to make decision
    if (this.earBuffer.length < this.consecutiveFrames) {
      return false;
    }

    // Check if recent frames are below threshold
    const recentFrames = this.earBuffer.slice(-this.consecutiveFrames);
    const belowThreshold = recentFrames.every(ear => ear < this.blinkThreshold);

    const currentTime = Date.now();
    
    if (belowThreshold && !this.isBlinking) {
      // Start of blink
      this.isBlinking = true;
    } else if (!belowThreshold && this.isBlinking) {
      // End of blink
      this.isBlinking = false;
      
      // Minimum time between blinks (200ms)
      if (currentTime - this.lastBlinkTime > 200) {
        this.blinkCount++;
        this.lastBlinkTime = currentTime;
        this.blinkTimes.push(currentTime);
        
        // Keep only last minute of blinks for rate calculation
        const oneMinuteAgo = currentTime - 60000;
        this.blinkTimes = this.blinkTimes.filter(time => time > oneMinuteAgo);
        
        return true;
      }
    }

    return false;
  }

  getBlinkCount(): number {
    return this.blinkCount;
  }

  getBlinkRate(): number {
    const currentTime = Date.now();
    const oneMinuteAgo = currentTime - 60000;
    const recentBlinks = this.blinkTimes.filter(time => time > oneMinuteAgo);
    return recentBlinks.length;
  }

  getCurrentEAR(): number {
    return this.earBuffer.length > 0 ? this.earBuffer[this.earBuffer.length - 1] : 0;
  }

  reset(): void {
    this.earBuffer = [];
    this.isBlinking = false;
    this.blinkCount = 0;
    this.lastBlinkTime = 0;
    this.blinkTimes = [];
  }
}