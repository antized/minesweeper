// сцена-загрузчик ресурсов игры

import { Scene } from '../helpers/scene';
import { app } from '../app';
import * as PIXI from 'pixi.js';
import Sound from 'pixi-sound';
import { ScenesManager } from '../helpers/scenesManager';
import { MainMenu } from './mainMenu';

export class Loader extends Scene {
    private progressBar:PIXI.Graphics;
    
    constructor() {
        super();   
        
        // создаем полосу загрузки
        this.progressBar = new PIXI.Graphics()
            .beginFill(0x0, 0.5)
            .drawRect(0, 0, 100, 10)
            .endFill();
        this.progressBar.pivot.set(50, 5);
        this.progressBar.position.set(app.view.width / 2, app.view.height / 2 + 150);        
        this.addChild(this.progressBar);
        
        this.startLoading();
    }
    startLoading() {
        // загрузка ресурсов
        PIXI.Loader.shared
            .add('click', 'assets/audio/click.{mp3,ogg}')
            .add('click2', 'assets/audio/click2.{mp3,ogg}')
            .add('bombSound', 'assets/audio/bomb.{mp3,ogg}')
            .add('winSound', 'assets/audio/win.{mp3,ogg}')
            .add('assets/atlas.json')
            .on('progress', () => this.onProgress())
            .load(() => this.onComplete());
    }
    onProgress() { // обновление прогресс-бара
        this.progressBar
            .beginFill(0xCCCCCC)
            .drawRect(2, 2, app.loader.progress - 4, 6)
            .endFill();
    }
    onComplete() { // запуск следующей сцены
        ScenesManager.start(new MainMenu());
    }
}