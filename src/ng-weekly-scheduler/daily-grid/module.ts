import * as angular from 'angular';
import { DailyGridDirective } from './DailyGridDirective';

export default angular
    .module('rr.weeklyScheduler.dailyGrid', [])
    .directive(DailyGridDirective.$name, DailyGridDirective.Factory())
    .name;
