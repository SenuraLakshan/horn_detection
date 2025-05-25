import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmergencySupportSystem = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Emergency Support System</Text>
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

export default EmergencySupportSystem;