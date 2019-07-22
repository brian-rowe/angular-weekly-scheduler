import * as angular from 'angular';
import { MaxTimeSlotDirective } from './MaxTimeSlotDirective';

export default angular
    .module('rr.weeklyScheduler.maxTimeSlot', [])
    .directive(MaxTimeSlotDirective.$name, MaxTimeSlotDirective.Factory())
    .name;
