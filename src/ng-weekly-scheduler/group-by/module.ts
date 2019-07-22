import * as angular from 'angular';
import { GroupService } from './GroupService';

export default angular
    .module('rr.weeklyScheduler.groupBy', [])
    .service(GroupService.$name, GroupService)
    .name;
