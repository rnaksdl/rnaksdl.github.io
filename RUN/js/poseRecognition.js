// js/poseRecognition.js

class PoseRecognition {
    constructor() {
        this.baseline = null;
        this.calibrationFrames = 0;
        this.lastPose = 'none';
        this.poseHoldFrames = 0;
        this.requiredHoldFrames = 3;
    }

    calibrate(landmarks) {
        if (!landmarks) return;

        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];

        if (leftShoulder?.visibility < 0.5 || rightShoulder?.visibility < 0.5) return;

        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
        const kneeY = (leftKnee.y + rightKnee.y) / 2;
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        
        const leftWristDist = this.distance(leftWrist, leftShoulder);
        const rightWristDist = this.distance(rightWrist, rightShoulder);
        const avgWristDist = (leftWristDist + rightWristDist) / 2;

        if (!this.baseline) {
            this.baseline = {
                shoulderY,
                hipY,
                ankleY,
                kneeY,
                shoulderWidth,
                wristDist: avgWristDist,
                torsoHeight: hipY - shoulderY,
                legHeight: ankleY - hipY
            };
        } else {
            const a = 0.9;
            this.baseline.shoulderY = this.baseline.shoulderY * a + shoulderY * (1 - a);
            this.baseline.hipY = this.baseline.hipY * a + hipY * (1 - a);
            this.baseline.ankleY = this.baseline.ankleY * a + ankleY * (1 - a);
            this.baseline.kneeY = this.baseline.kneeY * a + kneeY * (1 - a);
            this.baseline.shoulderWidth = this.baseline.shoulderWidth * a + shoulderWidth * (1 - a);
            this.baseline.wristDist = this.baseline.wristDist * a + avgWristDist * (1 - a);
            this.baseline.torsoHeight = this.baseline.torsoHeight * a + (hipY - shoulderY) * (1 - a);
            this.baseline.legHeight = this.baseline.legHeight * a + (ankleY - hipY) * (1 - a);
        }

