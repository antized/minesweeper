// простой менеджер сцен
// поддерживает визуальные переходы между сценами и перекрытие на один уровень

import { Scene } from './scene';
import { app } from '../app';

export class ScenesManager {
    public static currentScene: Scene; // хранит текущую сцену
    public static overlayedScene: Scene; // хранит перекрытую сцену
    
    //  принудительный старт
    private static _start(scene:Scene, transition:boolean = true) {        
        app.stage.addChild(scene);
        if (transition) scene.transitionIn();
        ScenesManager.currentScene = scene;
    }
    
    //  основная функция
    public static start(scene:Scene) {           
        if (ScenesManager.overlayedScene) { //  подчищаем, если сцена была заменена из перекрытой сцены
            ScenesManager.overlayedScene.destroy();
            ScenesManager.overlayedScene = undefined;
        }
        if (ScenesManager.currentScene) { // анимируем и удаляем текущую сцену
            ScenesManager.currentScene.transitionOut()
                .on('end', () => {
                    ScenesManager.currentScene.destroy();
                    ScenesManager._start(scene);
                });
        } else { // и стартуем новую
            ScenesManager._start(scene);
        }        
    }
    
    // перекрытие сцен (см overlayScene)
    public static overlay(scene:Scene) {   
        if (!ScenesManager.currentScene) return;
        ScenesManager.overlayedScene = ScenesManager.currentScene;
        app.stage.removeChild(ScenesManager.currentScene);
        ScenesManager._start(scene, false);
    }
    // откат до перекрытия
    public static pop() {   
        if (!ScenesManager.overlayedScene) return;
        ScenesManager.currentScene.destroy();
        ScenesManager._start(ScenesManager.overlayedScene, false);
        ScenesManager.overlayedScene = undefined;
    }
}