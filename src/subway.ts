import * as THREE from 'three';
import { LumaSplatsThree } from "@lumaai/luma-web";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { DemoProps } from ".";

const capture: string = "subway";

export function subway(props: DemoProps) {
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
        },
        "car": {
            url: 'https://lumalabs.ai/capture/5e1c803a-0123-4b1f-8f3f-971fb54b62d2',
            scale: { x: 3, y: 3, z: 3 },
            position: { x: -2, y: 1, z: 0 },
            rotation: { x: 0, y: 0 , z: 0 }
        },
        "tangbohu": {
            url: 'https://lumalabs.ai/capture/d2502abf-d2be-4fe3-af78-310c44feb983',
            scale: { x: 0.8, y: 0.8, z: 0.8 },
            position: { x: 2, y: 1, z: -4 },
            rotation: { x: 0, y: -0.8 , z: 0 }
        },
        "davinci": {
            url: 'https://lumalabs.ai/capture/12017ace-ed72-4845-86ef-3a3a267d8b27',
            scale: { x: 0.8, y: 0.8, z: 0.8 },
            position: { x: 0, y: 1, z: -4 },
            rotation: { x: 0, y: 2.4 , z: -0.15 }
        },
        "Gundam": {
            url: 'https://lumalabs.ai/capture/6dae3651-9987-4f53-ae19-b7134da09499',
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 1, z: -4 },
            rotation: { x: 0, y: 2.4 , z: -0.15 }
        },
        "subway": {
            url: 'https://lumalabs.ai/capture/B271FFF7-37DD-47B1-8921-6375CD069C91',
            scale: { x: 4, y: 4, z: 4 },
            position: { x: 0, y: 1, z: 0 },
            rotation: { x: 0, y: 0 , z: 0 }
        },
        "Grammy": {
            url: 'https://lumalabs.ai/capture/BBCE804E-3B50-490F-A86F-6E5C4094BAC0',
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 1, z: -3 },
            rotation: { x: 0, y: 0 , z: 0 }
        },
        "Baltimore": {
            url: 'https://lumalabs.ai/capture/5f21cd1d-d445-4238-9aec-9699fabdcfb0',
            scale: { x: 10, y: 10, z: 10 },
            position: { x: -8, y: -10, z: -25 },
            rotation: { x: -0.5, y: 4 , z: -0.3 }
        },
        "Baltimore1": {
            url: 'https://lumalabs.ai/capture/A6866DB1-E813-4C8A-8F72-70A3E49FC116',
            scale: { x: 10, y: 10, z: 10 },
            position: { x: -20, y: -20, z: -20 },
            rotation: { x: -0.5, y: 4 , z: -0.3 }
        },
        "teslabot": {
            url: 'https://lumalabs.ai/capture/68C3DB16-F7D7-49A8-9278-105D4CEBE6CD',
            scale: { x: 0.8, y: 0.8, z: 0.8 },
            position: { x: 0, y: 1, z: -4 },
            rotation: { x: 0, y: 2.5 , z: 0 }
        },
        "met": {
            url: 'https://lumalabs.ai/capture/6A1B0C89-15C1-4C7E-A708-7C6E4E2B5E54',
            scale: { x: 0.8, y: 0.8, z: 0.8 },
            position: { x: 0, y: 2, z: -1 },
            rotation: { x: 0, y: 0 , z: 0 }
        },
        "Einstein": {
            url: 'https://lumalabs.ai/capture/3af9315a-45be-4eb2-870e-d20ab0ee61f9',
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 1, z: -4 },
            rotation: { x: 0, y: 2.4 , z: -0.15 }
        },
        "hollywood": {
            url: 'https://lumalabs.ai/capture/b5faf515-7932-4000-ab23-959fc43f0d94',
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 1, z: -4 },
            rotation: { x: 0, y: 2.4 , z: -0.15 }
        },
        "KeithHaring": {
            url: 'https://lumalabs.ai/capture/1b185adf-82a5-4ad3-8ffe-9c4a54980772',
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 1, z: -4 },
            rotation: { x: 0, y: 2.4 , z: -0.15 }
        },
        "Science Orb": {
            url: 'https://lumalabs.ai/capture/65a3fc14-2ad1-4b81-b09d-bb79277a714c',
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 1, z: -4 },
            rotation: { x: 0, y: 2.4 , z: -0.15 }
        },
        "2024": {
            url: 'https://lumalabs.ai/capture/f896e5cb-702b-4225-9467-e61f19e47d46',
            scale: { x: 7, y: 7, z: 7 },
            position: { x: 5, y: 0, z: -20 },
            rotation: { x: -0.05, y: 2.2, z: 0.05 }
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