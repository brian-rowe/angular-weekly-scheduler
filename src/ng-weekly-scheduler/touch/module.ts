import * as angular from 'angular';
import { TouchService } from './TouchService';

export default angular
    .module('rr.weeklyScheduler.touch', [])
    .service(TouchService.$name, TouchService)
    .name;
