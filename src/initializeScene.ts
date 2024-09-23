import * as THREE from 'three';
import { LumaSplatsThree } from "@lumaai/luma-web";
import { DemoProps } from ".";
import { setupVRControls } from './controls';
import { sources } from './sceneConfigs';

export function initializeScene(capture: string, props: DemoProps) {
    let { renderer, scene } = props;

    let controls = setupVRControls(props);

    let splats = new LumaSplatsThree({
        source: sources[capture].url,
        enableThreeShaderIntegration: false,
    });

    scene.add(splats);

    function applyVRSettings(): void {
        let settings = sources[capture];
        splats.scale.set(settings.scale.x, settings.scale.y, settings.scale.z);
        splats.position.set(settings.position.x, settings.position.y, settings.position.z + 1);
        splats.rotation.set(settings.rotation.x, settings.rotation.y, settings.rotation.z);
    }

    renderer.xr.addEventListener('sessionstart', applyVRSettings);

    return {
        dispose: () => {
            splats.dispose();
            controls.dispose();
        }
    }
}