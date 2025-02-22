import * as THREE from 'three';
import { VRButton } from "./VRButton.js";
import { DemoProps } from ".";
import { CameraInfoDisplay } from './CameraInfoDisplay';

const SHOW_CAMERA_POSITION = false;

export function setupVRControls(props: DemoProps) {
    console.log('setupVRControls: Function called');
    let { renderer, camera, scene } = props;

    renderer.xr.enabled = true;

    let vrButton = VRButton.createButton(renderer);
    let canvas = renderer.getContext().canvas as HTMLCanvasElement;
    canvas.parentElement!.append(vrButton);

    let cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    cameraGroup.add(camera);

    let controller1 = renderer.xr.getController(0);
    let controller2 = renderer.xr.getController(1);
    controller1.addEventListener('selectend', onSelectEnd);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);
    scene.add(controller2);

    let cameraInfoDisplay: CameraInfoDisplay | null = null;

    const onSessionStart = () => {
        console.log('VR会话开始 - setupVRControls');
        cameraGroup.position.set(0, 0, 1);
        if (SHOW_CAMERA_POSITION) {
            createAndAddCameraInfoDisplay();
        }
    };

    const onSessionEnd = () => {
        console.log('VR会话结束 - setupVRControls');
    };

    function createAndAddCameraInfoDisplay() {
        if (!cameraInfoDisplay && SHOW_CAMERA_POSITION) {
            console.log('Creating CameraInfoDisplay');
            cameraInfoDisplay = new CameraInfoDisplay(renderer);
            camera.add(cameraInfoDisplay.getMesh());
            console.log('Camera info display created and added to camera');
        }
    }

    // 只在 SHOW_CAMERA_POSITION 为 true 时创建 CameraInfoDisplay
    if (SHOW_CAMERA_POSITION) {
        createAndAddCameraInfoDisplay();
    }

    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);

    function onSelectEnd() {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.normalize();
        cameraGroup.position.addScaledVector(direction, 1);
        console.log('Select end event, new position:', cameraGroup.position.toArray());
    }

    return {
        dispose: () => {
            console.log('Disposing VR controls');
            vrButton.remove();
            controller1.removeEventListener('selectend', onSelectEnd);
            controller2.removeEventListener('selectend', onSelectEnd);
            renderer.xr.removeEventListener('sessionstart', onSessionStart);
            renderer.xr.removeEventListener('sessionend', onSessionEnd);
            if (cameraInfoDisplay) {
                camera.remove(cameraInfoDisplay.getMesh());
            }
        },
        cameraGroupRef: cameraGroup,
        getUpdatedCameraGroupPosition: () => cameraGroup.position,
        getUpdatedCameraGroupRotation: () => cameraGroup.rotation,
        updateCameraGroupPosition: (position: THREE.Vector3) => {
            if (cameraInfoDisplay) {
                cameraInfoDisplay.setCameraGroupPosition(position);
            }
        }
    }
}
