// простая картинка-кнопка, центрирована и с анимацией
// поддерживает режим нажатия лишь единожды для предотвращение закликивания

import Sound from 'pixi-sound';
const PIXI = require('pixi.js');
require('pixi-tween');

export class SpriteButton extends PIXI.Sprite {
    protected callback:Function;
    protected context:Object;
    protected clickScale:number = 0.9;
    public clickOnce:boolean = false;
    
    constructor(key:string, callback?:Function, context?:Object) {
        super(PIXI.Texture.from(key));
        this.anchor.set(0.5);
        Object.assign(this, {
            callback: callback,
            context: context,
            interactive: true,
            buttonMode: true
        });                
        
        this.on('pointerup', () => {            
            Sound.play('click');            // звук клика
            if (this.clickOnce) this.interactive = false;          // блокировка, если режим нажатия один раз   
            if (this.callback) this.callback.call(this.context);  // вызов коллбека
            
            // анимация
            if (this.scale.x !== this.clickScale) {
                this.scale.set(this.clickScale);
                
                let tween:any = PIXI.tweenManager.createTween(this.scale) // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
                    .to({ x: 1, y: 1 });
                tween.time = 300;
                tween.expire = true;
                tween.start();
            }
        });
    }
}