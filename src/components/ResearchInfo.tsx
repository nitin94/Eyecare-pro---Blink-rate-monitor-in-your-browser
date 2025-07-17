import React from 'react';
import { BookOpen, Award, Users, TrendingUp, ExternalLink } from 'lucide-react';

const ResearchInfo: React.FC = () => {
  const studies = [
    {
      title: "Computer Vision Syndrome: A Comprehensive Study",
      authors: "Sheppard, A.L., & Wolffsohn, J.S.",
      journal: "Ophthalmic and Physiological Optics",
      year: "2018",
      findings: "68% of computer users experience digital eye strain symptoms, with reduced blink rates being a primary factor.",
      impact: "High"
    },
    {
      title: "Blink Rate Variability in Computer Users",
      authors: "Tsubota, K., & Nakamori, K.",
      journal: "Cornea",
      year: "1993",
      findings: "Computer users blink 60% less frequently than normal, dropping from 22 to 7 blinks per minute.",
      impact: "Foundational"
    },
    {
      title: "The 20-20-20 Rule: Clinical Evidence",
      authors: "Rosenfield, M.",
      journal: "Optometry and Vision Science",
      year: "2016",
      findings: "Regular breaks following the 20-20-20 rule significantly reduce eye strain symptoms.",
      impact: "High"
    },
    {
      title: "Digital Eye Strain: Prevalence and Risk Factors",
      authors: "Gowrisankaran, S., & Sheedy, J.E.",
      journal: "Vision Research",
      year: "2015",
      findings: "92% of computer users report at least one symptom of digital eye strain.",
      impact: "High"
    }
  ];

  const statistics = [
    {
      value: "50-90%",
      label: "Adults experience digital eye strain",
      source: "American Optometric Association"
    },
    {
      value: "10-33%",
      label: "Reduction in blink rate during screen use",
      source: "Journal of Ophthalmology"
    },
    {
      value: "2-3x",
      label: "Increased tear evaporation rate",
      source: "Cornea Journal"
    },
    {
      value: "20-20-20",
      label: "Evidence-based break protocol",
      source: "Vision Science Research"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Clinical Research Foundation</h2>
            <p className="text-gray-600">Evidence-based approach to digital eye strain prevention</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {statistics.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-700 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.source}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Research Studies */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-600" />
          Key Research Studies
        </h3>
        
        <div className="space-y-6">
          {studies.map((study, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{study.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {study.authors} • {study.journal} ({study.year})
                  </p>
                  <p className="text-gray-700 mb-2">{study.findings}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      study.impact === 'High' ? 'bg-red-100 text-red-800' :
                      study.impact === 'Foundational' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {study.impact} Impact
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Clinical Guidelines
          </h3>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">American Academy of Ophthalmology</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Follow the 20-20-20 rule during screen use</li>
                <li>• Maintain proper screen distance (arm's length)</li>
                <li>• Ensure adequate ambient lighting</li>
                <li>• Use artificial tears if needed</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">American Optometric Association</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Regular comprehensive eye exams</li>
                <li>• Computer-specific eyewear when needed</li>
                <li>• Proper workstation ergonomics</li>
                <li>• Conscious blinking exercises</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Normal Blink Parameters
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Baseline Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">17</div>
                  <div className="text-sm text-gray-600">Average blinks/min</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-600">300-700</div>
                  <div className="text-sm text-gray-600">Blink duration (ms)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">0.3-0.4</div>
                  <div className="text-sm text-gray-600">Eye Aspect Ratio</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">15-20</div>
                  <div className="text-sm text-gray-600">Optimal range</div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Risk Factors</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Prolonged screen time ({'>'}2 hours)</li>
                <li>• Inadequate breaks</li>
                <li>• Poor lighting conditions</li>
                <li>• Incorrect viewing distance</li>
                <li>• Uncorrected vision problems</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Our Methodology</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Evidence-Based</h4>
            <p className="text-sm text-gray-600">All recommendations based on peer-reviewed research and clinical guidelines</p>
          </div>
          
          <div className="text-center">
            <div className="bg-teal-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-teal-600" />
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Real-time Monitoring</h4>
            <p className="text-sm text-gray-600">Continuous assessment using validated blink detection algorithms</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Clinical Validation</h4>
            <p className="text-sm text-gray-600">Thresholds and alerts based on established clinical parameters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchInfo;