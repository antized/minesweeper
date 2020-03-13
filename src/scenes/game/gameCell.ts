// клетка-ячейка игрового поля

import Sound from 'pixi-sound';
import { app } from '../../app';
import { Scene } from '../../helpers/scene';
import { SpriteButton } from '../../helpers/button';
import { Gameplay } from './gamePlay';
import { GameField } from './gameField';
const PIXI = require('pixi.js');
require('pixi-tween');

// стиль текста в ячейке
let cellTextStyle:PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fontWeight: 'bold'
});
// цвета текста в ячейке
let cellTextColors:string[] = [ '#2D77D0', '#408F41', '#CF4745' ];

// интерфейс для хранения смещений
interface IPoint {
    x: number;
    y: number;
}
// смещения для 4 соседей (без диагоналей)
let neighbours4_coords:Array<IPoint> = [
    { x:-1, y:0 },
    { x:1, y:0 },
    { x:0, y:-1 },
    { x:0, y:1 }
];
// смещения для 8 соседей
let neighbours8_coords:Array<IPoint> = neighbours4_coords.concat([
    { x:1, y:1 },
    { x:-1, y:-1 },
    { x:1, y:-1 },
    { x:-1, y:1 }
]);

// простой статический класс для рекурсивного выбора пустых ячеек, используется после клика
class CellsSelector {
    public static candidates:Array<GameCell>;    
    
    public static select(cell:GameCell, clearCandidates:boolean = true) {
        if (clearCandidates) CellsSelector.candidates = []; // при дефолтном вызове очищаем список
        if (cell.hasMine) return CellsSelector.candidates; // если мина сразу выходим
        CellsSelector.candidates.push(cell); // добавляем в список
        if (!cell.minesAround) // если ячейка без цифры
            cell.get4Neighbours().forEach(neighbour => { // берем 4 соседей (без диагоналей)
                if (!neighbour.hasMine && !cell.minesAround && !CellsSelector.candidates.includes(neighbour)) CellsSelector.select(neighbour, false); // если нет мин, цифр и уже не в списке вызываем рекурсивно
            });
        return CellsSelector.candidates; // финальный возврат списка
    }
}

export class GameCell extends PIXI.Container {
    private field:GameField; // ссылка на поле
    public sprite:PIXI.Sprite; // основной спрайт
    public flag:PIXI.Sprite; // флаг (пока пустой)
    public text:PIXI.Text; // цифры рядом стоящих мин
    public opened:boolean = false; // открыта или нет
    public hasMine:boolean = false; // с миной или нет
    public minesAround:number = 0; // цифра рядом стоящих мин
    private pointerDownTimestamp:number; // время начала тапа для длинного нажатия

    constructor(field:GameField, x:number, y:number) {
        super();        
        Object.assign(this, {
            field: field,  // ссылка на поле
            cellX: x, // х ячейки
            cellY: y, // y ячейки
            cellIndex: field.getCellIndex(x, y), // индекс в массиве поля
            alpha: 0 // прозрачность для эффекта появления
        });
        this.odd = (x + y) % 2 === 1; // нечетный или нет

        // добавление кликабельного спрайта и его события
        this.sprite = PIXI.Sprite.from(this.odd ? 'cell_closed1.png' : 'cell_closed2.png');
        Object.assign(this.sprite, {
            interactive: true,
            buttonMode: true
        });
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(field.cellSize / this.sprite.width); 
        this.sprite.on('pointerdown', () => this.pointerDownTimestamp = Date.now());
        this.sprite.on('pointerup', (event:PIXI.interaction.InteractionEvent) => this.field.cellPressed(this, event, Date.now() - this.pointerDownTimestamp));
        this.sprite.on('pointerover', () => this.sprite.tint = 0xEFFFEF);
        this.sprite.on('pointerout', () => this.sprite.tint = 0xFFFFFF);

        // добавление текста в ячейке
        let textStyle:PIXI.TextStyle = Object.assign({}, cellTextStyle);
        this.text = new PIXI.Text('', textStyle);
        this.text.scale.set(this.sprite.scale.x);
        this.text.anchor.set(0.5);

        this.addChild(this.sprite, this.text);
        this.position.set(field.cellSize*x + field.cellSize/2, field.cellSize*y); // задаем координаты
    }    

