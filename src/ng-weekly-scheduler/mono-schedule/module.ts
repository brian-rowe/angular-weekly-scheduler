import * as angular from 'angular';
import { MonoScheduleDirective } from './MonoScheduleDirective';

export default angular
    .module('rr.weeklyScheduler.monoSchedule', [])
    .directive(MonoScheduleDirective.$name, MonoScheduleDirective.Factory())
    .name;
