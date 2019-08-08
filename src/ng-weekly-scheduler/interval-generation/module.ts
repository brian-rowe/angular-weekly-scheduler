import * as angular from 'angular';
import { IntervalGenerationService } from './IntervalGenerationService';

export default angular
    .module('rr.weeklyScheduler.intervalGeneration', [])
    .service(IntervalGenerationService.$name, IntervalGenerationService)
    .name;
