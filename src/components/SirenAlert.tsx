/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text} from 'react-native';

type Props = {
  visible: boolean;
};

export const SirenAlert = ({visible}: Props) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={{backgroundColor: 'red', padding: 20}}>
      <Text style={{color: 'white', fontSize: 18}}>🚨 Siren Detected!</Text>
    </View>
  );
};
