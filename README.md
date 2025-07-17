# Eyecare-pro---Blink-rate-monitor-in-your-browser


🚀 Try It Live
🔗 Launch Demo : https://shiny-zuccutto-9fcdf3.netlify.app/

👁️ EyeCare Pro — Clinical Blink Rate Monitor
EyeCare Pro is a real-time web application that monitors blink rate using your device camera, helping detect signs of eye strain during prolonged screen use. Built with MediaPipe Face Mesh and optimized for clinical-grade accuracy, the tool offers continuous monitoring and feedback for healthier screen habits.

🔍 Key Features
Real-Time Blink Detection
Uses MediaPipe and facial landmarks to detect and track blinks accurately in real-time.

Eye Strain Risk Detection
Calculates blink rate per minute and flags high eye strain based on low blink frequency (clinical threshold: 15–20 blinks/min).

Session Metrics Dashboard

Total Blinks

Session Time

Eye Aspect Ratio (EAR)

Blink Threshold

Real-time Status Indicators

Interactive UI

Live camera feed with facial mesh overlay

Face detection status and visual feedback

Eye strain alerts and suggestions

🧠 How It Works
Uses 468-point facial landmark tracking with MediaPipe Face Mesh.

Computes Eye Aspect Ratio (EAR) to detect blink events.

Compares against configurable blink threshold to identify blinks.

Tracks metrics continuously to estimate eye fatigue risk.

🛠️ Tech Stack
Frontend: React, TypeScript

Vision API: MediaPipe Face Mesh

Hosting: Netlify

🧑‍💻 Usage Tips
Sit 18–24 inches from the webcam

Ensure clear lighting and minimal movement

Face should remain within frame for consistent tracking
