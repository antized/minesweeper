// сцена - геймплей
import * as PIXI from 'pixi.js';
import { app } from '../../app';
import { Scene } from '../../helpers/scene';
import { ScenesManager } from '../../helpers/scenesManager';
import { SpriteButton } from '../../helpers/button';
import { Pause } from '../pause';
import { GameField } from './gameField';
import { GameInfo } from './gameInfo';
import { WinScene } from '../win';
import { DefeatScene } from '../defeat';

export class Gameplay extends Scene {
    public field:GameField; 
    public info:GameInfo;
    
    constructor() {
        super();        
        
        this.field = new GameField(this); // добавление игрового поля
        this.info = new GameInfo(this); // добавление информации сверху
        
        // добавление остального UI
        // добавление кнопки паузы
        let pauseButton:any = new SpriteButton('pause.png', () => ScenesManager.overlay(new Pause()));  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
        pauseButton.position.set(app.view.width - 70, app.view.height - 70);        
        // добавление текста-подсказки снизу
        let flagLabel:PIXI.Text = new PIXI.Text('Use long tap for set a flag', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 27,
            fill: '#999'
        }));
        flagLabel.position.set(50, app.view.height - 70);
        flagLabel.anchor.set(0, 0.5);

        this.addChild(this.field, this.info, flagLabel, pauseButton);
    }    
    
    transitionDone() { 
        this.field.show(); // после анимации перехода показываем анимацию поля
    }
    
    // вызов экранов поражения и победы
    public win() {
        ScenesManager.overlay(new WinScene());
    }
    public defeat() {
        ScenesManager.overlay(new DefeatScene());
    }
    
    // вызов destroy инфо-панели
    destroy() {
        super.destroy();
        this.info.destroy();
    }
}