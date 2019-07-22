import * as angular from 'angular';
import { EndAdjusterService } from './EndAdjusterService';

export default angular
    .module('rr.weeklyScheduler.endAdjuster', [])
    .service(EndAdjusterService.$name, EndAdjusterService)
    .name;
