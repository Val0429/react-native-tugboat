export class OTPHelper {

    constructor(
        
    ) { }

    otpCode() {

        let code = '';
        for(let index = 0; index < 6;index++){
                code += Math.floor(Math.random()*10);
        }
        return code;
    }

}

export default new OTPHelper();