import * as angular from 'angular';
import { HourGridDirective } from './HourGridDirective';

export default angular
    .module('rr.weeklyScheduler.hourGrid', [])
    .directive(HourGridDirective.$name, HourGridDirective.Factory())
    .name;
