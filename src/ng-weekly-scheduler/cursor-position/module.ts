import * as angular from 'angular';
import { CursorPositionService } from './CursorPositionService';

export default angular
    .module('rr.weeklyScheduler.mousePosition', [])
    .service(CursorPositionService.$name, CursorPositionService)
    .name;
