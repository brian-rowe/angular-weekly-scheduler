import * as angular from 'angular';
import { WeeklySchedulerRangeFactory } from './WeeklySchedulerRangeFactory';

export default angular
    .module('rr.weeklyScheduler.weeklySchedulerRange', [])
    .service(WeeklySchedulerRangeFactory.$name, WeeklySchedulerRangeFactory)
    .name;
