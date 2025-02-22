import * as THREE from 'three';

export class CameraInfoDisplay {
    private mesh: THREE.Mesh;
    private counter: number = 0;
    private clock: THREE.Clock;
    private elapsedTime: number = 0;
    private isVRMode: boolean = false;
    private cameraGroupPosition: THREE.Vector3 = new THREE.Vector3();
    private lastLogTime: number = 0;
    private LOG_INTERVAL: number = 5000; // 5秒
    private renderer: THREE.WebGLRenderer;

    constructor(renderer: THREE.WebGLRenderer) {
        this.mesh = this.createTextMesh();
        this.mesh.position.set(0, 0, -1);
        this.clock = new THREE.Clock();
        this.renderer = renderer;

        console.log('CameraInfoDisplay: Constructor called');

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
            this.updateDisplay(camera);
        };
    }

    private createTextMesh(): THREE.Mesh {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 384; // 增加画布高度

        const context = canvas.getContext('2d')!;

        // 清除画布，设置透明背景
        context.clearRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const geometry = new THREE.PlaneGeometry(1, 0.75); // 增加几何体高度
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

    private updateDisplay(camera: THREE.Camera) {
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
            console.log(`CameraInfoDisplay: Counter updated to ${this.counter}, VR mode: ${this.isVRMode}`);
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

        // 获取正确的相机数据
        const cameraToUse = this.isVRMode ? this.getLeftEyeCamera() : camera;

        // 绘制文本
        const lines = [
            `Update Counter: ${this.counter}`,
            `VR Mode: ${this.isVRMode ? 'On' : 'Off'}`,
            `坐标:`,
            `X: ${this.cameraGroupPosition.x.toFixed(1)}`,
            `Y: ${this.cameraGroupPosition.y.toFixed(1)}`,
            `Z: ${this.cameraGroupPosition.z.toFixed(1)}`,
            `Camera Position:`,
            `X: ${cameraToUse.position.x.toFixed(2)}`,
            `Y: ${cameraToUse.position.y.toFixed(2)}`,
            `Z: ${cameraToUse.position.z.toFixed(2)}`,
            `Camera Rotation:`,
            `X: ${(cameraToUse.rotation.x * 180 / Math.PI).toFixed(2)}°`,
            `Y: ${(cameraToUse.rotation.y * 180 / Math.PI).toFixed(2)}°`,
            `Z: ${(cameraToUse.rotation.z * 180 / Math.PI).toFixed(2)}°`
        ];

        lines.forEach((line, index) => {
            context.fillText(line, 10, 10 + index * 20);
        });

        // 更新纹理
        texture.needsUpdate = true;
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
}
