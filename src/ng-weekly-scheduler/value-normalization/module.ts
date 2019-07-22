import * as angular from 'angular';
import { ValueNormalizationService } from './ValueNormalizationService';

export default angular
    .module('rr.weeklyScheduler.valueNormalization', [])
    .service(ValueNormalizationService.$name, ValueNormalizationService)
    .name;
