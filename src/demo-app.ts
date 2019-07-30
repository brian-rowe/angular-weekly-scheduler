import * as angular from 'angular'
import DemoModule from './ng-weekly-scheduler/demo/module';

angular.module('demoApp', [DemoModule]);

angular.element(document).ready(() => {
  angular.bootstrap(document, ['demoApp']);
});
