import * as angular from 'angular';
import { HourTextService } from './HourTextService';

export default angular
    .module('rr.weeklyScheduler.hourText', [])
    .service(HourTextService.$name, HourTextService)
    .name;
