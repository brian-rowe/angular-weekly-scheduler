import * as angular from 'angular';
import { MultiSliderComponent, MultiSliderController } from './multislider';

export default
    angular.module('rr.weeklyScheduler.multiSlider', [])
    .component(MultiSliderComponent.$name, new MultiSliderComponent())
    .controller(MultiSliderController.$name, MultiSliderController)
    .name;
