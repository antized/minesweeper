const PIXI = require('pixi.js');
window.PIXI = PIXI; // хак для работы pixi-tween (не умеет работать с pixi v5)
require('pixi-tween');

// инициализация pixi
let config = {
        backgroundColor: 0xffffff,
        width: 600,
        height: 960
    },
    div:HTMLElement,
    app:PIXI.Application = new PIXI.Application(config);

// обновление твинов глобально
app.ticker.add(() => PIXI.tweenManager.update());
// запрет контекстного меню
window.addEventListener('contextmenu', e => e.preventDefault());


window.onload = () => {
    div = document.getElementById('scene');
    div.appendChild(app.view);
    document.body.className = ''; // удаляем гифку загрузки
    div.style.visibility = 'visible'; // показываем игру (скрыта для видимости гифки)
    window.scrollTo(0, navigator.userAgent.toLowerCase().indexOf('android') > -1 ? 1 : 0); // скрываем панель с аресом на мобилках
    
    window.addEventListener('resize', onResize); // подписка на изменение размеров (в том числе поворот)
    onResize();
}

// функция центрирования, растягивания и изменения размера игры
// старается заполнить весь экран но не менять размеров игры из конфига
let onResize = () => {
    let winWidth:number = window.innerWidth,
        winHeight:number = window.innerHeight,
        winRatio:number = Math.max(winWidth, winHeight) / Math.min(winWidth, winHeight),
        width:number = config.width,
        height:number = config.height,
        ratio:number = Math.max(width, height) / Math.min(width, height);
    
    // немного увеличиваем высоту игры для более узких экранов, чтобы покрыть весь экран на мобилках (но не меняем ширину)
    if ((winWidth < winHeight) && (winRatio > ratio)) height = width * winRatio;
    
    app.renderer.resize(width, height);    
    let scale:number = window.innerHeight / height;
    div.style.transform = `translate3d(-50%, -50%, 0) scale(${scale})`;
};

export { app };