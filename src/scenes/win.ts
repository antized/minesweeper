// простая сцена победы, перекрывает геймплей
import { app } from '../app';
import { OverlayScene } from '../helpers/overlayScene';
import { ScenesManager } from '../helpers/scenesManager';
import { SpriteButton } from '../helpers/button';
import { MainMenu } from './mainMenu';
const PIXI = require('pixi.js');
require('pixi-tween');

// стиль заголовка
let titleStyle:PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 60,
    fontWeight: 'bold',
    fill: ['#aaff00', '#00ff00'],
    dropShadow: true,
    dropShadowDistance: 0,
    dropShadowBlur: 2
});

export class WinScene extends OverlayScene {
    private title:any;  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
    private homeButton:any;

    constructor() {
        super();

        // добавление заголовка
        this.title = new PIXI.Text('You win!', titleStyle);
        this.title.position.set(app.view.width / 2, app.view.height / 2);
        this.title.anchor.set(0.5);
        this.title.scale.set(0);

        // добавление кнопки домой
        this.homeButton = new SpriteButton('home.png', () => this.homePressed());
        this.homeButton.position.set(app.view.width / 2, app.view.height - 170); 
        this.homeButton.scale.set(0);
        this.homeButton.clickOnce = true;

        this.addChild(this.title, this.homeButton);        
        this.startTweens();
    }    

    // анимация задника, кнопоки и заголовка вперед и назад, для входа и выхода из сцены
    startTweens(multiplier:number = 1, callback?:Function) {
        [ this.homeButton, this.title ].forEach((button:any, i:number) => {            
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
            .to({ alpha: 0.4 * multiplier });
        Object.assign(tween, {
            time: 400,
            expire: true
        });
        if (callback) tween.on('end', callback);
        tween.start();
    }   

    homePressed() {
        this.startTweens(0, () => ScenesManager.start(new MainMenu()));
    }
}