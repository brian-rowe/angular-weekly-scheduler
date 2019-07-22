import * as angular from 'angular';
import { OverlapDirective } from './OverlapDirective';
import { OverlapService } from './OverlapService';

export default angular
    .module('rr.weeklyScheduler.overlap', [])
    .directive(OverlapDirective.$name, OverlapDirective.Factory())
    .service(OverlapService.$name, OverlapService)
    .name;
