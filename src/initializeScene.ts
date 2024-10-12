import * as THREE from 'three';
import { LumaSplatsThree } from "@lumaai/luma-web";
import { DemoProps } from ".";
import { setupVRControls } from './controls';
import { sources } from './sceneConfigs';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const SHOW_CAMERA_POSITION = true; // 控制是否显示摄像机位置

export function initializeScene(capture: string, props: DemoProps) {
    console.log('Initializing scene with capture:', capture);
    let { renderer, scene, camera } = props;

    let controls = setupVRControls(props);
    console.log('VR controls set up');

    let splats = new LumaSplatsThree({
        source: sources[capture].url,
        enableThreeShaderIntegration: false,
    });

    scene.add(splats);
    console.log('Splats added to scene');

    function applyVRSettings(): void {
        let settings = sources[capture];
        splats.scale.set(settings.scale.x, settings.scale.y, settings.scale.z);
        splats.position.set(settings.position.x, settings.position.y, settings.position.z + 1);
        splats.rotation.set(settings.rotation.x, settings.rotation.y, settings.rotation.z);
        console.log('VR settings applied:', settings);
    }

    renderer.xr.addEventListener('sessionstart', applyVRSettings);

    // 仅在开发模式下显示摄像机位置
    if (SHOW_CAMERA_POSITION) {
        console.log('Development mode: showing camera position');
        const loader = new FontLoader();
        let cameraPositionText: THREE.Mesh;
        
        loader.load('./fonts.json', function (font) {
            console.log('Font loaded');
            const textGeometry = new TextGeometry('Camera Position', {
                font: font,
                size: 0.5, // 增大字体大小
                height: 0.1,
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            cameraPositionText = new THREE.Mesh(textGeometry, textMaterial);
            scene.add(cameraPositionText);
            console.log('Camera position text added to scene');
        });

        // 在每帧更新时更新文本对象的位置和内容
        renderer.setAnimationLoop(() => {
            if (cameraPositionText) {
                const { x, y, z } = camera.position;
                cameraPositionText.position.set(x, y - 1, z - 2); // 调整文本位置，使其在摄像机前方
                cameraPositionText.lookAt(camera.position); // 使文本面向摄像机

                // 更新文本内容
                const textGeometry = new TextGeometry(`Position: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`, {
                    font: cameraPositionText.geometry.userData.font,
                    size: 0.5, // 增大字体大小
                    height: 0.1,
                });
                cameraPositionText.geometry.dispose();
                cameraPositionText.geometry = textGeometry;
                console.log(`Camera position updated: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
            }
        });

        return {
            dispose: () => {
                splats.dispose();
                controls.dispose();
                if (cameraPositionText) {
                    cameraPositionText.geometry.dispose();
                    if (Array.isArray(cameraPositionText.material)) {
                        cameraPositionText.material.forEach(material => material.dispose());
                    } else {
                        cameraPositionText.material.dispose();
                    }
                    scene.remove(cameraPositionText);
                }
            }
        }
    } else {
        return {
            dispose: () => {
                splats.dispose();
                controls.dispose();
            }
        }
    }
}