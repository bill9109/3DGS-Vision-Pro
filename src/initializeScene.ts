import * as THREE from 'three';
import { LumaSplatsThree } from "@lumaai/luma-web";
import { DemoProps } from ".";
import { setupVRControls } from './controls';
import { sources } from './sceneConfigs';

export function initializeScene(capture: string, props: DemoProps) {
    console.log('Initializing scene with capture:', capture);
    let { renderer, scene, camera } = props;

    let cameraGroup: THREE.Group;

    let { cameraGroupRef, getUpdatedCameraGroupPosition, getUpdatedCameraGroupRotation, updateCameraGroupPosition } = setupVRControls(props);
    cameraGroup = cameraGroupRef;

    let splats = new LumaSplatsThree({
        source: sources[capture].url,
        enableThreeShaderIntegration: false,
    });

    scene.add(splats);
    console.log('Splats added to scene');

    function applyVRSettings(): void {
        console.log('Applying VR settings');
        let settings = sources[capture];
        splats.scale.set(settings.scale.x, settings.scale.y, settings.scale.z);
        splats.position.set(settings.position.x, settings.position.y, settings.position.z + 1);
        splats.rotation.set(settings.rotation.x, settings.rotation.y, settings.rotation.z);
        console.log('VR settings applied:', settings);
    }

    renderer.xr.addEventListener('sessionstart', applyVRSettings);

    let lastLogTime = 0;
    const LOG_INTERVAL = 5000; // 5秒

    // 更新函数
    function update(time: number, frame?: XRFrame) {
        const currentTime = performance.now();
        if (currentTime - lastLogTime > LOG_INTERVAL) {
            console.log('Update function called, isPresenting:', renderer.xr.isPresenting);
            lastLogTime = currentTime;
        }

        // 更新相机组位置
        updateCameraGroupPosition(cameraGroup.position);

        if (renderer.xr.isPresenting) {
            // 在VR模式下执行特定的更新逻辑
            console.log('VR模式：相机信息面板已更新');
            console.log('当前相机位置:', cameraGroup.position.toArray());
        }
    }

    // 设置动画循环
    renderer.setAnimationLoop((time, frame) => {
        if (renderer.xr.isPresenting) {
            console.log('Animation loop running, time:', time);
        }
        update(time, frame);
    });

    return {
        dispose: () => {
            console.log('Disposing scene');
            splats.dispose();
            renderer.xr.removeEventListener('sessionstart', applyVRSettings);
            renderer.setAnimationLoop(null);
        }
    }
}
