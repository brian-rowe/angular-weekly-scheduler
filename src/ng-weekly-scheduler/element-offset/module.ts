import * as angular from 'angular';
import { ElementOffsetService } from './ElementOffsetService';

export default angular
    .module('rr.weeklyScheduler.elementOffset', [])
    .service(ElementOffsetService.$name, ElementOffsetService)
    .name;
