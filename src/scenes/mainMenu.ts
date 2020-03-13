// сцена - главное меню

import { app } from '../app';
import { Scene } from '../helpers/scene';
import { ScenesManager } from '../helpers/scenesManager';
import { SpriteButton } from '../helpers/button';
import { Gameplay } from './game/gamePlay';
const PIXI = require('pixi.js');
require('pixi-tween');

// стиль текста для заголовка
let titleStyle:PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 60,
    fontWeight: 'bold',
    fill: ['#eee', '#aaa'],
    dropShadow: true,
    dropShadowDistance: 0,
    dropShadowBlur: 2
});

export class MainMenu extends Scene {
    public playButton:SpriteButton;
    
    constructor() {
        super();
        
        // добавление центральной кнопки
        this.playButton = new SpriteButton('play.png', () => ScenesManager.start(new Gameplay()));
        this.playButton.position.set(app.view.width / 2, app.view.height / 2 + 50);         
        this.playButton.scale.set(0);
        this.playButton.interactive = false;
        this.playButton.clickOnce = true;

        // добавление заголовка
        const title = new PIXI.Text('Minesweeper', titleStyle);
        title.position.set(app.view.width / 2, 200);
        title.anchor.set(0.5);

        this.addChild(this.playButton, title);        
    }    
    
    // анимация кнопки после перехода на сцену
    transitionDone() {
        let tween:any = PIXI.tweenManager.createTween(this.playButton.scale)
            .to({ x: 1, y: 1 });
        Object.assign(tween, {
            time: 500,
            easing: PIXI.tween.Easing.outBack(),
            expire: true
        });
        tween.on('end', () => this.playButton.interactive = true);
        tween.start();
    }
}