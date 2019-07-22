import * as angular from 'angular';
import { HourlyGridDirective } from './HourlyGridDirective';

export default angular
    .module('rr.weeklyScheduler.hourlyGrid', [])
    .directive(HourlyGridDirective.$name, HourlyGridDirective.Factory())
    .name;