    // общая функция получения соседей
    private getNeighbours(coords:Array<IPoint>):Array<GameCell> {
        let neighbours:Array<GameCell> = [];
        for (let coord of coords) {
            let cell:GameCell = this.field.getCell(this.cellX + coord.x, this.cellY + coord.y);
            if (cell) neighbours.push(cell);
        }        
        return neighbours;
    }
    // получение 4 соседей (без диагональных)
    public get4Neighbours():Array<GameCell> {        
        return this.getNeighbours(neighbours4_coords);
    }
    // получение 8 соседей
    public get8Neighbours():Array<GameCell> {        
        return this.getNeighbours(neighbours8_coords);
    }

    // открытие закрытой ячейки
    public open() {
        this.openTween(); 
        this.opened = true;
        let name:string = this.odd ? 'cell_opened1.png' : 'cell_opened2.png';
        if (this.hasMine) {
            name = 'cell_bomb.png';
        } else {
            if (this.minesAround > 0) {                
                this.text.text = this.minesAround.toString();
                let colorIndex:number = this.minesAround - 1;
                if (colorIndex >= cellTextColors.length) colorIndex = cellTextColors.length - 1;
                this.text.style.fill = cellTextColors[colorIndex];
            }
        }        
        this.sprite.texture = PIXI.Texture.from(name);    
        if (this.flag) this.destroyFlag();
    }
    // открытие группой
    public openChained() {
        if (this.hasMine) {
            this.open();
            this.field.showDefeat();
        } else {
            let candidates:Array<GameCell> = CellsSelector.select(this);
            candidates.forEach(cell => cell.open());   
            Sound.play('click2');            
        }
    }
    
    // проверка возможности установить флаг
    public canSetFlag() {
        if (this.opened) return false;
        if (this.field.flagsPlaced >= this.field.minesPlaced) return false;
        return true;
    }
    // вкл/выкл флаг, вызываемая по клику
    public switchFlag() {        
        Sound.play('click2');
        if (this.flag) {
            this.tweenFlag(true);            
        } else {
            if (this.canSetFlag()) this.addFlag();
        }
    }
    // поставить флаг
    public addFlag() {
        this.flag = PIXI.Sprite.from('flag.png');
        this.flag.anchor.set(0.5);
        this.flag.scale.set();
        this.flag.scale.set(4);
        this.flag.alpha = 0;
        this.addChild(this.flag);
        this.tweenFlag(); 
        ++this.field.flagsPlaced;
        this.field.game.emit('flagsChanged');
    }
    // убрать флаг
    public destroyFlag() {
        if (!this.flag) return;
        this.flag.destroy();
        this.flag = undefined;
        --this.field.flagsPlaced;
        this.field.game.emit('flagsChanged');
    }
    // анимация флага
    tweenFlag(destroy?:boolean) {
        let tween1:any = PIXI.tweenManager.createTween(this.flag)  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
            .to({ alpha: destroy ? 0 : 1 });
        let tween2:any = PIXI.tweenManager.createTween(this.flag.scale)
            .to(destroy ? { x: 4, y: 4 } : { x: this.sprite.scale.x, y: this.sprite.scale.y });
        let params:Object = {
            time: 300,
            expire: true
        };
        Object.assign(tween1, params);
        Object.assign(tween2, params);
        if (destroy) tween1.on('end', () => this.destroyFlag());
        tween1.start();
        tween2.start();
    }
    
    // анимация открытия ячейки
    openTween() {        
        let sprite:PIXI.Sprite = new PIXI.Sprite(this.sprite.texture); // добавляем картинку текущей закрытой ячейки
        sprite.position.set(this.position.x, this.position.y);
        sprite.anchor.set(0.5);
        this.field.addChild(sprite);
        
        let tween1:any = PIXI.tweenManager.createTween(sprite.position)  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
            .to({ x:this.position.x + Math.random() * 200 - 100, y:this.position.y + Math.random() * 200 - 100 });
        let tween2:any = PIXI.tweenManager.createTween(sprite)
            .to({ alpha:0 });
        let params:Object = {
            time: 500,
            expire: true
        };
        Object.assign(tween1, params);
        Object.assign(tween2, params);
        tween2.on('end', sprite.destroy, sprite); // удаляем по окончании
        tween1.start();
        tween2.start();
    }
}
