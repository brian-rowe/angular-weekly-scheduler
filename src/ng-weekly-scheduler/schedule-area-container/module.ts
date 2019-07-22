import * as angular from 'angular';
import { ScheduleAreaContainerComponent, ScheduleAreaContainerController } from './schedule-area-container';

export default angular
    .module('rr.weeklyScheduler', [])
    .component(ScheduleAreaContainerComponent.$name, new ScheduleAreaContainerComponent())
    .controller(ScheduleAreaContainerController.$name, ScheduleAreaContainerController)
    .name;
