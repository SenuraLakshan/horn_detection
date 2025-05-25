import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DriverBehaviorMonitor = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Driver Behavior Monitor</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1565C0',
    },
});

export default DriverBehaviorMonitor;