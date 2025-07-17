import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, Eye } from 'lucide-react';
import { StorageManager, SessionData } from '../utils/storage';

interface DashboardProps {
  blinkRate: number;
  sessionTime: number;
  totalBlinks: number;
  eyeStrainLevel: 'low' | 'moderate' | 'high';
}

const Dashboard: React.FC<DashboardProps> = ({
  blinkRate,
  sessionTime,
  totalBlinks,
  eyeStrainLevel
}) => {
  const sessions = StorageManager.getSessions();
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const getEyeStrainColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEyeStrainBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50 border-green-200';
      case 'moderate': return 'bg-yellow-50 border-yellow-200';
      case 'high': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (value: number, optimal: { min: number; max: number }) => {
    if (value >= optimal.min && value <= optimal.max) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  // Generate chart data from historical sessions
  const generateChartData = () => {
    if (sessions.length === 0) {
      // Fallback to current session data
      return [{
        time: 'Current',
        blinkRate: blinkRate,
        strain: eyeStrainLevel === 'low' ? 0.3 : eyeStrainLevel === 'moderate' ? 0.6 : 0.9
      }];
    }

    return sessions.slice(-12).map((session, index) => ({
      time: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      blinkRate: session.averageBlinkRate,
      strain: session.eyeStrainLevel === 'low' ? 0.3 : session.eyeStrainLevel === 'moderate' ? 0.6 : 0.9
    }));
  };

  const chartData = generateChartData();

  // Calculate statistics from historical data
  const calculateStats = () => {
    if (sessions.length === 0) {
      return {
        averageBlinkRate: blinkRate,
        totalSessions: 1,
        totalTime: sessionTime,
        improvementTrend: 0
      };
    }

    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageBlinkRate = sessions.reduce((sum, session) => sum + session.averageBlinkRate, 0) / sessions.length;
    
    // Calculate improvement trend (last 7 vs previous 7 sessions)
    const recentSessions = sessions.slice(-7);
    const previousSessions = sessions.slice(-14, -7);
    
    let improvementTrend = 0;
    if (previousSessions.length > 0 && recentSessions.length > 0) {
      const recentAvg = recentSessions.reduce((sum, s) => sum + s.averageBlinkRate, 0) / recentSessions.length;
      const previousAvg = previousSessions.reduce((sum, s) => sum + s.averageBlinkRate, 0) / previousSessions.length;
      improvementTrend = ((recentAvg - previousAvg) / previousAvg) * 100;
    }

    return {
      averageBlinkRate: Math.round(averageBlinkRate * 10) / 10,
      totalSessions: sessions.length,
      totalTime,
      improvementTrend: Math.round(improvementTrend)
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Blink Rate</p>
              <p className="text-3xl font-bold text-gray-800">{blinkRate}</p>
              <p className="text-xs text-gray-500">per minute</p>
            </div>
            <div className="flex flex-col items-end">
              <Eye className="w-8 h-8 text-blue-600 mb-2" />
              {getTrendIcon(blinkRate, { min: 15, max: 20 })}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Session Duration</p>
              <p className="text-3xl font-bold text-gray-800">{formatTime(sessionTime)}</p>
              <p className="text-xs text-gray-500">active monitoring</p>
            </div>
            <Clock className="w-8 h-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Blinks</p>
              <p className="text-3xl font-bold text-gray-800">{totalBlinks}</p>
              <p className="text-xs text-gray-500">this session</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg border ${getEyeStrainBg(eyeStrainLevel)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eye Strain Risk</p>
              <p className={`text-3xl font-bold ${getEyeStrainColor(eyeStrainLevel)}`}>
                {eyeStrainLevel.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500">current level</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-current opacity-20" />
          </div>
        </div>
      </div>

      {/* Historical Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.averageBlinkRate}</div>
            <div className="text-sm text-gray-600">Average Blink Rate</div>
            <div className="text-xs text-gray-500">across all sessions</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 mb-1">{stats.totalSessions}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
            <div className="text-xs text-gray-500">monitoring history</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{formatTime(stats.totalTime)}</div>
            <div className="text-sm text-gray-600">Total Time</div>
            <div className="text-xs text-gray-500">monitored</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${stats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.improvementTrend > 0 ? '+' : ''}{stats.improvementTrend}%
            </div>
            <div className="text-sm text-gray-600">Improvement</div>
            <div className="text-xs text-gray-500">last 7 sessions</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blink Rate Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Blink Rate History</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-600 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${(point.blinkRate / 25) * 100}%`,
                    minHeight: '4px'
                  }}
                />
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                  {point.time}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Optimal: 15-20 blinks/min</span>
            <span>Current: {blinkRate} blinks/min</span>
          </div>
        </div>

        {/* Eye Strain Indicators */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eye Strain Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blink Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      blinkRate < 15 ? 'bg-red-500' : 
                      blinkRate < 20 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((blinkRate / 25) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{blinkRate}/min</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Screen Time</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      sessionTime < 1200 ? 'bg-green-500' : 
                      sessionTime < 2400 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((sessionTime / 3600) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{formatTime(sessionTime)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Session Quality</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getEyeStrainColor(eyeStrainLevel).replace('text-', 'bg-')}`}
                    style={{ 
                      width: `${eyeStrainLevel === 'low' ? 85 : eyeStrainLevel === 'moderate' ? 60 : 30}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium capitalize">{eyeStrainLevel}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Personalized Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {blinkRate < 15 && <li>• Increase conscious blinking frequency</li>}
              {sessionTime > 1200 && <li>• Take a 20-20-20 break soon</li>}
              {eyeStrainLevel === 'high' && <li>• Consider longer break or eye exercises</li>}
              <li>• Maintain proper screen distance and lighting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Clinical Assessment */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinical Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round((blinkRate / 17.5) * 100)}%</div>
            <div className="text-sm text-gray-600">Blink Efficiency</div>
            <div className="text-xs text-gray-500 mt-1">vs. Normal Rate (17.5/min)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">
              {sessionTime > 1200 ? Math.floor(sessionTime / 1200) : 0}
            </div>
            <div className="text-sm text-gray-600">Break Cycles</div>
            <div className="text-xs text-gray-500 mt-1">20-min intervals completed</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getEyeStrainColor(eyeStrainLevel)}`}>
              {eyeStrainLevel === 'low' ? 'A' : eyeStrainLevel === 'moderate' ? 'B' : 'C'}
            </div>
            <div className="text-sm text-gray-600">Eye Health Grade</div>
            <div className="text-xs text-gray-500 mt-1">Current Session</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;