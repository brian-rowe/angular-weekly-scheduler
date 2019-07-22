import * as angular from 'angular';
import { NullEndDirective } from './NullEndDirective';

export default angular
    .module('rr.weeklyScheduler.nullEnd', [])
    .directive(NullEndDirective.$name, NullEndDirective.Factory())
    .name;
