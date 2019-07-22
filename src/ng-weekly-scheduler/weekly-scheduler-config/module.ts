import * as angular from 'angular';
import { DayMap } from './DayMap';
import { NullEndWidth } from './NullEndWidth';

export default angular
    .module('rr.weeklyScheduler.weeklySchedulerConfig', [])
    .constant(DayMap.$name, DayMap.value)
    .constant(NullEndWidth.$name, NullEndWidth.value)
    .name;
