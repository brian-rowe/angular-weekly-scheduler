import * as angular from 'angular';
import { ScheduleCountDirective } from './ScheduleCountDirective';

export default angular
    .module('rr.weeklyScheduler.scheduleCount', [])
    .directive(ScheduleCountDirective.$name, ScheduleCountDirective.Factory())
    .name;
