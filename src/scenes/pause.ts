// сцена паузы, перекрывает геймплей

import { app } from '../app';
import { OverlayScene } from '../helpers/overlayScene';
import { ScenesManager } from '../helpers/scenesManager';
import { SpriteButton } from '../helpers/button';
import { MainMenu } from './mainMenu';
const PIXI = require('pixi.js');
require('pixi-tween');

export class Pause extends OverlayScene {
    private playButton:any;  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
    private homeButton:any;
    
    constructor() {
        super();

        // кнопка возврата в игру
        this.playButton = new SpriteButton('play2.png', () => this.playPressed());
        this.playButton.position.set(app.view.width / 2, app.view.height / 2);
        
        // кнопка домой
        this.homeButton = new SpriteButton('home.png', () => this.homePressed());
        this.homeButton.position.set(app.view.width / 2, app.view.height - 170);        
        
        // установка режима нажатия один раз и скейла для последующей анимации
        [ this.playButton, this.homeButton ].forEach((button:any) => {
            button.scale.set(0);
            button.clickOnce = true;
        });        
        
        this.addChild(this.playButton, this.homeButton);        
        this.startTweens();
    }    
    
    // анимация задника и кнопок вперед и назад, для входа и выхода из сцены
    startTweens(multiplier:number = 1, callback?:Function) {
        [ this.playButton, this.homeButton ].forEach((button:any, i:number) => {            
            let tween:any = PIXI.tweenManager.createTween(button.scale)  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
                .to({ x: 1 * multiplier, y: 1 * multiplier });
            Object.assign(tween, {
                time: 400,
                delay: 200 * i,
                easing: PIXI.tween.Easing.outBack(),
                expire: true
            });
            tween.start();
        });
        
        let tween:any = PIXI.tweenManager.createTween(this.snapshot)
            .to({ alpha: multiplier > 0 ? 0.4 : 1 });
        Object.assign(tween, {
            time: 400,
            expire: true
        });
        if (callback) tween.on('end', callback);
        tween.start();
    }   
    
    // коллбеки кнопок
    playPressed() {
        this.startTweens(0, ScenesManager.pop);
    }
    homePressed() {
        this.startTweens(0, () => ScenesManager.start(new MainMenu()));
    }
}