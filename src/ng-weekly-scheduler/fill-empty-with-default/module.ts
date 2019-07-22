import * as angular from 'angular';
import { FillEmptyWithDefaultService } from './FillEmptyWithDefaultService';

export default angular
    .module('rr.weeklyScheduler.fillEmptyWithDefault', [])
    .service(FillEmptyWithDefaultService.$name, FillEmptyWithDefaultService)
    .name;
