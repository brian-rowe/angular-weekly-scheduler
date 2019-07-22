import * as angular from 'angular';
import { WeeklySchedulerItemFactory } from './WeeklySchedulerItemFactory';

export default angular
    .module('rr.weeklyScheduler.weeklySchedulerItem', [])
    .service(WeeklySchedulerItemFactory.$name, WeeklySchedulerItemFactory)
    .name;
