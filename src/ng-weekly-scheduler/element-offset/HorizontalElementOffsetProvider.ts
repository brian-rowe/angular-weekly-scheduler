import { IElementOffsetProvider } from './IElementOffsetProvider';

export class HorizontalElementOffsetProvider implements IElementOffsetProvider {
    public getElementOffset($element: angular.IAugmentedJQuery) {
        return $element[0].getBoundingClientRect().left;
    }
}
