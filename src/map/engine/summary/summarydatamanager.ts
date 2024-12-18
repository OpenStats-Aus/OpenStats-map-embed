import { Overlay } from '../overlay/overlay';

export class SummaryDataManager {
    private summaryData?: any;

    constructor(private options: SummaryDataOptions) {
        this.init();
    }

    private init() {
        fetch(this.options.endpoint).then(response => response.text()).then(text => {
            this.summaryData = JSON.parse(text);
        }).catch(error => {
            console.log(`Error loading summary data ${this.options.endpoint} ( will retry)`);
            console.log(error);
            this.init(); // retry
        });
    }

    public isReady(): boolean {
        return this.summaryData;
    }

    public getSummaryData(feature: string, overlay: Overlay) {
        return this.summaryData[overlay.getId()]?.[feature];
    }

}

export class SummaryDataOptions {
    constructor(public readonly endpoint: string) {}
}