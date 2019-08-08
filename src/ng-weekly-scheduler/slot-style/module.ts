import * as angular from 'angular';
import { SlotStyleFactory } from './SlotStyleFactory';

export default angular
    .module('rr.weeklyScheduler.slotStyle', [])
    .service(SlotStyleFactory.$name, SlotStyleFactory)
    .name;
