import * as angular from 'angular';
import { DayGridDirective } from './DayGridDirective';

export default angular
    .module('rr.weeklyScheduler.dayGrid', [])
    .directive(DayGridDirective.$name, DayGridDirective.Factory())
    .name;
