// инфо панель игровой сцены

import * as PIXI from 'pixi.js';
import { app } from '../../app';
import { Scene } from '../../helpers/scene';
import { SpriteButton } from '../../helpers/button';
import { ScenesManager } from '../../helpers/scenesManager';
import { Gameplay } from './gamePlay';

// общий стиль текста
let textStyle:PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 30,
    fontWeight: 'bold',
    fill: '#555'
});

export class GameInfo extends PIXI.Container {
    private game:Gameplay; // ссылка на геймплей
    private elapsedSeconds:number = 0; // прошло секунд
    private timerId:number; // таймер
    private timerText:PIXI.Text; // текст прошедшего времени
    private flagText:PIXI.Text; // текст у флага
    
    constructor(game:Gameplay) {
        super();
        this.game = game;    
        this.position.set(app.view.width / 2, 100);
        
        // добавленеи текста прошедшего времени
        this.timerText = new PIXI.Text('', textStyle);
        this.timerText.anchor.set(0.5);
        this.updateTimerText();
        
        // добавление спрайта флажка
        let flag:PIXI.Sprite = PIXI.Sprite.from('flag.png');
        flag.position.set(-270, 0);
        flag.anchor.set(0.5);
        
        // добавление текста флажка
        this.flagText = new PIXI.Text('0', textStyle);
        this.flagText.position.set(-245, 0);
        this.flagText.anchor.set(0, 0.5);
        
        this.addChild(this.timerText, flag, this.flagText);  
        
        // подписка на изменение флагов и старт таймера
        this.game.on('flagsChanged', () => this.updateFlagText());
        this.timerId = window.setInterval(() => this.secondsTick(), 1000);
    }    
    
    public updateFlagText() { // вызывается если количество флагов изменилось
        this.flagText.text = (this.game.field.minesPlaced - this.game.field.flagsPlaced).toString();
    }
    updateTimerText() {  // вывод времени в формате 00:00:00
        let seconds:number = this.elapsedSeconds;
        let hours:number = Math.floor(seconds / 3600);
        let minutes:number = Math.floor((seconds - (hours * 3600)) / 60);
        seconds = seconds - (hours * 3600) - (minutes * 60);
        this.timerText.text = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
    secondsTick() { // вызывается таймером раз в секунду
        if (this.game.field.locked ||
            (this.game.field.minesPlaced < 1) ||
            (ScenesManager.currentScene !== this.game)) return;
        ++this.elapsedSeconds;        
        this.updateTimerText();
    }
    
    destroy() { // сброс таймера перед удалением
        super.destroy();
        clearInterval(this.timerId); 
    }
}  
