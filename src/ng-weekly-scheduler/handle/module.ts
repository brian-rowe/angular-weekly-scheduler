import * as angular from 'angular';
import { HandleDirective } from './HandleDirective';

export default angular
    .module('rr.weeklyScheduler.handle', [])
    .directive(HandleDirective.$name, HandleDirective.Factory())
    .name;
