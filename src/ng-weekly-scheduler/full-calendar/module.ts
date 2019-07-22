import * as angular from 'angular';
import { FullCalendarDirective } from './FullCalendarDirective';

export default angular
    .module('rr.weeklyScheduler.fullCalendar', [])
    .directive(FullCalendarDirective.$name, FullCalendarDirective.Factory())
    .name;
