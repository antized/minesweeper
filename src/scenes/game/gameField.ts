// игровое поле

import Sound from 'pixi-sound';
import { app } from '../../app';
import { Scene } from '../../helpers/scene';
import { SpriteButton } from '../../helpers/button';
import { Gameplay } from './gamePlay';
import { GameCell } from './gameCell';
const PIXI = require('pixi.js');
require('pixi-tween');

export class GameField extends PIXI.Container {
    public game:Gameplay;
    public fieldWidth:number = 570; // ширина поля в пикселях
    public columns:number; // ширина поля в квадратах
    public rows:number; // высота поля в квадратах
    public totalMines:number; // количество мин для установки
    public minesPlaced:number = 0; // количество установленных мин
    public flagsPlaced:number = 0; // количество установленных флагов
    private cells:GameCell[] = []; // массив ячеек
    public cellSize:number; // вычисляемый размер ячейки (ячейки скейлятся под ширину поля)
    public locked:boolean = true;  // блокировка тапов/кликов  
    
    constructor(game:Gameplay) {
        super();
        this.game = game;    
        this.position.set(app.view.width / 2 - this.fieldWidth / 2, 200); // установка положения
        
        // задаем случайные размеры поля и количество мин
        let size:number = Math.floor(Math.random() * 10) + 10; // поле от 10х10 до 20х20
        this.columns = this.rows = size;
        this.totalMines = size * 2; // 20 мин при 10х10, и 40 при 20х20
        this.cellSize = this.fieldWidth / this.columns; // вычисляем размер ячейки
        
        // создание ячеек-квадратов
        for (let y:number = 0; y < this.rows; ++y)
            for (let x:number = 0; x < this.columns; ++x) {
                let cell:GameCell = new GameCell(this, x, y);   
                this.cells[cell.cellIndex] = cell;
                this.addChild(cell);
            }
    }   
    
    // анимация появления поля
    public show() {
        this.cells.forEach((cell:GameCell) => {
            let tween:any = PIXI.tweenManager.createTween(cell)  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
                .to({ alpha:1 });
            Object.assign(tween, {
                time: 300,
                delay: Scene.transitionTime + Math.random() * 500,
                expire: true
            });
            tween.start();
        });        
        setTimeout(() => this.locked = false, 500); // разблокировка поля, можно кликать
    }
    
    // возвращает индекс ячейки в массиве cells
    public getCellIndex(x:number, y:number) {
        return y * this.columns + x;
    }
    // возвращает ячейку в заданных координатах, если возможно
    public getCell(x:number, y:number):GameCell {
        if ((x < 0) || (x >= this.columns)) return;
        if ((y < 0) || (y >= this.rows)) return;
        return this.cells[this.getCellIndex(x, y)];
    }
    
    // добавление мин при первом клике
    private generateMines(excludeCell:GameCell) {
        let excludeArea:GameCell[] = [excludeCell].concat(excludeCell.get8Neighbours()); // клетка по которой клинули и ее соседи для исключения
        do {
            let rnd:number = Math.floor(Math.random() * this.columns * this.rows),        // выбираем разномную ячейку
                cell:GameCell = this.cells[rnd];
            if (!cell.hasMine && !excludeArea.includes(cell)) {        // если мины нет и не в списке исключения
                cell.hasMine = true;        // ставим мину
                cell.get8Neighbours().forEach(neighbour => ++neighbour.minesAround);   // меняем у рядом стоящих цифру             
                ++this.minesPlaced;        // увеличиваем счетчик
            }        
        } while (this.minesPlaced < this.totalMines);        // повторяем пока все не поставим
        this.game.emit('flagsChanged'); // вызываем событие для обновления цифры флагов сверху
    }
    
    // логика нажатия на клетку игрового поля
    public cellPressed(cell:GameCell, event:PIXI.interaction.InteractionEvent, pressedMs:number) {
        if (this.locked) return; // если залочено выходим
        let longTouch = event.data.originalEvent.which === 3; // правая кнопка мыши
        if ((event.data.pointerType === 'touch') && (pressedMs > 500)) longTouch = true; // долгое нажатие
            
        if (longTouch) { // правая кнопка мыши или долгое нажатие
            cell.switchFlag(); // пробуем добавить или убрать флаг
        } else { // обычный тап/клик
            if (this.minesPlaced < 1) this.generateMines(cell); // если первый тап - устанавливаем мины
            if (!cell.opened) { // затем открываем
                cell.openChained(); // открываем кучей 
                this.checkWin(); // проверяем победу
            }
        }        
    }
    
    // проверка победы
    public checkWin() {
        if (!this.cells.find((cell:GameCell) => !cell.hasMine && !cell.opened))
            this.showWin();
    }    
    public showWin() {
        this.locked = true;
        Sound.play('winSound');
        setTimeout(() => this.game.win(), 500);
    }
    // анимация в случае поражения
    public showDefeat() {
        this.locked = true;
        Sound.play('bombSound');
        let x:number = this.position.x,
            y:number = this.position.y;
        this.position.set(x + (Math.random() > 0.5 ? 1 : -1) * 30, y + (Math.random() > 0.5 ? 1 : -1) * 30);
        let tween:any = PIXI.tweenManager.createTween(this.position)  // приходится использовать any из-за подключения PIXI через require (из-за pixi-tween и хака)
            .to({ x:x, y:y });
        Object.assign(tween, {
            time: 1000,
            easing: PIXI.tween.Easing.outElastic(0.05, 0.1),
            expire: true
        });
        tween.on('end', () => this.showAllMines());
        tween.start();
    }    
    public showAllMines() {
        this.cells
            .filter((cell:GameCell) => cell.hasMine)
            .forEach((cell:GameCell) => {
                if (!cell.opened) cell.open();
            });
        setTimeout(() => this.game.defeat(), 500);
    }
}  
