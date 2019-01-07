

export class SettingsService {

    threshold = '70';

    defaultTresholdValue = 0.8;

    /** 回傳小數點 */
    get getThreshold(){
        
        var score = !parseInt(this.threshold,10) ? this.defaultTresholdValue: parseInt(this.threshold,10)/100;

       // console.log('score',score);

        if(score < 0.4 && score > 0.99){
            return this.defaultTresholdValue
        }

        return score;
    }

    constructor() {
  
    }
  }
  
  export default new SettingsService();