import { Overlay } from '../overlay/overlay';

export class SummaryDataManager {
    private summaryData?: any;

    constructor(private endpoint: string) {
        this.init();
    }

    private init() {
        fetch(this.endpoint).then(response => response.text()).then(text => {
            this.summaryData = JSON.parse(text);
        }).catch(error => {
            console.log(`Error loading summary data ${this.endpoint} ( will retry)`);
            console.log(error);
            this.init(); // retry
        });
    }

    public isReady(): boolean {
        return this.summaryData;
    }

    public getSummaryData(feature: string, overlay: Overlay) {
        if (this.summaryData === undefined) {
            return undefined;
        }
        return this.summaryData[overlay.getId()]?.[feature];
    }

}
