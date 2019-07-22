import * as angular from 'angular';
import { ScrollService } from './ScrollService';

export default angular
    .module('rr.weeklyScheduler.scroll', [])
    .service(ScrollService.$name, ScrollService)
    .name;
