import * as angular from 'angular';
import { MinimumSeparationDirective } from './MinimumSeparationDirective';

export default angular
    .module('rr.weeklyScheduler.minimumSeparation', [])
    .directive(MinimumSeparationDirective.$name, MinimumSeparationDirective.Factory())
    .name;
