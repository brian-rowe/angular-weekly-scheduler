import * as angular from 'angular';
import { PurgeDefaultService } from './PurgeDefaultService';

export default angular
    .module('rr.weeklyScheduler.purgeDefault', [])
    .service(PurgeDefaultService.$name, PurgeDefaultService)
    .name;
