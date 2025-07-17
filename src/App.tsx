import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import { Eye, Activity, AlertTriangle, CheckCircle, Clock, BarChart3, Play, Pause, Settings } from 'lucide-react';
import BlinkDetector from './components/BlinkDetector';
import Dashboard from './components/Dashboard';
import ResearchInfo from './components/ResearchInfo';
import EyeExercises from './components/EyeExercises';
import SettingsPanel from './components/SettingsPanel';
import { BlinkDetector as BlinkDetectorUtil } from './utils/eyeAspectRatio';
import { NotificationSystem, showBreakReminder, showBlinkRateWarning, showEyeStrainAlert } from './components/NotificationSystem';
import { StorageManager, SessionData } from './utils/storage';

// State management with useReducer for complex monitoring state
interface MonitoringState {
  isMonitoring: boolean;
  sessionTime: number;
  totalBlinks: number;
  blinkRate: number;
  eyeStrainLevel: 'low' | 'moderate' | 'high';
  lastBreakTime: number;
  lastWarningTime: number;
}

type MonitoringAction = 
  | { type: 'START_MONITORING' }
  | { type: 'STOP_MONITORING' }
  | { type: 'INCREMENT_TIME' }
  | { type: 'ADD_BLINK' }
  | { type: 'UPDATE_BLINK_RATE'; rate: number }
  | { type: 'UPDATE_EYE_STRAIN'; level: 'low' | 'moderate' | 'high' }
  | { type: 'RECORD_BREAK' }
  | { type: 'RECORD_WARNING' };

const monitoringReducer = (state: MonitoringState, action: MonitoringAction): MonitoringState => {
  switch (action.type) {
    case 'START_MONITORING':
      return { ...state, isMonitoring: true, lastBreakTime: Date.now() };
    case 'STOP_MONITORING':
      return { ...state, isMonitoring: false };
    case 'INCREMENT_TIME':
      return { ...state, sessionTime: state.sessionTime + 1 };
    case 'ADD_BLINK':
      return { ...state, totalBlinks: state.totalBlinks + 1 };
    case 'UPDATE_BLINK_RATE':
      return { ...state, blinkRate: action.rate };
    case 'UPDATE_EYE_STRAIN':
      return { ...state, eyeStrainLevel: action.level };
    case 'RECORD_BREAK':
      return { ...state, lastBreakTime: Date.now() };
    case 'RECORD_WARNING':
      return { ...state, lastWarningTime: Date.now() };
    default:
      return state;
  }
};

const initialState: MonitoringState = {
  isMonitoring: false,
  sessionTime: 0,
  totalBlinks: 0,
  blinkRate: 0,
  eyeStrainLevel: 'low',
  lastBreakTime: Date.now(),
  lastWarningTime: 0
};

