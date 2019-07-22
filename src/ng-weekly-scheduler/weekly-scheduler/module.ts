import * as angular from 'angular';
import { WeeklySchedulerComponent, WeeklySchedulerController } from './weekly-scheduler';

export default angular
    .module('rr.weeklyScheduler.weeklyScheduler', [])
    .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent())
    .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
    .name;
