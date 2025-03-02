import * as THREE from 'three';
import { VRButton } from "./VRButton.js";
import { DemoProps } from ".";
import { CameraInfoDisplay } from './CameraInfoDisplay';

const SHOW_CAMERA_POSITION = false;
const LONG_PRESS_THRESHOLD = 500; // 长按阈值（毫秒）
const LOG_INTERVAL = 1000; // 减少到1秒，以捕获更多日志

// 扩展XRTargetRayMode类型以支持Vision Pro的transient-pointer模式
declare module 'three' {
    namespace THREE {
        interface XRInputSource {
            targetRayMode: 'gaze' | 'tracked-pointer' | 'screen' | 'transient-pointer';
        }
    }
}

export function setupVRControls(props: DemoProps, captureId: string = '') {
    console.log('setupVRControls: Function called');
    let { renderer, camera, scene } = props;

    renderer.xr.enabled = true;

    let vrButton = VRButton.createButton(renderer);
    let canvas = renderer.getContext().canvas as HTMLCanvasElement;
    canvas.parentElement!.append(vrButton);

    let cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    cameraGroup.add(camera);

    // 长按状态跟踪
    let isLongPress = false;
    let selectStartTime = 0;
    let longPressHandler: number | null = null;
    let lastLogTime = 0;
    let frameCounter = 0; // 添加帧计数器
    
    // 用于跟踪手势的变量
    let initialGripPosition: THREE.Vector3 | null = null;
    let initialCameraRotation = new THREE.Euler();
    
    // 当前活动的输入源
    let activeInputSource: XRInputSource | null = null;
    
    let cameraInfoDisplay: CameraInfoDisplay | null = null;

    // 存储事件处理程序的Map
    const eventHandlers = new Map<XRSession, (event: any) => void>();

    // 用于跟踪位置变化的变量
    let lastFramePosition: THREE.Vector3 | null = null;

    // 处理selectstart事件
    const onSelectStart = (event: any) => {
        console.log('Select start event:', event.inputSource.targetRayMode);
        
        // 获取参考空间和输入源
        const referenceSpace = renderer.xr.getReferenceSpace();
        const inputSource = event.inputSource;
        
        if (!referenceSpace || !inputSource) {
            console.warn('无法获取参考空间或输入源');
            return;
        }
        
        // 记录开始时间和输入源
        selectStartTime = performance.now();
        activeInputSource = inputSource;
        
        // 清除任何之前的定时器
        if (longPressHandler !== null) {
            clearTimeout(longPressHandler);
        }
        
        // 设置长按定时器
        longPressHandler = window.setTimeout(() => {
            isLongPress = true;
            console.log('长按模式已激活!');
            
            // 保存相机初始旋转
            initialCameraRotation.copy(cameraGroup.rotation);
            
            // 立即获取初始手势位置
            const frame = renderer.xr.getFrame();
            if (frame && inputSource.gripSpace) {
                const pose = frame.getPose(inputSource.gripSpace, referenceSpace);
                if (pose) {
                    initialGripPosition = new THREE.Vector3(
                        pose.transform.position.x,
                        pose.transform.position.y,
                        pose.transform.position.z
                    );
                    lastFramePosition = initialGripPosition.clone();
                    console.log('已设置初始手部位置:', initialGripPosition.toArray());
                }
            }
            
            // 更新UI
            if (cameraInfoDisplay) {
                cameraInfoDisplay.setLongPressActive(true);
            }
        }, LONG_PRESS_THRESHOLD);
        
        // 记录输入源信息
        console.log('输入源类型:', {
            type: inputSource.targetRayMode,
            handedness: inputSource.handedness,
            hasGripSpace: !!inputSource.gripSpace,
            hasTargetRaySpace: !!inputSource.targetRaySpace
        });
    };
    
    // 处理selectend事件
    const onSelectEnd = (event: any) => {
        console.log('Select end event');
        
        // 清除长按定时器
        if (longPressHandler !== null) {
            clearTimeout(longPressHandler);
            longPressHandler = null;
        }
        
        const pressDuration = performance.now() - selectStartTime;
        console.log('按压持续时间:', pressDuration.toFixed(0), 'ms');
        
        if (isLongPress) {
            // 重置状态
            isLongPress = false;
            initialGripPosition = null;
            
            if (cameraInfoDisplay) {
                cameraInfoDisplay.setLongPressActive(false);
                cameraInfoDisplay.setRotationDelta(0);
            }
            
            console.log('长按模式已结束');
        } else {
            // 短按处理 - 向前移动
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            direction.normalize();
            cameraGroup.position.addScaledVector(direction, 1);
            console.log('短按移动，新位置:', cameraGroup.position.toArray());
        }
        
        // 清除活动输入源
        activeInputSource = null;
    };
    
    // 实现手势拖动旋转的关键函数
    const handleGestureDrag = (frame: XRFrame) => {
        // 仅在长按模式下处理
        if (!isLongPress || !frame) {
            return;
        }
        
        // 获取参考空间
        const referenceSpace = renderer.xr.getReferenceSpace();
        if (!referenceSpace) {
            console.warn('无法获取参考空间');
            return;
        }
        
        // 如果没有活跃的输入源，尝试从当前会话中获取
        if (!activeInputSource) {
            const session = renderer.xr.getSession();
            if (session && session.inputSources && session.inputSources.length > 0) {
                // 查找transient-pointer类型的输入源
                for (const source of session.inputSources) {
                    if (source.targetRayMode === 'transient-pointer') {
                        activeInputSource = source;
                        console.log('重新获取到Vision Pro输入源');
                        break;
                    }
                }
            }
            
            if (!activeInputSource) {
                // 如果仍然找不到transient-pointer，尝试使用任何可用的输入源
                const session = renderer.xr.getSession();
                if (session && session.inputSources && session.inputSources.length > 0) {
                    activeInputSource = session.inputSources[0];
                    console.log('使用可用的输入源:', activeInputSource.targetRayMode);
                } else {
                    console.warn('无法找到活跃的输入源');
                    return;
                }
            }
        }
        
        // 声明一个变量来存储当前位置
        let currentPosition: THREE.Vector3 | null = null;
        let currentOrientation: THREE.Quaternion | null = null;
        
        // 首先尝试从gripSpace获取位置（这是手部位置，更适合用于手势追踪）
        if (activeInputSource.gripSpace) {
            const pose = frame.getPose(activeInputSource.gripSpace, referenceSpace);
            if (pose) {
                currentPosition = new THREE.Vector3().fromArray([
                    pose.transform.position.x,
                    pose.transform.position.y,
                    pose.transform.position.z
                ]);
                
                currentOrientation = new THREE.Quaternion().fromArray([
                    pose.transform.orientation.x,
                    pose.transform.orientation.y, 
                    pose.transform.orientation.z,
                    pose.transform.orientation.w
                ]);
            }
        }
        
        // 如果gripSpace不可用，尝试targetRaySpace（视线射线，次选）
        if (!currentPosition && activeInputSource.targetRaySpace) {
            const pose = frame.getPose(activeInputSource.targetRaySpace, referenceSpace);
            if (pose) {
                currentPosition = new THREE.Vector3().fromArray([
                    pose.transform.position.x,
                    pose.transform.position.y,
                    pose.transform.position.z
                ]);
                
                currentOrientation = new THREE.Quaternion().fromArray([
                    pose.transform.orientation.x,
                    pose.transform.orientation.y, 
                    pose.transform.orientation.z,
                    pose.transform.orientation.w
                ]);
            }
        }
        
        // 如果获取到位置，处理旋转
        if (currentPosition) {
            // 如果位置有明显变化，则更新旋转
            if (lastFramePosition && currentPosition.distanceTo(lastFramePosition) > 0.001) {
                // 计算手部移动方向和旋转
                handlePositionForRotation(currentPosition, currentOrientation);
            }
            
            // 更新上一帧的位置
            lastFramePosition = currentPosition.clone();
        } else {
            console.warn('无法获取当前输入位置');
        }
    };

    // 处理位置数据转换为旋转的函数
    function handlePositionForRotation(currentPosition: THREE.Vector3, currentOrientation?: THREE.Quaternion | null) {
        // 如果没有初始位置，设置初始位置
        if (initialGripPosition === null) {
            initialGripPosition = currentPosition.clone();
            console.log('已设置初始手部位置:', initialGripPosition.toArray());
            return;
        }
        
        // 计算手部水平移动量 (x轴)
        const offsetX = currentPosition.x - initialGripPosition.x;
        // 也可以考虑垂直移动量(y轴)用于控制俯仰角
        const offsetY = currentPosition.y - initialGripPosition.y;
        
        // 将水平移动转换为旋转角度 (可调整敏感度)
        const rotationFactorX = 2.5; // 旋转灵敏度系数
        const rotationFactorY = 1.5; // 垂直旋转灵敏度系数
        
        // 计算旋转增量
        const yRotationDelta = offsetX * rotationFactorX;
        const xRotationDelta = offsetY * rotationFactorY;
        
        // 应用水平旋转（Y轴）
        cameraGroup.rotation.y = initialCameraRotation.y + yRotationDelta;
        
        // 可选：添加垂直旋转（X轴，即俯仰角）
        // 注意：限制俯仰角范围防止过度旋转
        // cameraGroup.rotation.x = THREE.MathUtils.clamp(
        //     initialCameraRotation.x - xRotationDelta, 
        //     -Math.PI/3, // 下限（约60度）
        //     Math.PI/3   // 上限（约60度）
        // );
        
        // 更新UI
        if (cameraInfoDisplay) {
            cameraInfoDisplay.setRotationDelta(THREE.MathUtils.radToDeg(yRotationDelta));
        }
    }

    function createAndAddCameraInfoDisplay() {
        if (!cameraInfoDisplay && SHOW_CAMERA_POSITION) {
            console.log('Creating CameraInfoDisplay');
            cameraInfoDisplay = new CameraInfoDisplay(renderer, cameraGroup, captureId);
            camera.add(cameraInfoDisplay.getMesh());
            console.log('Camera info display created and added to camera');
        }
    }

    // 设置事件监听和相机信息显示
    const onSessionStart = () => {
        console.log('VR会话开始');
        if (SHOW_CAMERA_POSITION) {
            createAndAddCameraInfoDisplay();
        }
        
        const session = renderer.xr.getSession();
        if (session) {
            session.addEventListener('selectstart', onSelectStart);
            session.addEventListener('selectend', onSelectEnd);
            
            // 监听inputsourceschange事件以支持transient-pointer输入
            session.addEventListener('inputsourceschange', (event) => {
                console.log('Input sources changed:', 
                    event.added.map(s => s.targetRayMode),
                    event.removed.map(s => s.targetRayMode));
                
                // 检查是否有新增的transient-pointer输入
                for (const source of event.added) {
                    if (source.targetRayMode === 'transient-pointer') {
                        console.log('检测到Vision Pro自然输入:', source);
                    }
                }
            });
            
            if (cameraInfoDisplay) {
                cameraInfoDisplay.setSessionActive(true);
            }
            
            // 添加帧循环处理回调
            // 这是关键部分：确保在每一帧都调用handleGestureDrag函数
            function onXRFrame(time: number, frame: XRFrame) {
                // 处理手势拖动
                handleGestureDrag(frame);
                
                // 请求下一帧
                session.requestAnimationFrame(onXRFrame);
            }
            
            // 启动XR帧循环
            session.requestAnimationFrame(onXRFrame);
        }
    };

    const onSessionEnd = () => {
        console.log('VR会话结束');
        
        const session = renderer.xr.getSession();
        if (session) {
            session.removeEventListener('selectstart', onSelectStart);
            session.removeEventListener('selectend', onSelectEnd);
            
            // 清理所有事件处理程序
            const handler = eventHandlers.get(session);
            if (handler) {
                session.removeEventListener('inputsourceschange', handler);
                eventHandlers.delete(session);
            }
        }
        
        isLongPress = false;
        initialGripPosition = null;
        
        if (longPressHandler !== null) {
            clearTimeout(longPressHandler);
            longPressHandler = null;
        }
        
        if (cameraInfoDisplay) {
            cameraInfoDisplay.setSessionActive(false);
            cameraInfoDisplay.setLongPressActive(false);
        }
    };

    // 初始化显示
    if (SHOW_CAMERA_POSITION) {
        createAndAddCameraInfoDisplay();
    }

    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);

    return {
        dispose: () => {
            console.log('Disposing VR controls');
            vrButton.remove();
            
            const session = renderer.xr.getSession();
            if (session) {
                session.removeEventListener('selectstart', onSelectStart);
                session.removeEventListener('selectend', onSelectEnd);
                
                // 清理所有事件处理程序
                const handler = eventHandlers.get(session);
                if (handler) {
                    session.removeEventListener('inputsourceschange', handler);
                    eventHandlers.delete(session);
                }
            }
            
            renderer.xr.removeEventListener('sessionstart', onSessionStart);
            renderer.xr.removeEventListener('sessionend', onSessionEnd);
            
            if (cameraInfoDisplay) {
                camera.remove(cameraInfoDisplay.getMesh());
            }
            
            if (longPressHandler !== null) {
                clearTimeout(longPressHandler);
            }
        },
        cameraGroupRef: cameraGroup,
        getUpdatedCameraGroupPosition: () => cameraGroup.position,
        getUpdatedCameraGroupRotation: () => cameraGroup.rotation,
        updateCameraGroupPosition: (position: THREE.Vector3) => {
            if (cameraInfoDisplay) {
                cameraInfoDisplay.setCameraGroupPosition(position);
            }
        },
        handleFrame: (frame: XRFrame) => {
            // 减少帧处理日志，只在需要时输出
            frameCounter++;
            const now = performance.now();
            if (now - lastLogTime > LOG_INTERVAL * 10) { // 增加日志间隔到10秒
                if (isLongPress) {
                    console.log(`帧处理中 - 已处理${frameCounter}帧，长按模式处于活动状态`);
                }
                lastLogTime = now;
                frameCounter = 0;
            }
        },
        isLongPressActive: () => isLongPress
    };
}
