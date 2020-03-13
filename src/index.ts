// инициализация pixi
import { app } from './app';

// запуск первой сцены
import { ScenesManager } from './helpers/scenesManager';
import { Loader } from './scenes/loader';
ScenesManager.start(new Loader());