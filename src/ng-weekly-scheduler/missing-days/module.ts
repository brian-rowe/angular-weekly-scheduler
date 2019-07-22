import * as angular from 'angular';
import { MissingDaysService } from './MissingDaysService';

export default angular
    .module('rr.weeklyScheduler.missingDays', [])
    .service(MissingDaysService.$name, MissingDaysService)
    .name;
