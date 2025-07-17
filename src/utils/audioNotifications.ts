// Audio notification utilities for nudges and alerts

export class AudioNotificationManager {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    // Initialize audio context on user interaction
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Facebook-style message beep (double beep)
  async playMessageBeep() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      await this.resumeAudioContext();
      
      // First beep
      this.createBeep(800, 0.1, 0.15);
      
      // Second beep after short delay
      setTimeout(() => {
        this.createBeep(600, 0.1, 0.15);
      }, 150);
    } catch (error) {
      console.warn('Failed to play message beep:', error);
    }
  }

  // Gentle reminder beep (single soft tone)
  async playReminderBeep() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      await this.resumeAudioContext();
      this.createBeep(500, 0.3, 0.1);
    } catch (error) {
      console.warn('Failed to play reminder beep:', error);
    }
  }

  // Warning beep (urgent tone)
  async playWarningBeep() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      await this.resumeAudioContext();
      
      // Three quick beeps
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.createBeep(1000, 0.1, 0.2);
        }, i * 100);
      }
    } catch (error) {
      console.warn('Failed to play warning beep:', error);
    }
  }

  // Success beep (positive tone)
  async playSuccessBeep() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      await this.resumeAudioContext();
      
      // Rising tone sequence
      this.createBeep(400, 0.1, 0.1);
      setTimeout(() => this.createBeep(600, 0.1, 0.1), 100);
      setTimeout(() => this.createBeep(800, 0.2, 0.1), 200);
    } catch (error) {
      console.warn('Failed to play success beep:', error);
    }
  }

  private createBeep(frequency: number, duration: number, volume: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Smooth volume envelope
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null;
  }
}

// Global audio manager instance
export const audioManager = new AudioNotificationManager();