import * as angular from 'angular';
import { ConflictingOptionsService } from './ConflictingOptionsService';

export default angular
    .module('rr.weeklyScheduler.conflictingOptions', [])
    .service(ConflictingOptionsService.$name, ConflictingOptionsService)
    .name;
