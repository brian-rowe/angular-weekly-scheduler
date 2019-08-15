import * as angular from 'angular';
import { PixelToValProviderFactory } from './PixelToValProviderFactory';
import { PixelToValService } from './PixelToValService';

export default angular
    .module('rr.weeklyScheduler.pixelToVal', [])
    .service(PixelToValProviderFactory.$name, PixelToValProviderFactory)
    .service(PixelToValService.$name, PixelToValService)
    .name;
