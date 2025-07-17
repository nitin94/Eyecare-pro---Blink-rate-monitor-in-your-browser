import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, Clock, AlertTriangle, CheckCircle, Bell, Volume2 } from 'lucide-react';
import { audioManager } from '../utils/audioNotifications';

export const NotificationSystem: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="bg-white shadow-lg border border-gray-200"
    />
  );
};

// Nudge notification for gentle reminders
export const showNudgeReminder = (message: string, type: 'blink' | 'break' | 'posture' = 'blink') => {
  audioManager.playReminderBeep();
  
  const icons = {
    blink: <Eye className="w-5 h-5 text-blue-600" />,
    break: <Clock className="w-5 h-5 text-teal-600" />,
    posture: <Bell className="w-5 h-5 text-purple-600" />
  };

  toast.info(
    <div className="flex items-center space-x-3">
      {icons[type]}
      <div>
        <div className="font-medium">Gentle Reminder</div>
        <div className="text-sm text-gray-600">{message}</div>
      </div>
      <Volume2 className="w-4 h-4 text-gray-400" />
    </div>,
    {
      autoClose: 6000,
      icon: false,
      className: 'bg-blue-50 border-l-4 border-blue-400'
    }
  );
};

export const showBreakReminder = () => {
  audioManager.playMessageBeep();
  
  toast.info(
    <div className="flex items-center space-x-3">
      <Clock className="w-5 h-5 text-blue-600" />
      <div>
        <div className="font-medium">Time for a break!</div>
        <div className="text-sm text-gray-600">Look at something 20 feet away for 20 seconds</div>
      </div>
      <Volume2 className="w-4 h-4 text-gray-400" />
    </div>,
    {
      autoClose: 8000,
      icon: false,
      className: 'bg-blue-50 border-l-4 border-blue-400'
    }
  );
};

export const showBlinkRateWarning = (rate: number) => {
  audioManager.playWarningBeep();
  
  toast.warn(
    <div className="flex items-center space-x-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600" />
      <div>
        <div className="font-medium">Low blink rate detected</div>
        <div className="text-sm text-gray-600">Current: {rate}/min (Normal: 15-20/min)</div>
      </div>
      <Volume2 className="w-4 h-4 text-gray-400" />
    </div>,
    {
      autoClose: 6000,
      icon: false,
      className: 'bg-yellow-50 border-l-4 border-yellow-400'
    }
  );
};

export const showEyeStrainAlert = () => {
  audioManager.playWarningBeep();
  
  toast.error(
    <div className="flex items-center space-x-3">
      <Eye className="w-5 h-5 text-red-600" />
      <div>
        <div className="font-medium">High eye strain risk</div>
        <div className="text-sm text-gray-600">Consider taking a longer break</div>
      </div>
      <Volume2 className="w-4 h-4 text-gray-400" />
    </div>,
    {
      autoClose: 10000,
      icon: false,
      className: 'bg-red-50 border-l-4 border-red-400'
    }
  );
};

export const showExerciseComplete = (exerciseName: string) => {
  audioManager.playSuccessBeep();
  
  toast.success(
    <div className="flex items-center space-x-3">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <div>
        <div className="font-medium">Exercise completed!</div>
        <div className="text-sm text-gray-600">{exerciseName}</div>
      </div>
      <Volume2 className="w-4 h-4 text-gray-400" />
    </div>,
    {
      autoClose: 4000,
      icon: false,
      className: 'bg-green-50 border-l-4 border-green-400'
    }
  );
};

// Persistent nudge for critical situations
export const showPersistentNudge = (message: string, action: string) => {
  audioManager.playMessageBeep();
  
  toast.warn(
    <div className="flex items-center justify-between space-x-3">
      <div className="flex items-center space-x-3">
        <Bell className="w-5 h-5 text-orange-600" />
        <div>
          <div className="font-medium">Action Required</div>
          <div className="text-sm text-gray-600">{message}</div>
        </div>
      </div>
      <button 
        className="px-3 py-1 bg-orange-600 text-white text-xs rounded-full hover:bg-orange-700 transition-colors"
        onClick={() => toast.dismiss()}
      >
        {action}
      </button>
    </div>,
    {
      autoClose: false, // Persistent until dismissed
      closeOnClick: false,
      icon: false,
      className: 'bg-orange-50 border-l-4 border-orange-400'
    }
  );
};