function App() {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);
  const blinkDetectorUtilRef = useRef<BlinkDetectorUtil>(new BlinkDetectorUtil());
  const [activeTab, setActiveTab] = useState<'monitor' | 'dashboard' | 'research' | 'exercises'>('monitor');
  const settings = StorageManager.getSettings();

  // Normal blink rate configuration
  const [showSettings, setShowSettings] = useState(false);
  const normalBlinkRate = { min: 15, max: 20 };

  // Session timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isMonitoring) {
      interval = setInterval(() => {
        dispatch({ type: 'INCREMENT_TIME' });
        
        // Check for break reminder (configurable interval)
        if (state.sessionTime > 0 && state.sessionTime % settings.breakInterval === 0) {
          if (settings.notificationsEnabled) {
            showBreakReminder();
          }
          dispatch({ type: 'RECORD_BREAK' });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isMonitoring, state.sessionTime, settings.breakInterval, settings.notificationsEnabled]);

  // Eye strain assessment effect
  useEffect(() => {
    // Only assess eye strain when monitoring is active
    if (!state.isMonitoring) {
      return;
    }

    let newStrainLevel: 'low' | 'moderate' | 'high' = 'low';
    
    if (state.blinkRate < normalBlinkRate.min) {
      newStrainLevel = state.blinkRate < 10 ? 'high' : 'moderate';
    } else if (state.blinkRate > normalBlinkRate.max) {
      newStrainLevel = 'low';
    } else {
      newStrainLevel = 'low';
    }

    // Factor in session time for strain assessment
    if (state.sessionTime > 3600) { // More than 1 hour
      newStrainLevel = newStrainLevel === 'low' ? 'moderate' : 'high';
    }

    dispatch({ type: 'UPDATE_EYE_STRAIN', level: newStrainLevel });

    // Show warnings (with throttling to avoid spam)
    const now = Date.now();
    if (state.isMonitoring && settings.notificationsEnabled && now - state.lastWarningTime > 300000) { // 5 minutes between warnings
      if (state.blinkRate < 12 && state.blinkRate > 0) {
        showBlinkRateWarning(state.blinkRate);
        dispatch({ type: 'RECORD_WARNING' });
      } else if (newStrainLevel === 'high') {
        showEyeStrainAlert();
        dispatch({ type: 'RECORD_WARNING' });
      }
    }
  }, [state.isMonitoring, state.blinkRate, state.sessionTime, state.lastWarningTime, settings.notificationsEnabled]);

  // Save session data when monitoring stops
  useEffect(() => {
    if (!state.isMonitoring && state.sessionTime > 30) { // Only save sessions longer than 30 seconds
      // Calculate accurate average blink rate for the entire session
      const sessionMinutes = state.sessionTime / 60;
      const accurateAverageBlinkRate = sessionMinutes > 0 ? Math.round((state.totalBlinks / sessionMinutes) * 10) / 10 : 0;
      
      const sessionData: SessionData = {
        date: new Date().toISOString(),
        duration: state.sessionTime,
        totalBlinks: state.totalBlinks,
        averageBlinkRate: accurateAverageBlinkRate,
        eyeStrainLevel: state.eyeStrainLevel,
        breaksTaken: Math.floor(state.sessionTime / settings.breakInterval)
      };
      
      StorageManager.addSession(sessionData);
    }
  }, [state.isMonitoring, state.sessionTime, state.totalBlinks, state.blinkRate, state.eyeStrainLevel, settings.breakInterval]);

  const handleStartMonitoring = () => {
    dispatch({ type: 'START_MONITORING' });
    blinkDetectorUtilRef.current.reset();
  };

  const handleBlinkDetected = useCallback(() => {
    dispatch({ type: 'ADD_BLINK' });
  }, []);

  const handleBlinkRateUpdate = useCallback((rate: number) => {
    dispatch({ type: 'UPDATE_BLINK_RATE', rate });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEyeStrainColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEyeStrainIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Notification System */}
      <NotificationSystem />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">EyeCare Pro</h1>
                <p className="text-sm text-gray-600">Clinical Blink Rate Monitor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getEyeStrainIcon(state.eyeStrainLevel)}
                <span className={`text-sm font-medium ${getEyeStrainColor(state.eyeStrainLevel)}`}>
                  {state.eyeStrainLevel.charAt(0).toUpperCase() + state.eyeStrainLevel.slice(1)} Risk
                </span>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={state.isMonitoring ? () => dispatch({ type: 'STOP_MONITORING' }) : handleStartMonitoring}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  state.isMonitoring
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {state.isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{state.isMonitoring ? 'Stop' : 'Start'} Monitoring</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'monitor', label: 'Monitor', icon: Activity },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'research', label: 'Research', icon: Eye },
              { id: 'exercises', label: 'Exercises', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Blink Rate</p>
                    <p className="text-2xl font-bold text-gray-800">{state.blinkRate}/min</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Normal: 15-20/min</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Session Time</p>
                    <p className="text-2xl font-bold text-gray-800">{formatTime(state.sessionTime)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-teal-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Blinks</p>
                    <p className="text-2xl font-bold text-gray-800">{state.totalBlinks}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Eye Strain Risk</p>
                    <p className={`text-2xl font-bold ${getEyeStrainColor(state.eyeStrainLevel)}`}>
                      {state.eyeStrainLevel.charAt(0).toUpperCase() + state.eyeStrainLevel.slice(1)}
                    </p>
                  </div>
                  {getEyeStrainIcon(state.eyeStrainLevel)}
                </div>
              </div>
            </div>

            {/* Blink Detection Component */}
            <BlinkDetector
              isActive={state.isMonitoring}
              onBlinkDetected={handleBlinkDetected}
              onBlinkRateUpdate={handleBlinkRateUpdate}
            />

            {/* Clinical Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinical Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">20-20-20 Rule</p>
                    <p className="text-sm text-gray-600">Every 20 minutes, look at something 20 feet away for 20 seconds</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Conscious Blinking</p>
                    <p className="text-sm text-gray-600">Blink completely and frequently to maintain eye moisture</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Monitor Distance</p>
                    <p className="text-sm text-gray-600">Keep screens 20-26 inches away from your eyes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            blinkRate={state.blinkRate}
            sessionTime={state.sessionTime}
            totalBlinks={state.totalBlinks}
            eyeStrainLevel={state.eyeStrainLevel}
          />
        )}

        {activeTab === 'research' && <ResearchInfo />}

        {activeTab === 'exercises' && <EyeExercises />}
      </main>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

export default App;