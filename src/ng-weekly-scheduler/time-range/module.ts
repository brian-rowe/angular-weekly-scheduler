import * as angular from 'angular';
import { TimeRangeComponent, TimeRangeController } from './TimeRangeComponent';

export default angular
    .module('rr.weeklyScheduler.timeRange', [])
    .component(TimeRangeComponent.$name, new TimeRangeComponent())
    .controller(TimeRangeController.$name, TimeRangeController)
    .name;
