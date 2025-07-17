import React, { useState, useEffect } from 'react';
import { Settings, Volume2, VolumeX, Bell, BellOff, Save } from 'lucide-react';
import { StorageManager, UserSettings } from '../utils/storage';
import { audioManager } from '../utils/audioNotifications';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(StorageManager.getSettings());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(StorageManager.getSettings());
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    StorageManager.saveSettings(settings);
    audioManager.setEnabled(settings.soundEnabled);
    setHasChanges(false);
    
    // Play confirmation sound
    if (settings.soundEnabled) {
      audioManager.playSuccessBeep();
    }
  };

  const testSound = () => {
    audioManager.playMessageBeep();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {settings.notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-blue-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-800">Visual Notifications</p>
                  <p className="text-sm text-gray-600">Show toast notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-green-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-800">Sound Alerts</p>
                  <p className="text-sm text-gray-600">Play audio notifications</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={testSound}
                  disabled={!settings.soundEnabled}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                >
                  Test
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Nudges */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Smart Nudges</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-800">Enable Nudges</p>
                  <p className="text-sm text-gray-600">Gentle reminders for eye health</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.nudgesEnabled}
                  onChange={(e) => handleSettingChange('nudgesEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {settings.nudgesEnabled && (
              <div className="ml-8 space-y-2">
                <p className="text-sm font-medium text-gray-700">Nudge Frequency</p>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low (Every 5 minutes)', desc: 'Minimal interruptions' },
                    { value: 'medium', label: 'Medium (Every 3 minutes)', desc: 'Balanced reminders' },
                    { value: 'high', label: 'High (Every 2 minutes)', desc: 'Frequent check-ins' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="nudgeFrequency"
                        value={option.value}
                        checked={settings.nudgeFrequency === option.value}
                        onChange={(e) => handleSettingChange('nudgeFrequency', e.target.value)}
                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{option.label}</p>
                        <p className="text-xs text-gray-600">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detection Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Detection Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blink Threshold: {settings.blinkThreshold.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.15"
                max="0.35"
                step="0.01"
                value={settings.blinkThreshold}
                onChange={(e) => handleSettingChange('blinkThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sensitive</span>
                <span>Balanced</span>
                <span>Conservative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Interval: {Math.floor(settings.breakInterval / 60)} minutes
              </label>
              <input
                type="range"
                min="600"
                max="3600"
                step="300"
                value={settings.breakInterval}
                onChange={(e) => handleSettingChange('breakInterval', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10 min</span>
                <span>30 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {hasChanges ? 'You have unsaved changes' : 'Settings saved'}
            </p>
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                hasChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;