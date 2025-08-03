/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Firebase'i başlat
import '@react-native-firebase/app';

AppRegistry.registerComponent(appName, () => App);
