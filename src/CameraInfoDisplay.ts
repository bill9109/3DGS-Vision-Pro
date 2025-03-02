import * as THREE from 'three';
import { sources } from './sceneConfigs';

export class CameraInfoDisplay {
    private mesh: THREE.Mesh;
    private counter: number = 0;
    private clock: THREE.Clock;
    private elapsedTime: number = 0;
    private isVRMode: boolean = false;
    private cameraGroupPosition: THREE.Vector3 = new THREE.Vector3();
    private cameraGroup: THREE.Group;
    private lastLogTime: number = 0;
    private LOG_INTERVAL: number = 5000; // 5秒
    private renderer: THREE.WebGLRenderer;
    private cameraGroupRotation: THREE.Euler = new THREE.Euler();
    private cameraRotation: THREE.Euler = new THREE.Euler();
    private cachedTextureUpdate: number = 0;
    private TEXT_UPDATE_INTERVAL: number = 100; // 100毫秒更新一次纹理
    private currentCapture: string = ''; // 跟踪当前的场景
    private isLongPressActive: boolean = false;
    private rotationDelta: number = 0;
    private isSessionActive: boolean = false;

    constructor(renderer: THREE.WebGLRenderer, cameraGroup: THREE.Group, captureId: string = '') {
        this.mesh = this.createTextMesh();
        this.mesh.position.set(0, 0, -1);
        this.clock = new THREE.Clock();
        this.renderer = renderer;
        this.cameraGroup = cameraGroup;
        this.currentCapture = captureId;

        console.log('CameraInfoDisplay: Constructor called with cameraGroup, capture:', captureId);

        renderer.xr.addEventListener('sessionstart', () => {
            console.log('CameraInfoDisplay: VR session start event received');
            this.isVRMode = true;
            console.log('VR会话开始 - CameraInfoDisplay, isVRMode set to:', this.isVRMode);
        });

        renderer.xr.addEventListener('sessionend', () => {
            console.log('CameraInfoDisplay: VR session end event received');
            this.isVRMode = false;
            console.log('VR会话结束 - CameraInfoDisplay, isVRMode set to:', this.isVRMode);
        });

        // 设置onBeforeRender回调
        this.mesh.onBeforeRender = (renderer, scene, camera) => {
            try {
                // 只使用左眼相机（或在非VR模式下使用主相机）
                const currentCamera = this.isVRMode ? this.getLeftEyeCamera() : camera;
                
                // 在每帧渲染前更新相机组位置和旋转
                if (this.cameraGroup) {
                    this.cameraGroupPosition.copy(this.cameraGroup.position);
                    this.cameraGroupRotation.copy(this.cameraGroup.rotation);
                }
                
                // 存储相机本身的旋转
                if (currentCamera) {
                    this.cameraRotation.copy(currentCamera.rotation);
                }
                
                // 控制纹理更新频率，避免每帧都更新
                const now = performance.now();
                if (now - this.cachedTextureUpdate > this.TEXT_UPDATE_INTERVAL) {
                    this.updateDisplay(currentCamera);
                    this.cachedTextureUpdate = now;
                }
            } catch (error) {
                console.error('Error in onBeforeRender:', error);
            }
        };
    }

    private createTextMesh(): THREE.Mesh {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 384;

        const context = canvas.getContext('2d')!;

        // 清除画布，设置透明背景
        context.clearRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const geometry = new THREE.PlaneGeometry(1, 0.75);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 9999; // 确保在其他物体之上渲染
        return mesh;
    }

    public setCameraGroupPosition(position: THREE.Vector3) {
        this.cameraGroupPosition.copy(position);
    }

