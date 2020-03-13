// простая сцена с реализацией переходов

import { Container } from 'pixi.js';
import { app } from '../app';
const PIXI = require('pixi.js');
require('pixi-tween');

export class Scene extends Container {
    public static transitionTime:number = 400;

    constructor() {
        super();
    }
    
    public fadeTo(alpha:number = 1):any {  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
        let tween:any = PIXI.tweenManager.createTween(this)
            .to({ alpha:alpha });
        tween.time = Scene.transitionTime;
        tween.expire = true;
        tween.start();
        return tween;
    }
    
    public transitionIn():any {
        this.alpha = 0;
        return this.fadeTo(1)
            .on('end', this.transitionDone, this);
    }
    public transitionOut():any {
        return this.fadeTo(0);                      
    }
    transitionDone() {}
}