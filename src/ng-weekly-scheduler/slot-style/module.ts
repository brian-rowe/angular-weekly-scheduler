import * as angular from 'angular';
import { SlotStyleFactory } from './SlotStyleFactory';
import { SlotStyleService } from './SlotStyleService';

export default angular
    .module('rr.weeklyScheduler.slotStyle', [])
    .service(SlotStyleFactory.$name, SlotStyleFactory)
    .service(SlotStyleService.$name, SlotStyleService)
    .name;
