import * as THREE from 'three';
import { VRButton } from "./VRButton.js";
import { DemoProps } from ".";

export function setupVRControls(props: DemoProps) {
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

    const onSessionStart = () => {
        cameraGroup.position.set(0, 0, 1);
    };

    function onSelectEnd() {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.normalize();
        cameraGroup.position.addScaledVector(direction, 1);
    }

    renderer.xr.addEventListener('sessionstart', onSessionStart);

    return {
        dispose: () => {
            vrButton.remove();
            controller1.removeEventListener('selectend', onSelectEnd);
            controller2.removeEventListener('selectend', onSelectEnd);
        }
    }
}