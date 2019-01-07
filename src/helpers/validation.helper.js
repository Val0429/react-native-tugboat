import StringHelper from './string.helper';

class Validation {

    ValidPort(port) {
        if (!port || Number(port) > 65535 || Number(port) < 1) {
            return false;
        }
        return true;
    }

    ValidHost(host) {

        if (StringHelper.isNullOrEmpty(host)) {
            return false;
        }

        if (!/^[a-zA-Z0-9_.-]*$/.test(host)) {
            return false;
        }

        return true;
    }

    ValidValue(string) {
        if (StringHelper.isNullOrEmpty(string)) {
            return false;
        }
        return true;
    }

    ValidNumber(string) {

        if (StringHelper.isNullOrEmpty(string)) {
            return false;
        }

        if (!/^[0-9]*$/.test(string)) {
            return false;
        }

        return true;

    }

}

export default new Validation();