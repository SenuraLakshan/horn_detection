// index.js
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {Buffer} from 'buffer';
global.Buffer = Buffer;
global.process = require('process');
global.stream = require('stream');
global.setImmediate = require('timers').setImmediate;
global.clearImmediate = require('timers').clearImmediate;

AppRegistry.registerComponent(appName, () => App);
