/** @internal */
class GhostSlotController implements angular.IComponentController {
    static $name = 'brGhostSlotController';
    static $controllerAs = 'ghostSlotCtrl';
}

/** @internal */
class GhostSlotComponent implements angular.IComponentOptions {
    static $name = 'brGhostSlot';

    controller = GhostSlotController.$name;
    controllerAs = GhostSlotController.$controllerAs;

    template = `
        <div class="slot ghost">
            +
        </div>
    `;
}


angular.module('br.weeklyScheduler')
    .controller(GhostSlotController.$name, GhostSlotController)
    .component(GhostSlotComponent.$name, new GhostSlotComponent());
