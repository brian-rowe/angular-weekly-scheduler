import * as angular from 'angular';
import { HandleDirective } from './HandleDirective';
import { HandleProviderFactory } from './HandleProviderFactory';

export default angular
    .module('rr.weeklyScheduler.handle', [])
    .directive(HandleDirective.$name, HandleDirective.Factory())
    .service(HandleProviderFactory.$name, HandleProviderFactory)
    .name;
