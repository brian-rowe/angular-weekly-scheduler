import * as angular from 'angular';
import { CursorPositionService } from './CursorPositionService';

export default angular
    .module('rr.weeklyScheduler.cursorPosition', [])
    .service(CursorPositionService.$name, CursorPositionService)
    .name;
