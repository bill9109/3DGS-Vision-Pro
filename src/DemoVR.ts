import * as THREE from 'three';
import { LumaSplatsThree } from "@lumaai/luma-web";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { DemoProps } from ".";

export function DemoVR(props: DemoProps) {
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
 

	// 事件处理函数：在VR会话开始时设置初始位置
	const onSessionStart = () => {
		// 设置相机初始位置 - 根据实际需求调整
		cameraGroup.position.set(0.9, -0.15, -0.3);
		cameraGroup.scale.set(0.1, 0.1, 0.1);

	};

    // 初始化控制器
    let controller1 = renderer.xr.getController(0);
    let controller2 = renderer.xr.getController(1);
    scene.add(controller1);
    scene.add(controller2);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
    const line = new THREE.Line(geometry, lineMaterial);
    line.name = 'line';
    line.scale.z = 5; // 射线长度固定为5

    controller1.add(line.clone());
    controller2.add(line.clone());

    // 移动比例因子，可根据需要调整
    const movementScale = 0.1; 

    let isMoving = false; // 标记是否应该更新相机位置

    function updateCameraPosition(controller) {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(controller.quaternion);
        const offset = direction.multiplyScalar(-movementScale);
        cameraGroup.position.add(offset);
    }

    function handleSelectStart(event) {
        const controller = event.target;
        controller.userData.targetRayMode = event.data.targetRayMode;
		isMoving = true;
    }

    function handleSelectEnd() {
        isMoving = false;
    }

    controller1.addEventListener('selectstart', handleSelectStart);
    controller1.addEventListener('selectend', handleSelectEnd);
    controller2.addEventListener('selectstart', handleSelectStart);
    controller2.addEventListener('selectend', handleSelectEnd);

    renderer.setAnimationLoop(() => {
        if (isMoving) {
            updateCameraPosition(controller1);
            updateCameraPosition(controller2);
        }
    });
	
	// 监听VR会话开始事件
	renderer.xr.addEventListener('sessionstart', onSessionStart);


    
	let splats = new LumaSplatsThree({
		// Kind Humanoid @RyanHickman
		source: 'https://lumalabs.ai/capture/5e1c803a-0123-4b1f-8f3f-971fb54b62d2',
		// disable three.js shader integration for performance
		enableThreeShaderIntegration: false,
	});

	scene.add(splats);

	return {
		dispose: () => {
			splats.dispose();
			vrButton.remove();
			//renderer.xr.removeEventListener('sessionstart', onSessionStart);
		}
	}
}