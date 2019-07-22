import * as angular from 'angular';
import { ZoomService } from './ZoomService';

export default angular
    .module('rr.weeklyScheduler.zoom', [])
    .service(ZoomService.$name, ZoomService)
    .name;
