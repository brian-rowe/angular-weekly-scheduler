import * as angular from 'angular';
import { MultisliderGridComponent } from './multislider-grid';

export default angular
    .module('rr.weeklyScheduler.multisliderGrid', [])
    .component(MultisliderGridComponent.$name, new MultisliderGridComponent())
    .name;
