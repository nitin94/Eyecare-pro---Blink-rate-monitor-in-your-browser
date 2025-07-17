import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle, Eye, Focus } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { showExerciseComplete } from './NotificationSystem';

const EyeExercises: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  // Load completed exercises from storage on mount
  useEffect(() => {
    const saved = StorageManager.getCompletedExercises();
    setCompletedExercises(saved);
  }, []);

  // Save completed exercises to storage whenever it changes
  useEffect(() => {
    StorageManager.saveCompletedExercises(completedExercises);
  }, [completedExercises]);

  const exercises = [
    {
      id: 'blinking',
      name: 'Conscious Blinking',
      duration: 30,
      description: 'Deliberate, complete blinks to restore eye moisture',
      instructions: [
        'Sit comfortably and look straight ahead',
        'Close your eyes slowly and completely',
        'Hold for 2 seconds',
        'Open slowly and repeat'
      ],
      benefits: 'Restores tear film, reduces dryness',
      research: 'Reduces dry eye symptoms by 40% (Tsubota & Nakamori, 1993)'
    },
    {
      id: 'focus-shift',
      name: 'Focus Shifting',
      duration: 60,
      description: 'Exercise focusing muscles to reduce strain',
      instructions: [
        'Hold your finger 6 inches from your face',
        'Focus on your finger for 3 seconds',
        'Shift focus to something 20 feet away',
        'Hold for 3 seconds, then return to finger'
      ],
      benefits: 'Reduces accommodative strain, improves focus flexibility',
      research: 'Improves focusing ability by 25% (Rosenfield, 2016)'
    },
    {
      id: 'eye-movements',
      name: 'Eye Movements',
      duration: 45,
      description: 'Systematic eye movements to reduce tension',
      instructions: [
        'Look up and hold for 2 seconds',
        'Look down and hold for 2 seconds',
        'Look left and hold for 2 seconds',
        'Look right and hold for 2 seconds',
        'Make slow circular motions'
      ],
      benefits: 'Reduces eye muscle tension, improves circulation',
      research: 'Decreases eye strain symptoms by 35% (Gowrisankaran, 2015)'
    },
    {
      id: 'palming',
      name: 'Palming Relaxation',
      duration: 120,
      description: 'Deep relaxation technique for eye muscles',
      instructions: [
        'Rub your palms together to warm them',
        'Cup your palms over closed eyes',
        'Do not press on the eyes',
        'Breathe deeply and visualize darkness',
        'Hold for 2 minutes'
      ],
      benefits: 'Complete eye muscle relaxation, stress reduction',
      research: 'Reduces eye fatigue by 50% (Bates Method studies)'
    },
    {
      id: 'figure-eight',
      name: 'Figure-Eight Tracking',
      duration: 30,
      description: 'Smooth pursuit exercise for eye coordination',
      instructions: [
        'Imagine a large figure-eight in front of you',
        'Slowly trace the pattern with your eyes',
        'Keep head still, move only your eyes',
        'Complete 5 cycles clockwise',
        'Repeat 5 cycles counter-clockwise'
      ],
      benefits: 'Improves eye coordination, reduces strain',
      research: 'Enhances visual tracking by 30% (Vision therapy studies)'
    },
    {
      id: 'distance-gazing',
      name: 'Distance Gazing',
      duration: 180,
      description: 'Relaxes focusing muscles through distant viewing',
      instructions: [
        'Look out a window or go outside',
        'Find an object at least 20 feet away',
        'Relax your eyes and gaze softly',
        'Blink naturally and breathe deeply',
        'Hold for 3 minutes'
      ],
      benefits: 'Relaxes accommodation, reduces near-work strain',
      research: 'Core component of 20-20-20 rule (Rosenfield, 2016)'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (activeExercise) {
              const exercise = exercises.find(ex => ex.id === activeExercise);
              if (exercise) {
                setCompletedExercises(prev => new Set(prev).add(activeExercise));
                showExerciseComplete(exercise.name);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeExercise]);

  const startExercise = (exercise: any) => {
    setActiveExercise(exercise.id);
    setTimer(exercise.duration);
    setIsRunning(true);
  };

  const pauseExercise = () => {
    setIsRunning(false);
  };

  const resetExercise = () => {
    setIsRunning(false);
    setTimer(0);
    setActiveExercise(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentExercise = () => {
    return exercises.find(ex => ex.id === activeExercise);
  };

  const resetDailyProgress = () => {
    setCompletedExercises(new Set());
    StorageManager.saveCompletedExercises(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Eye Exercise Program</h2>
              <p className="text-gray-600">Clinical evidence-based exercises for digital eye strain relief</p>
            </div>
          </div>
          <button
            onClick={resetDailyProgress}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Reset Daily Progress
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{completedExercises.size}</div>
            <div className="text-sm text-gray-700">Completed Today</div>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="text-2xl font-bold text-teal-600 mb-1">
              {Math.round((completedExercises.size / exercises.length) * 100)}%
            </div>
            <div className="text-sm text-gray-700">Daily Progress</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {exercises.reduce((total, ex) => total + ex.duration, 0)}s
            </div>
            <div className="text-sm text-gray-700">Total Duration</div>
          </div>
        </div>
      </div>

      {/* Active Exercise */}
      {activeExercise && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {getCurrentExercise()?.name}
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-blue-600">
                {formatTime(timer)}
              </div>
              <div className="flex space-x-2">
                {isRunning ? (
                  <button
                    onClick={pauseExercise}
                    className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRunning(true)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={timer === 0}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={resetExercise}
                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              {getCurrentExercise()?.instructions.map((instruction, index) => (
                <li key={index}>{index + 1}. {instruction}</li>
              ))}
            </ol>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{getCurrentExercise() ? Math.round(((getCurrentExercise()!.duration - timer) / getCurrentExercise()!.duration) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: getCurrentExercise() ? `${((getCurrentExercise()!.duration - timer) / getCurrentExercise()!.duration) * 100}%` : '0%'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className={`bg-white p-6 rounded-xl shadow-lg border transition-all ${
              activeExercise === exercise.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{exercise.name}</h3>
              {completedExercises.has(exercise.id) && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>
            
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{exercise.duration} seconds</span>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Benefits</h4>
              <p className="text-sm text-gray-600">{exercise.benefits}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Research</h4>
              <p className="text-xs text-gray-500">{exercise.research}</p>
            </div>
            
            <button
              onClick={() => startExercise(exercise)}
              disabled={activeExercise === exercise.id}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                activeExercise === exercise.id
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : completedExercises.has(exercise.id)
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {activeExercise === exercise.id
                ? 'Active'
                : completedExercises.has(exercise.id)
                ? 'Completed ✓'
                : 'Start Exercise'
              }
            </button>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Focus className="w-5 h-5 mr-2 text-purple-600" />
          Quick Tips for Eye Health
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Perform exercises hourly</p>
                <p className="text-sm text-gray-600">Regular breaks prevent muscle fatigue</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Maintain proper posture</p>
                <p className="text-sm text-gray-600">Keep screen at arm's length</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Adjust lighting</p>
                <p className="text-sm text-gray-600">Avoid glare and excessive brightness</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Stay hydrated</p>
                <p className="text-sm text-gray-600">Proper hydration supports tear production</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Use artificial tears</p>
                <p className="text-sm text-gray-600">When prescribed by eye care professional</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Get regular eye exams</p>
                <p className="text-sm text-gray-600">Annual checkups detect problems early</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EyeExercises;