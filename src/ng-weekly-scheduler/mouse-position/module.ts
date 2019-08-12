import * as angular from 'angular';
import { MousePositionService } from './MousePositionService';

export default angular
    .module('rr.weeklyScheduler.mousePosition', [])
    .service(MousePositionService.$name, MousePositionService)
    .name;
