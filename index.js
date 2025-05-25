import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Polyfill Buffer for React Native
if (typeof Buffer === 'undefined') {
    global.Buffer = require('buffer').Buffer;
}

AppRegistry.registerComponent(appName, () => App);