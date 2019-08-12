/// <reference types="angular" />
import { IElementOffsetProvider } from './IElementOffsetProvider';
export declare class HorizontalElementOffsetProvider implements IElementOffsetProvider {
    getElementOffset($element: angular.IAugmentedJQuery): number;
}
