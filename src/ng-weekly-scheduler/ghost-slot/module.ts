import * as angular from 'angular';
import { GhostSlotComponent, GhostSlotController } from './ghost-slot';

export default angular
    .module('rr.weeklyScheduler.ghostSlot', [])
    .component(GhostSlotComponent.$name, new GhostSlotComponent())
    .controller(GhostSlotController.$name, GhostSlotController)
    .name;
