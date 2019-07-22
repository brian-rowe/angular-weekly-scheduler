import * as angular from 'angular';
import { RestrictionExplanationsComponent, RestrictionExplanationsController } from './RestrictionExplanationsComponent';

export default angular
    .module('rr.weeklyScheduler.restrictionExplanations', [])
    .component(RestrictionExplanationsComponent.$name, new RestrictionExplanationsComponent())
    .controller(RestrictionExplanationsController.$name, RestrictionExplanationsController)
    .name;
