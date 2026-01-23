// js/main.js

let detector;
let recognition;
let isCalibrating = false;
let isReady = false;

// Flash display for combat moves
let flashPose = null;
let flashTimeout = null;
const FLASH_DURATION = 1000; // 1 second
const COMBAT_MOVES = ['left-hook', 'right-hook', 'left-uppercut', 'right-uppercut'];

async function init() {
    const loading = document.getElementById('loading');
    const app = document.getElementById('app');
    const skeletonContainer = document.getElementById('skeleton-container');
    const currentPoseEl = document.getElementById('current-pose');
    const calibrateBtn = document.getElementById('calibrate-btn');
    const poseItems = document.querySelectorAll('.pose-item');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const poseDisplay = document.getElementById('pose-display');
    const poseList = document.getElementById('pose-list');
    
    const getReadyOverlay = document.getElementById('get-ready-overlay');
    const getReadyBtn = document.getElementById('get-ready-btn');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');

    try {
        detector = new PoseDetector();
        await detector.init();
        recognition = new PoseRecognition();

        loading.classList.add('hidden');
        app.classList.remove('hidden');

        let lastDisplayedPose = 'none';

        getReadyBtn.addEventListener('click', () => {
            startCountdown();
        });

        function startCountdown() {
            getReadyOverlay.classList.add('hidden');
            countdownOverlay.classList.remove('hidden');
            
            statusDot.classList.add('waiting');
            statusText.textContent = 'Get into position...';
            
            let count = 5;
            countdownNumber.textContent = count;
            
            const interval = setInterval(() => {
                count--;
                
                if (count > 0) {
                    countdownNumber.textContent = count;
                } else {
                    clearInterval(interval);
                    countdownNumber.textContent = '✓';
                    
                    setTimeout(() => {
                        countdownOverlay.classList.add('hidden');
                        startCalibration();
                    }, 500);
                }
            }, 1000);
        }

        function startCalibration() {
            isCalibrating = true;
            isReady = false;
            recognition.resetCalibration();
            
            statusDot.classList.remove('waiting');
            statusDot.classList.remove('ready');
            statusText.textContent = 'Calibrating...';
        }

        function showPose(pose) {
            const isCombatMove = COMBAT_MOVES.includes(pose);
            
            // If it's a combat move, flash it for 1 second
            if (isCombatMove) {
                // Clear any existing flash timeout
                if (flashTimeout) {
                    clearTimeout(flashTimeout);
                }
                
                // Set the flash pose
                flashPose = pose;
                currentPoseEl.textContent = formatPoseName(pose);
                currentPoseEl.classList.add('detected', 'combat');
                
                // Highlight in pose list
                poseItems.forEach(item => {
                    if (item.dataset.pose === pose) {
                        item.classList.add('active');
                    }
                });
                
                // Clear after 1 second
                flashTimeout = setTimeout(() => {
                    flashPose = null;
                    currentPoseEl.classList.remove('combat');
                    
                    // Remove highlight
                    poseItems.forEach(item => {
                        if (COMBAT_MOVES.includes(item.dataset.pose)) {
                            item.classList.remove('active');
                        }
                    });
                    
                    // Show current actual pose
                    const currentActualPose = recognition.lastPose;
                    if (currentActualPose !== 'none' && !COMBAT_MOVES.includes(currentActualPose)) {
                        currentPoseEl.textContent = formatPoseName(currentActualPose);
                    } else if (!flashPose) {
                        currentPoseEl.textContent = '—';
                    }
                }, FLASH_DURATION);
                
            } else {
                // Not a combat move - only update if no flash is active
                if (!flashPose) {
                    if (pose !== 'none') {
                        currentPoseEl.textContent = formatPoseName(pose);
                        currentPoseEl.classList.add('detected');
                        currentPoseEl.classList.remove('combat');
                        setTimeout(() => currentPoseEl.classList.remove('detected'), 300);
                    } else {
                        currentPoseEl.textContent = '—';
                    }
                }
            }
        }

        detector.onPose((landmarks) => {
            if (isCalibrating) {
                recognition.calibrate(landmarks);

                const progress = Math.min(recognition.calibrationFrames, 30);
                statusText.textContent = `Calibrating... ${progress}/30`;

                if (recognition.isCalibrated() && !isReady) {
                    isReady = true;
                    isCalibrating = false;
                    onCalibrationComplete();
                }
            }

            if (recognition.isCalibrated()) {
                const baseline = recognition.getBaseline();
                detector.setBaseline(baseline.shoulderY, baseline.hipY, baseline.ankleY);
            }

            if (landmarks) {
                skeletonContainer.classList.add('detected');
            } else {
                skeletonContainer.classList.remove('detected');
            }

            if (isReady) {
                const pose = recognition.recognize(landmarks);

                if (pose !== lastDisplayedPose) {
                    showPose(pose);
                    lastDisplayedPose = pose;
                }

                // Update pose list highlights (except during combat flash)
                poseItems.forEach(item => {
                    const itemPose = item.dataset.pose;
                    
                    // Don't update combat moves if flash is active
                    if (flashPose && COMBAT_MOVES.includes(itemPose)) {
                        return;
                    }
                    
                    if (item.dataset.pose === pose) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });

        function onCalibrationComplete() {
            statusDot.classList.add('ready');
            statusText.textContent = 'Ready';
            
            poseDisplay.classList.remove('hidden');
            poseList.classList.remove('hidden');
            calibrateBtn.classList.remove('hidden');
        }

        calibrateBtn.addEventListener('click', () => {
            // Clear any flash
            if (flashTimeout) {
                clearTimeout(flashTimeout);
                flashTimeout = null;
            }
            flashPose = null;
            
            poseDisplay.classList.add('hidden');
            poseList.classList.add('hidden');
            calibrateBtn.classList.add('hidden');
            
            recognition.resetCalibration();
            detector.setBaseline(null);
            isReady = false;
            isCalibrating = false;
            lastDisplayedPose = 'none';
            
            getReadyOverlay.classList.remove('hidden');
            statusDot.classList.remove('ready');
            statusText.textContent = 'Press "Get Ready" to start';
        });

    } catch (err) {
        console.error('Init error:', err);
        loading.querySelector('p').textContent = err.name === 'NotAllowedError'
            ? 'Camera access denied. Please allow and refresh.'
            : `Error: ${err.message}`;
        loading.querySelector('p').style.color = '#ff3366';
        loading.querySelector('.spinner').style.display = 'none';
    }
}

function formatPoseName(pose) {
    return pose.toUpperCase().replace(/-/g, ' ');
}

document.addEventListener('DOMContentLoaded', init);
