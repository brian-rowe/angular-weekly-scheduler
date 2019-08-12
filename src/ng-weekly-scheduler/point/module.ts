import * as angular from 'angular';
import { PointProviderFactory } from './PointProviderFactory';

export default angular
    .module('rr.weeklyScheduler.point', [])
    .service(PointProviderFactory.$name, PointProviderFactory)
    .name;
