import * as angular from 'angular';
import { ResizeServiceProvider } from './ResizeService';
import { IResizeService } from './IResizeService';

export default angular
    .module('rr.weeklyScheduler.resize', [])
    .provider(ResizeServiceProvider.$name, ResizeServiceProvider)
    .run([ResizeServiceProvider.$name, (resizeService: IResizeService) => resizeService.initialize()])
    .name;
