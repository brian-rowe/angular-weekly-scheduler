import * as angular from 'angular';
import AppModule from '../app/module';
import { DemoController } from './DemoController';

export default angular
    .module('rr.weeklyScheduler.demo', [AppModule])
    .controller(DemoController.$name, DemoController)
    .name;