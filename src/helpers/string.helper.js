export const StringHelper = {
    // 字串前補0
    addZero: function (str, length) {
        if (str.length >= length) {
            return str;
        }
        return new Array(length - str.length + 1).join('0') + str;
    },
    toString: function (val) {
        return val.toString();
    },
    isNullOrEmpty(str) {
        if (!str || str === '' || str === null) {
            return true;
        }
        return false;
    }
};
export default StringHelper;