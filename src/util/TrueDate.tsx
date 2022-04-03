

export class TrueDate {

    private trueDate = 62167219200;
    private shortdate: string;
    private normDate: string;
    private isBC =false;

    constructor(date: string) {
        if (date.startsWith('-')) this.isBC = true;
        if (this.isBC) date = date.substring(1);
        const timestamp = new Date(date).getTime()/1000;
        this.trueDate += this.isBC ? -timestamp : timestamp;
        this.shortdate = date.replaceAll(/(-01-01|T).*/g,'').replaceAll(/^0+/g,'');
        this.normDate = date.replaceAll(/(\d{4}).(\d{2}).(\d{2}).*/g, '$3.$2.$1');
        if (this.isBC){
          this.shortdate += ' BC';
          this.normDate += ' BC';
        } 
    }

    getShortdate() {
        return this.shortdate;
    }

    getNormdate() {
        return this.normDate;
    }

    compare(otherDate: string): number {
        return this.trueDate - new TrueDate(otherDate).trueDate; 
    }
}