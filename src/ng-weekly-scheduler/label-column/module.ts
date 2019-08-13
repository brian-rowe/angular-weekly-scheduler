import * as angular from 'angular';
import { LabelColumnComponent } from './LabelColumnComponent';

export default angular
    .module('rr.weeklyScheduler.labelColumn', [])
    .component(LabelColumnComponent.$name, new LabelColumnComponent())
    .name;
