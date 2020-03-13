// сцена, в качестве бэкграунда использующая скриншот предыдущей активной сцены

import { Scene } from './scene';
import { ScenesManager } from './scenesManager';
import { app } from '../app';

export class OverlayScene extends Scene {
    protected snapshot: PIXI.Sprite;
    
    constructor() {
        super();
        
        // создание скриншота
        let snapshot:any = PIXI.RenderTexture.create({ width: app.view.width, height: app.view.height });    // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)      
        app.renderer.render(ScenesManager.currentScene, snapshot);
        this.snapshot = new PIXI.Sprite(snapshot);
        this.addChild(this.snapshot);
    }
}