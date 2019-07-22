import * as angular from 'angular';
import { AdapterService } from './AdapterService';

export default angular
    .module('rr.weeklyScheduler.adapter', [])
    .service(AdapterService.$name, AdapterService).name;
