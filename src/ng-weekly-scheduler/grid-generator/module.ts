import * as angular from 'angular';
import { GridGeneratorService } from './GridGeneratorService';

export default angular
    .module('rr.weeklyScheduler.gridGenerator', [])
    .service(GridGeneratorService.$name, GridGeneratorService)
    .name;
