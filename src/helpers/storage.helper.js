import { AsyncStorage} from 'react-native';
import Storage from 'react-native-storage';

export class StorageHepler {

    storage = null;

    constructor() {

        this.storage = new Storage({
            storageBackend: AsyncStorage,
            defaultExpires: null,
            enableCache: true,
        });
    }

    getStorage(key) {
        return this.storage.load({
            key: key
        });
    }

    setStorage(key, data) {
        const result = this.storage.save({
            key: key,
            data: data
        });
        return result;
    }

}

export default new StorageHepler();