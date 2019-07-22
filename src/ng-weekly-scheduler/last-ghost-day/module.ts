import * as angular from 'angular';
import { LastGhostDayService } from './LastGhostDayService';

export default angular
    .module('rr.weeklyScheduler.lastGhostDay', [])
    .service(LastGhostDayService.$name, LastGhostDayService)
    .name;
