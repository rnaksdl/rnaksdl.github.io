// js/poseDetection.js

class PoseDetector {
    constructor() {
        this.pose = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.landmarks = null;
        this.onPoseCallback = null;
        this.baselineY = null;
    }

    async init() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        this.video.srcObject = stream;

        await new Promise(resolve => {
            this.video.onloadedmetadata = resolve;
        });

        this.canvas.width = 700;
        this.canvas.height = 500;

        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.pose.onResults((results) => this.onResults(results));

        this.detect();
    }

    async detect() {
        if (this.video.readyState >= 2) {
            await this.pose.send({ image: this.video });
        }
        requestAnimationFrame(() => this.detect());
    }

    onResults(results) {
        this.landmarks = results.poseLandmarks || null;
        this.draw();

        if (this.onPoseCallback) {
            this.onPoseCallback(this.landmarks);
        }
    }

    setBaseline(shoulderY, hipY, ankleY) {
        if (shoulderY === null) {
            this.baselineY = null;
        } else {
            this.baselineY = { shoulder: shoulderY, hip: hipY, ankle: ankleY };
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = '#151520';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        for (let i = 0; i < h; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
            ctx.stroke();
        }

        // Baseline
        if (this.baselineY) {
            ctx.setLineDash([10, 10]);
            ctx.lineWidth = 1;
            
            ctx.strokeStyle = '#2a4a4a';
            const shoulderLineY = this.baselineY.shoulder * h;
            ctx.beginPath();
            ctx.moveTo(0, shoulderLineY);
            ctx.lineTo(w, shoulderLineY);
            ctx.stroke();
            
            ctx.strokeStyle = '#2a3a4a';
            const hipLineY = this.baselineY.hip * h;
            ctx.beginPath();
            ctx.moveTo(0, hipLineY);
            ctx.lineTo(w, hipLineY);
            ctx.stroke();
            
            ctx.strokeStyle = '#2a2a3a';
            const ankleLineY = this.baselineY.ankle * h;
            ctx.beginPath();
            ctx.moveTo(0, ankleLineY);
            ctx.lineTo(w, ankleLineY);
            ctx.stroke();
            
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#3a5a5a';
            ctx.font = '11px sans-serif';
            ctx.fillText('SHOULDER', 8, shoulderLineY - 5);
            ctx.fillStyle = '#3a4a5a';
            ctx.fillText('HIP', 8, hipLineY - 5);
            ctx.fillStyle = '#3a3a4a';
            ctx.fillText('ANKLE', 8, ankleLineY - 5);
        }

        if (!this.landmarks) {
            ctx.fillStyle = '#333';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No pose detected', w / 2, h / 2);
            ctx.textAlign = 'left';
            return;
        }

        const mx = (x) => (1 - x) * w;
        const my = (y) => y * h;

        const connections = [
            [11, 12], [11, 23], [12, 24], [23, 24],
            [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
            [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
            [23, 25], [25, 27], [27, 29], [27, 31],
            [24, 26], [26, 28], [28, 30], [28, 32]
        ];

        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;

        connections.forEach(([a, b]) => {
            const pa = this.landmarks[a];
            const pb = this.landmarks[b];

            if (pa?.visibility > 0.5 && pb?.visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(mx(pa.x), my(pa.y));
                ctx.lineTo(mx(pb.x), my(pb.y));
                ctx.stroke();
            }
        });

        ctx.shadowBlur = 10;

        for (let i = 0; i < this.landmarks.length; i++) {
            const p = this.landmarks[i];
            if (p.visibility > 0.5) {
                ctx.fillStyle = '#ff00ff';
                ctx.shadowColor = '#ff00ff';
                ctx.beginPath();
                ctx.arc(mx(p.x), my(p.y), 7, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(mx(p.x), my(p.y), 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 10;
            }
        }

        const nose = this.landmarks[0];
        if (nose?.visibility > 0.5) {
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(mx(nose.x), my(nose.y), 35, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }

    onPose(callback) {
        this.onPoseCallback = callback;
    }

    getLandmarks() {
        return this.landmarks;
    }
}

window.PoseDetector = PoseDetector;
