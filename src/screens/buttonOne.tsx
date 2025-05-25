import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Sound from 'react-native-sound';

// Define ErrorBoundary with proper typing
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        return { hasError: true, error: error instanceof Error ? error : new Error(String(error)) };
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        Error: {this.state.error ? this.state.error.toString() : 'Unknown error'}
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}

interface AlertDetails {
    intensity: number;
    direction: string;
    severity: string;
}

function ButtonOneScreen() {
    const [alert, setAlert] = useState<string>('No Horn Detected');
    const [alertHistory, setAlertHistory] = useState<string[]>([]);
    const [alertDetails, setAlertDetails] = useState<AlertDetails>({
        intensity: 0,
        direction: 'None',
        severity: 'None',
    });
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const soundRef = useRef<Sound | null>(null);
    const resetTimerRef = useRef<number | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for fade-in

    useEffect(() => {
        loadSound();
        setupFirestoreListener();

        // Fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        return () => {
            unloadSound();
            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        };
    }, []);

    const loadSound = () => {
        Sound.setCategory('Playback');
        const sound = new Sound('alert1.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.error('Sound loading error:', error);
                setAlert('Failed to load alert sound');
                return;
            }
            soundRef.current = sound;
            console.log('Sound loaded successfully');
        });
    };

    const unloadSound = () => {
        if (soundRef.current) {
            soundRef.current.release();
            soundRef.current = null;
        }
    };

    const playSound = () => {
        if (soundRef.current) {
            soundRef.current.play((success) => {
                if (!success) {
                    console.log('Sound playback failed');
                }
            });
        }
    };

    const setupFirestoreListener = () => {
        setIsLoading(true);
        const unsubscribe = firestore()
            .collection('alerts')
            .orderBy('timestamp', 'desc')
            .limit(1) // Optimize by fetching only the latest document
            .onSnapshot(
                (querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const latestDoc = querySnapshot.docs[0];
                        const data = latestDoc.data();
                        handleFirestoreUpdate(data);
                    }
                    setIsLoading(false);
                },
                (error) => {
                    console.error('Firestore listener error:', error);
                    setAlert('Error connecting to Firestore');
                    setIsLoading(false);
                }
            );

        // Cleanup listener on unmount
        return () => unsubscribe();
    };

    const handleFirestoreUpdate = (data: any) => {
        let newAlert = 'No Horn Detected';
        let newDetails: AlertDetails = {
            intensity: 0,
            direction: 'None',
            severity: 'None',
        };

        switch (data.type) {
            case 'Horn':
                newAlert = 'Horn Detected!';
                newDetails = { intensity: data.intensity || 8, direction: data.direction || 'Front', severity: data.severity || 'Medium' };
                break;
            case 'Left':
                newAlert = 'Horn Detected: Left Side';
                newDetails = { intensity: data.intensity || 10, direction: 'Left', severity: data.severity || 'High' };
                break;
            case 'Right':
                newAlert = 'Horn Detected: Right Side';
                newDetails = { intensity: data.intensity || 10, direction: 'Right', severity: data.severity || 'High' };
                break;
            default:
                newAlert = 'No Horn Detected';
        }

        setAlert(newAlert);
        setAlertDetails(newDetails);
        setAlertHistory((prev) => [...prev, newAlert]);

        // Trigger haptic feedback and sound
        ReactNativeHapticFeedback.trigger('impactHeavy');
        playSound();

        // Auto-reset after 5 seconds
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(refreshAlerts, 5000);
    };

    const refreshAlerts = () => {
        setAlert('No Horn Detected');
        setAlertDetails({ intensity: 0, direction: 'None', severity: 'None' });
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.testText}>Test UI</Text>
                <Text style={[styles.title, { color: isDarkMode ? '#90CAF9' : '#1565C0' }]}>
                    Deaf Driver Alert System
                </Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#1565C0' }]}
                    onPress={() => setIsDarkMode(!isDarkMode)}
                >
                    <Text style={styles.buttonText}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
                </TouchableOpacity>
                {isLoading && <ActivityIndicator size="small" color="#1565C0" />}
                <Text style={[styles.statusText, { color: isLoading ? 'orange' : 'green' }]}>
                    {isLoading ? 'Connecting to Firestore...' : 'Connected to Firestore'}
                </Text>
                <Animated.View style={[styles.alertContainer, { opacity: fadeAnim }]}>
                    <View style={[styles.alertBox, { backgroundColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                        <Text
                            style={[
                                styles.alertText,
                                {
                                    color:
                                        alertDetails.direction === 'Left'
                                            ? '#FFA500'
                                            : alertDetails.direction === 'Right'
                                                ? '#FFC107'
                                                : '#757575',
                                },
                            ]}
                        >
                            {alert}
                        </Text>
                        {alertDetails.direction !== 'None' && (
                            <>
                                <Text style={[styles.alertDetail, { color: alertDetails.direction === 'Left' ? '#FFA500' : '#FFC107' }]}>
                                    Intensity: {alertDetails.intensity}
                                </Text>
                                <Text style={[styles.alertDetail, { color: alertDetails.direction === 'Left' ? '#FFA500' : '#FFC107' }]}>
                                    Severity: {alertDetails.severity}
                                </Text>
                            </>
                        )}
                    </View>
                </Animated.View>
                <View style={styles.directionContainer}>
                    <View
                        style={[
                            styles.directionBox,
                            { backgroundColor: alertDetails.direction === 'Left' ? '#FFA500' : isDarkMode ? '#444' : '#e0f7fa' },
                        ]}
                    >
                        <Text style={styles.directionText}>LEFT</Text>
                    </View>
                    <View
                        style={[
                            styles.directionBox,
                            { backgroundColor: alertDetails.direction === 'Right' ? '#FFC107' : isDarkMode ? '#444' : '#e0f7fa' },
                        ]}
                    >
                        <Text style={styles.directionText}>RIGHT</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#1565C0' }]} onPress={refreshAlerts}>
                    <Text style={styles.buttonText}>Reset Alert</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        alignItems: 'center',
        flexGrow: 1,
    },
    testText: {
        fontSize: 16,
        color: '#000',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        marginVertical: 8,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
    },
    statusText: {
        fontSize: 16,
        marginVertical: 8,
    },
    alertContainer: {
        width: '80%',
        marginVertical: 8,
    },
    alertBox: {
        padding: 12,
        borderRadius: 5,
    },
    alertText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    alertDetail: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    },
    directionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginVertical: 8,
    },
    directionBox: {
        width: '45%',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    directionText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default function App() {
    return (
        <ErrorBoundary>
            <ButtonOneScreen />
        </ErrorBoundary>
    );
}