        this.calibrationFrames++;
    }

    isCalibrated() {
        return this.calibrationFrames >= 30;
    }

    resetCalibration() {
        this.baseline = null;
        this.calibrationFrames = 0;
        this.lastPose = 'none';
        this.poseHoldFrames = 0;
    }

    getBaseline() {
        return this.baseline;
    }

    recognize(landmarks) {
        if (!landmarks || !this.isCalibrated()) return 'none';

        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];

        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;

        let detectedPose = 'none';

        // ============================================
        // JUMP - Shoulders rise significantly
        // ============================================
        const shoulderRise = this.baseline.shoulderY - shoulderY;
        if (shoulderRise > 0.07) {
            detectedPose = 'jump';
        }

        // ============================================
        // DUCK - Crouch/squat down
        // ============================================
        const hipDrop = hipY - this.baseline.hipY;
        const shoulderDrop = shoulderY - this.baseline.shoulderY;
        const currentTorsoHeight = hipY - shoulderY;
        const torsoCompression = this.baseline.torsoHeight - currentTorsoHeight;
        
        if (hipDrop > 0.08 && shoulderDrop > 0.03 && torsoCompression > 0.02 && detectedPose === 'none') {
            detectedPose = 'duck';
        }

        // ============================================
        // ARMS X - Wrists crossed in front of chest
        // ============================================
        const wristGapX = Math.abs(leftWrist.x - rightWrist.x);
        const wristAvgY = (leftWrist.y + rightWrist.y) / 2;
        const wristsInFrontOfChest = wristAvgY > shoulderY && wristAvgY < hipY;
        const leftCrossedOver = leftWrist.x < shoulderCenterX;
        const rightCrossedOver = rightWrist.x > shoulderCenterX;
        const wristsCrossed = wristGapX < 0.08 && leftCrossedOver && rightCrossedOver;
        
        if (wristsCrossed && wristsInFrontOfChest && detectedPose === 'none') {
            detectedPose = 'arms-x';
        }

        // ============================================
        // ARMS O - Hands very tight together above head
        // ============================================
        const bothWristsAboveHead = leftWrist.y < nose.y - 0.05 && rightWrist.y < nose.y - 0.05;
        const handsTight = wristGapX < 0.1;
        const handsAboveCenter = Math.abs((leftWrist.x + rightWrist.x) / 2 - shoulderCenterX) < 0.15;
        
        if (bothWristsAboveHead && handsTight && handsAboveCenter && detectedPose === 'none') {
            detectedPose = 'arms-o';
        }

        // ============================================
        // ARMS UP - Both arms straight up (|| shape)
        // ============================================
        const leftArmStraightUp = leftWrist.y < leftShoulder.y - 0.2 && 
                                   Math.abs(leftWrist.x - leftShoulder.x) < 0.08;
        const rightArmStraightUp = rightWrist.y < rightShoulder.y - 0.2 && 
                                    Math.abs(rightWrist.x - rightShoulder.x) < 0.08;
        const armsNotTouching = wristGapX > 0.12;
        
        if (leftArmStraightUp && rightArmStraightUp && armsNotTouching && detectedPose === 'none') {
            detectedPose = 'arms-up';
        }

        // ============================================
        // ARMS SPREAD - T-pose
        // ============================================
        const leftArmHorizontal = Math.abs(leftWrist.y - leftShoulder.y) < 0.1 &&
                                   leftWrist.x > leftShoulder.x + 0.15;
        const rightArmHorizontal = Math.abs(rightWrist.y - rightShoulder.y) < 0.1 &&
                                    rightWrist.x < rightShoulder.x - 0.15;
        const armSpan = Math.abs(leftWrist.x - rightWrist.x);
        
        if (leftArmHorizontal && rightArmHorizontal && armSpan > this.baseline.shoulderWidth * 2.5 && detectedPose === 'none') {
            detectedPose = 'arms-spread';
        }

        // ============================================
        // LEFT HOOK - Left arm swings horizontally across body
        // ============================================
        const leftWristAtShoulderHeight = Math.abs(leftWrist.y - leftShoulder.y) < 0.15;
        const leftWristCrossedCenter = leftWrist.x < shoulderCenterX - 0.05;
        const leftElbowBent = this.distance(leftWrist, leftElbow) < this.distance(leftElbow, leftShoulder) * 1.2;
        const rightArmRelaxedForHook = this.distance(rightWrist, rightShoulder) < this.baseline.wristDist * 1.5;
        
        if (leftWristAtShoulderHeight && leftWristCrossedCenter && leftElbowBent && rightArmRelaxedForHook && detectedPose === 'none') {
            detectedPose = 'left-hook';
        }

        // ============================================
        // RIGHT HOOK - Right arm swings horizontally across body
        // ============================================
        const rightWristAtShoulderHeight = Math.abs(rightWrist.y - rightShoulder.y) < 0.15;
        const rightWristCrossedCenter = rightWrist.x > shoulderCenterX + 0.05;
        const rightElbowBent = this.distance(rightWrist, rightElbow) < this.distance(rightElbow, rightShoulder) * 1.2;
        const leftArmRelaxedForHook = this.distance(leftWrist, leftShoulder) < this.baseline.wristDist * 1.5;
        
        if (rightWristAtShoulderHeight && rightWristCrossedCenter && rightElbowBent && leftArmRelaxedForHook && detectedPose === 'none') {
            detectedPose = 'right-hook';
        }

        // ============================================
        // LEFT UPPERCUT - Left arm swinging from bottom to top
        // Wrist reaches around head level, elbow below wrist (upward motion)
        // ============================================
        const leftWristAtHeadLevel = leftWrist.y < nose.y + 0.05 && leftWrist.y > nose.y - 0.15;
        const leftElbowBelowWrist = leftElbow.y > leftWrist.y + 0.05;
        const leftWristNearBody = Math.abs(leftWrist.x - shoulderCenterX) < 0.2;
        const rightArmDownForUppercut = rightWrist.y > rightShoulder.y - 0.05;
        
        if (leftWristAtHeadLevel && leftElbowBelowWrist && leftWristNearBody && rightArmDownForUppercut && detectedPose === 'none') {
            detectedPose = 'left-uppercut';
        }

        // ============================================
        // RIGHT UPPERCUT - Right arm swinging from bottom to top
        // Wrist reaches around head level, elbow below wrist (upward motion)
        // ============================================
        const rightWristAtHeadLevel = rightWrist.y < nose.y + 0.05 && rightWrist.y > nose.y - 0.15;
        const rightElbowBelowWrist = rightElbow.y > rightWrist.y + 0.05;
        const rightWristNearBody = Math.abs(rightWrist.x - shoulderCenterX) < 0.2;
        const leftArmDownForUppercut = leftWrist.y > leftShoulder.y - 0.05;
        
        if (rightWristAtHeadLevel && rightElbowBelowWrist && rightWristNearBody && leftArmDownForUppercut && detectedPose === 'none') {
            detectedPose = 'right-uppercut';
        }

        // ============================================
        // LEFT KICK - Left knee reaches baseline hip level
        // ============================================
        const leftKneeAtHipLevel = leftKnee.y <= this.baseline.hipY + 0.05;
        const rightLegGrounded = rightAnkle.y > this.baseline.ankleY - 0.1;
        
        if (leftKneeAtHipLevel && rightLegGrounded && detectedPose === 'none') {
            detectedPose = 'kick-left';
        }

        // ============================================
        // RIGHT KICK - Right knee reaches baseline hip level
        // ============================================
        const rightKneeAtHipLevel = rightKnee.y <= this.baseline.hipY + 0.05;
        const leftLegGrounded = leftAnkle.y > this.baseline.ankleY - 0.1;
        
        if (rightKneeAtHipLevel && leftLegGrounded && detectedPose === 'none') {
            detectedPose = 'kick-right';
        }

        // Hold frames check to avoid flickering
        if (detectedPose === this.lastPose) {
            this.poseHoldFrames++;
        } else {
            this.poseHoldFrames = 0;
        }
        this.lastPose = detectedPose;

        if (this.poseHoldFrames >= this.requiredHoldFrames) {
            return detectedPose;
        }

        return 'none';
    }

    distance(p1, p2) {
        if (!p1 || !p2) return 0;
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
}

window.PoseRecognition = PoseRecognition;
