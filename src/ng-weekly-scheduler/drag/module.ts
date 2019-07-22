import * as angular from 'angular';
import { DragService } from './DragService';

export default angular
    .module('rr.weeklyScheduler.drag', [])
    .service(DragService.$name, DragService)
    .name;
