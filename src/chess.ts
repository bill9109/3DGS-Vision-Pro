import * as THREE from 'three';
import { LumaSplatsThree } from "@lumaai/luma-web";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { DemoProps } from ".";

const capture: string = "chess";

export function chess(props: DemoProps) {
	let { renderer, camera, scene, controls, gui } = props;

	renderer.xr.enabled = true;

	let vrButton = VRButton.createButton(renderer);
	let canvas = renderer.getContext().canvas as HTMLCanvasElement;
	canvas.parentElement!.append(vrButton);

	// 创建一个父对象（Group），用于调整相机的"虚拟"初始位置
	let cameraGroup = new THREE.Group();
	scene.add(cameraGroup);
	// 把相机作为子对象添加到cameraGroup中
	cameraGroup.add(camera);
 
    let controller1 = renderer.xr.getController(0);
	let controller2 = renderer.xr.getController(1);
	controller1.addEventListener('selectend', onSelectEnd);
	controller2.addEventListener('selectend', onSelectEnd);
	scene.add(controller1);
	scene.add(controller2);

    //let intervalId;
	// 事件处理函数：在VR会话开始时设置初始位置
	const onSessionStart = () => {
		// 设置相机初始位置 - 根据实际需求调整
		cameraGroup.position.set(0, 0, 1);
        //intervalId = setInterval(() => {
			//const direction = new THREE.Vector3();
			//camera.getWorldDirection(direction); // 获取相机面向的世界方向
			//direction.normalize(); // 单位化方向向量
			//cameraGroup.position.addScaledVector(direction, 1); // 沿相机的方向移动1个单位
		//}, 2000);
		//cameraGroup.scale.set(0.1, 0.1, 0.1);

	};

    interface SourceSettings {
        url: string;
        scale: { x: number, y: number, z: number };
        position: { x: number, y: number, z: number };
        rotation: { x: number, y: number, z: number };
    }
    
    const sources: Record<string, SourceSettings> = {
        "chess": {
            url: 'https://lumalabs.ai/capture/797885d5-b6bf-4ee6-8714-9e6e209d5f55',
            scale: { x: 3, y: 3, z: 3 },
            position: { x: -2, y: 0, z: -3.5 },
            rotation: { x: 0, y: -0.8 , z: 0 }
        }
    };
    
    
    function onSelectEnd() {
		const direction = new THREE.Vector3();
		camera.getWorldDirection(direction);
		direction.normalize(); // 单位化方向向量
		cameraGroup.position.addScaledVector(direction, 1); // 沿相机的方向移动1个单位
	}


    function applyVRSettings(): void {
        const selectedSource: string = capture; // This could be dynamically set
        let settings = sources[selectedSource];
    
        // Adjust splat for VR
        splats.scale.set(settings.scale.x, settings.scale.y, settings.scale.z);
        splats.position.set(settings.position.x, settings.position.y, settings.position.z + 1); // Example adjustment for VR
        splats.rotation.set(settings.rotation.x, settings.rotation.y, settings.rotation.z);
    
        // Apply additional scene adjustments for VR if needed
        //scene.scale.set(1, 1, 1); // Example: Adjusting the scene scale for VR
    }
	
	// 监听VR会话开始事件
	renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionstart', () => {
        applyVRSettings(); // Apply VR-specific adjustments
    });

    
	let splats = new LumaSplatsThree({
	
		source: sources[capture].url,
		// disable three.js shader integration for performance
		enableThreeShaderIntegration: false,
	});

	scene.add(splats);

	return {
		dispose: () => {
			splats.dispose();
			vrButton.remove();
            controller1.removeEventListener('selectend', onSelectEnd);
			controller2.removeEventListener('selectend', onSelectEnd);
            //if (intervalId) clearInterval(intervalId);
			//renderer.xr.removeEventListener('sessionstart', onSessionStart);
		}
	}
}