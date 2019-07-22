import * as angular from 'angular';
import { ConfigurationService } from './ConfigurationService';

export default angular
    .module('rr.weeklyScheduler.configuration', [])
    .service(ConfigurationService.$name, ConfigurationService)
    .name;