    private normalizeAngle(angle: number): number {
        // 将角度规范化到 -π 到 π 的范围内
        return ((angle + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    }

    public setCurrentCapture(captureId: string) {
        this.currentCapture = captureId;
        console.log('Current capture set to:', captureId);
    }

    private calculateSceneConfigValues(): {position: THREE.Vector3, rotation: THREE.Euler} {
        // 这个函数的目标是：根据当前相机的位置和旋转，计算出需要填入sceneConfig的值
        // 以便用户在该位置查看到的场景与当前一致
        
        // 关键理解：
        // 1. sceneConfig中的position是模型在世界中的位置 
        // 2. 当我们移动相机时，我们需要保持相对视图不变
        
        // 我们从初始配置开始
        const currentSettings = this.currentCapture && sources[this.currentCapture] 
            ? sources[this.currentCapture] 
            : { position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1} };
        
        // 创建初始sceneConfig的模型位置
        const initialModelPosition = new THREE.Vector3(
            currentSettings.position.x,
            currentSettings.position.y, 
            currentSettings.position.z
        );
        
        // 相机从初始位置(0,0,1)移动到当前位置的位移量
        const cameraOffset = new THREE.Vector3().subVectors(
            this.cameraGroupPosition, 
            new THREE.Vector3(0, 0, 1)
        );
        
        // 创建新的模型位置（抵消相机移动）
        // 如果相机向右移动，模型需要向左移动相同距离
        // 注意：在应用模型位置时，z坐标会+1，所以这里计算出的z值需要-1进行补偿
        const newModelPosition = new THREE.Vector3(
            initialModelPosition.x - cameraOffset.x,
            initialModelPosition.y - cameraOffset.y,
            initialModelPosition.z - cameraOffset.z - 1  // 减去1以补偿应用时加的1
        );
        
        // 初始模型旋转
        const initialModelRotation = new THREE.Euler(
            currentSettings.rotation.x,
            currentSettings.rotation.y,
            currentSettings.rotation.z
        );
        
        // 计算相机的总旋转（相机组旋转 + 相机自身旋转）
        const cameraTotalRotation = new THREE.Euler(
            this.cameraGroupRotation.x + this.cameraRotation.x,
            this.cameraGroupRotation.y + this.cameraRotation.y,
            this.cameraGroupRotation.z + this.cameraRotation.z
        );
        
        // 相机旋转会影响模型的视觉方向，所以我们需要相应地调整模型旋转
        // 如果相机向右旋转，模型需要向左旋转，以保持相同的视觉
        const newModelRotation = new THREE.Euler(
            initialModelRotation.x - cameraTotalRotation.x,
            this.normalizeAngle(initialModelRotation.y - cameraTotalRotation.y),
            initialModelRotation.z - cameraTotalRotation.z
        );
        
        return {
            position: newModelPosition,
            rotation: newModelRotation
        };
    }

    private updateDisplay(camera: THREE.Camera) {
        try {
            const currentTime = performance.now();
            if (currentTime - this.lastLogTime > this.LOG_INTERVAL) {
                console.log('CameraInfoDisplay update called, isVRMode:', this.isVRMode);
                this.lastLogTime = currentTime;
            }

            // 更新计数器
            this.elapsedTime += this.clock.getDelta();
            if (this.elapsedTime >= 5) {
                this.counter++;
                this.elapsedTime -= 5;
            }

            const material = this.mesh.material as THREE.MeshBasicMaterial;
            const texture = material.map as THREE.Texture;
            const canvas = texture.image as HTMLCanvasElement;
            const context = canvas.getContext('2d')!;

            // 清除画布
            context.clearRect(0, 0, canvas.width, canvas.height);

            // 设置文本样式
            context.fillStyle = 'white';
            context.font = '16px sans-serif';
            context.textAlign = 'left';
            context.textBaseline = 'top';

            // 获取适合sceneConfig的模型配置
            const sceneConfigValues = this.calculateSceneConfigValues();
            
            // 格式化模型位置和旋转数据
            const positionConfig = `position: { x: ${sceneConfigValues.position.x.toFixed(1)}, y: ${sceneConfigValues.position.y.toFixed(1)}, z: ${sceneConfigValues.position.z.toFixed(1)} }`;
            const rotationConfig = `rotation: { x: ${sceneConfigValues.rotation.x.toFixed(2)}, y: ${sceneConfigValues.rotation.y.toFixed(2)}, z: ${sceneConfigValues.rotation.z.toFixed(2)} }`;

            // 获取当前场景的初始配置（用于显示参考）
            const currentSettings = this.currentCapture && sources[this.currentCapture] 
                ? sources[this.currentCapture] 
                : { position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0} };
            
            const initialPosConfig = `position: { x: ${currentSettings.position.x}, y: ${currentSettings.position.y}, z: ${currentSettings.position.z} }`;
            const initialRotConfig = `rotation: { x: ${currentSettings.rotation.x}, y: ${currentSettings.rotation.y}, z: ${currentSettings.rotation.z} }`;

            // 绘制文本，添加长按状态信息
            const lines = [
                `场景: ${this.currentCapture || 'unknown'}`,
                `VR Mode: ${this.isVRMode ? 'On' : 'Off'}, Session: ${this.isSessionActive ? 'Active' : 'Inactive'}`,
                `----- 手势控制状态 -----`,
                `长按模式: ${this.isLongPressActive ? '激活' : '未激活'}`,
                `旋转角度: ${this.rotationDelta.toFixed(1)}°`,
                `----- 应使用此 sceneConfig 设置 -----`,
                positionConfig + ',',
                rotationConfig + ',',
                `----- 当前 sceneConfig 设置 -----`,
                initialPosConfig + ',',
                initialRotConfig + ',',
                `----- 相机调试信息 -----`,
                `相机位置: (${this.cameraGroupPosition.x.toFixed(1)}, ${this.cameraGroupPosition.y.toFixed(1)}, ${this.cameraGroupPosition.z.toFixed(1)})`,
                `相机旋转: (${(this.cameraRotation.x * 180 / Math.PI).toFixed(1)}°, ${(this.cameraRotation.y * 180 / Math.PI).toFixed(1)}°)`,
            ];

            lines.forEach((line, index) => {
                context.fillText(line, 10, 10 + index * 20);
            });

            // 更新纹理
            texture.needsUpdate = true;
        } catch (error) {
            console.error('Error updating display:', error);
        }
    }

    private getLeftEyeCamera(): THREE.Camera {
        if (this.isVRMode && this.renderer.xr.isPresenting) {
            const xrCamera = this.renderer.xr.getCamera();
            if (xrCamera.cameras.length > 0) {
                return xrCamera.cameras[0]; // 左眼相机通常是第一个
            }
        }
        return this.renderer.xr.getCamera(); // 如果无法获取左眼相机，返回主相机
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public setLongPressActive(active: boolean): void {
        this.isLongPressActive = active;
    }

    public setRotationDelta(delta: number): void {
        this.rotationDelta = delta;
    }

    public setSessionActive(active: boolean): void {
        this.isSessionActive = active;
    }
}

