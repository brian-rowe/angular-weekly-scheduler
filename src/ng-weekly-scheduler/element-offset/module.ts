import * as angular from 'angular';
import { ElementOffsetProviderFactory } from './ElementOffsetProviderFactory';

export default angular
    .module('rr.weeklyScheduler.elementOffset', [])
    .service(ElementOffsetProviderFactory.$name, ElementOffsetProviderFactory)
    .name;
