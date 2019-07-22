import * as angular from 'angular';
import { WeeklySlotComponent, WeeklySlotController } from './weekly-slot';

export default angular
    .module('rr.weeklyScheduler.weeklySlot', [])
    .component(WeeklySlotComponent.$name, new WeeklySlotComponent())
    .controller(WeeklySlotController.$name, WeeklySlotController)
    .name;
