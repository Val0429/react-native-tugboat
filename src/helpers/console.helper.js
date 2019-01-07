
export class ConsoleHelper {


    consoleTitle = 'AppLog';

    consoleError = 'Error';

    consoleWarn = 'Warning';

    log(title, msg) {
        console.log(this.consoleTitle + this.title, msg);
    }

    error(title, msg) {
        console.log(this.consoleTitle + '.' + this.consoleError + '.' + title, msg);
    }

    warn(title, msg) {
        console.log(this.consoleTitle + '.' + this.consoleWarn + '.' + title, msg);
    }

}

export default new ConsoleHelper();