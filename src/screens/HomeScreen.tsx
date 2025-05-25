import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define the navigation param list
type RootStackParamList = {
    Home: undefined;
    HornDetection: undefined;
    EmergencyVehicleDetection: undefined;
    DriverBehaviorMonitor: undefined;
    EmergencySupportSystem: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    // Animation states for each button
    const scaleAnim1 = React.useRef(new Animated.Value(1)).current;
    const scaleAnim2 = React.useRef(new Animated.Value(1)).current;
    const scaleAnim3 = React.useRef(new Animated.Value(1)).current;
    const scaleAnim4 = React.useRef(new Animated.Value(1)).current;
    const opacityAnim1 = React.useRef(new Animated.Value(1)).current;
    const opacityAnim2 = React.useRef(new Animated.Value(1)).current;
    const opacityAnim3 = React.useRef(new Animated.Value(1)).current;
    const opacityAnim4 = React.useRef(new Animated.Value(1)).current;

    // Animation function for button press
    const handlePressIn = (scaleAnim: Animated.Value, opacityAnim: Animated.Value) => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.9,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.7,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = (scaleAnim: Animated.Value, opacityAnim: Animated.Value) => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Deaf Driver Safety System</Text>
            <View style={styles.buttonContainer}>
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim1 }], opacity: opacityAnim1 }]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('HornDetection')}
                        onPressIn={() => handlePressIn(scaleAnim1, opacityAnim1)}
                        onPressOut={() => handlePressOut(scaleAnim1, opacityAnim1)}
                    >
                        <Image
                            source={require('../icons/horn.png')}
                            style={{ width: 60, height: 60, resizeMode: 'contain' }}
                        />
                        <Text style={styles.buttonText}>Horn Detection</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim2 }], opacity: opacityAnim2 }]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('EmergencyVehicleDetection')}
                        onPressIn={() => handlePressIn(scaleAnim2, opacityAnim2)}
                        onPressOut={() => handlePressOut(scaleAnim2, opacityAnim2)}
                    >
                        <Image
                            source={require('../icons/vehicle.png')}
                            style={{ width: 70, height: 70, resizeMode: 'contain' }}
                        />
                        <Text style={styles.buttonText}>Emergency Vehicle Detection</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
            <View style={styles.buttonContainer}>
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim3 }], opacity: opacityAnim3 }]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('DriverBehaviorMonitor')}
                        onPressIn={() => handlePressIn(scaleAnim3, opacityAnim3)}
                        onPressOut={() => handlePressOut(scaleAnim3, opacityAnim3)}
                    >
                        <Image
                            source={require('../icons/driver.png')}
                            style={{ width: 70, height: 70, resizeMode: 'contain' }}
                        />
                        <Text style={styles.buttonText}>Driver Behavior Monitor</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim4 }], opacity: opacityAnim4 }]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('EmergencySupportSystem')}
                        onPressIn={() => handlePressIn(scaleAnim4, opacityAnim4)}
                        onPressOut={() => handlePressOut(scaleAnim4, opacityAnim4)}
                    >
                        <Image
                            source={require('../icons/support.png')}
                            style={{ width: 70, height: 70, resizeMode: 'contain' }}
                        />
                        <Text style={styles.buttonText}>Emergency Support System</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 32,
        color: '#1565C0',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginVertical: 10,
    },
    buttonWrapper: {
        width: '48%',
        aspectRatio: 1, // Ensures square shape
    },
    button: {
        flex: 1,
        backgroundColor: '#ffffff', // Light gray background
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        padding: 10,
    },
    buttonText: {
        color: '#1565C0',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default HomeScreen;