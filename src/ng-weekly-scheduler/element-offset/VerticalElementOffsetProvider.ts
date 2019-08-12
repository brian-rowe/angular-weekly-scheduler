import { IElementOffsetProvider } from './IElementOffsetProvider';

export class VerticalElementOffsetProvider implements IElementOffsetProvider {
    public getElementOffset($element: angular.IAugmentedJQuery) {
        return $element[0].getBoundingClientRect().top;
    }
}
