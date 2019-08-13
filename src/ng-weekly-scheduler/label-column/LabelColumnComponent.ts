export class LabelColumnComponent implements angular.IComponentOptions {
    static $name = 'rrLabelColumn';

    bindings = {
        items: '<',
        getText: '&'
    };

    controllerAs = 'labelColumnCtrl';

    template = require('./LabelColumnView.html');
}
