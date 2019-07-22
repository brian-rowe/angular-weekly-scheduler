import * as angular from 'angular';
import { RevalidateDirective } from './RevalidateDirective';

export default angular
    .module('rr.weeklyScheduler.revalidate', [])
    .directive(RevalidateDirective.$name, RevalidateDirective.Factory())
    .name;
