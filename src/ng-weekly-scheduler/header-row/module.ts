import * as angular from 'angular';
import { HeaderRowComponent } from './HeaderRowComponent';

export default angular
    .module('rr.weeklyScheduler.headerRow', [])
    .component(HeaderRowComponent.$name, new HeaderRowComponent())
    .name;
