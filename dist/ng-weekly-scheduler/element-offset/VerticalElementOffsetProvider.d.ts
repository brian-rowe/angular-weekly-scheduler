/// <reference types="angular" />
import { IElementOffsetProvider } from './IElementOffsetProvider';
export declare class VerticalElementOffsetProvider implements IElementOffsetProvider {
    getElementOffset($element: angular.IAugmentedJQuery): number;
}
