namespace br.weeklyScheduler {
    export interface IResizeServiceProvider extends angular.IServiceProvider {
        setCustomResizeEvents(events: string[]);
    }
}
