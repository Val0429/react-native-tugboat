import { Alert } from 'react-native';
import { Toast } from 'native-base';

class AlertHelper {
    alertObj = Alert; // 開放alert物件提供個畫面自定義使用
    toastObj = Toast;
    alertError(message) {
        Alert.alert(
            'Message',
            message,
            [{ text: 'OK' }],
            { cancelable: false }
        )
    }

    displayToast(message) {
        Toast.show({
            text: message,
            position: 'bottom',
            duration: 3000
        });
    }
}

export default new AlertHelper();