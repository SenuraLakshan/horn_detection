import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');

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

const HornDetection = () => {
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
    const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const leftScaleAnim = useRef(new Animated.Value(1)).current;
    const rightScaleAnim = useRef(new Animated.Value(1)).current;
    const alertScaleAnim = useRef(new Animated.Value(1)).current;
    const alertFadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadSound();
        setupFirestoreListener();

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

    useEffect(() => {
        // Bounce animation for left indicator when direction is 'Left'
        if (alertDetails.direction === 'Left') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(leftScaleAnim, {
                        toValue: 1.15,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(leftScaleAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.timing(leftScaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        // Bounce animation for right indicator when direction is 'Right'
        if (alertDetails.direction === 'Right') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(rightScaleAnim, {
                        toValue: 1.15,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rightScaleAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.timing(rightScaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        // Pulse with fade animation for alert box when a horn is detected
        if (alert !== 'No Horn Detected') {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(alertScaleAnim, {
                            toValue: 1.08,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(alertScaleAnim, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(alertFadeAnim, {
                            toValue: 0.7,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(alertFadeAnim, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        } else {
            Animated.parallel([
                Animated.timing(alertScaleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(alertFadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [alertDetails.direction, alert]);

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
            .limit(1)
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
                newDetails = { intensity: data.intensity || 8, direction: 'Front', severity: data.severity || 'Medium' };
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
        resetTimerRef.current = setTimeout(refreshAlerts, 5000); //here
    };

    const refreshAlerts = () => {
        setAlert('No Horn Detected');
        setAlertDetails({ intensity: 0, direction: 'None', severity: 'None' });
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };

    return (
        <ErrorBoundary>
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: isDarkMode ? '#90CAF9' : '#1565C0' }]}>
                        Deaf Driver Alert System
                    </Text>
                    <TouchableOpacity
                        style={[styles.modeToggle, { backgroundColor: isDarkMode ? '#555' : '#1565C0' }]}
                        onPress={() => setIsDarkMode(!isDarkMode)}
                    >
                        <Text style={styles.modeToggleText}>{isDarkMode ? 'Light' : 'Dark'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.content}>
                    {isLoading && <ActivityIndicator size="large" color="#1565C0" />}
                    <Text style={[styles.statusText, { color: isLoading ? 'orange' : 'green' }]}>
                        {isLoading ? 'Connecting to Firestore...' : 'Connected to Firestore'}
                    </Text>
                    <Animated.View style={[styles.alertContainer, { transform: [{ scale: alertScaleAnim }], opacity: alertFadeAnim }]}>
                        <View style={[styles.alertBox, { backgroundColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                            <Image
                                source={require('../icons/horn2.png')}
                                style={{ width: 140, height: 140, resizeMode: 'contain' }}
                            />
                            <Text
                                style={[
                                    styles.alertText,
                                    {
                                        color:
                                            alertDetails.direction === 'Left'
                                                ? '#FFA500'
                                                : alertDetails.direction === 'Right'
                                                    ? '#FFC107'
                                                    : alertDetails.direction === 'Front'
                                                        ? '#FF5252'
                                                        : '#757575',
                                    },
                                ]}
                            >
                                {alert}
                            </Text>
                            {alertDetails.direction !== 'None' && (
                                <>
                                    <Text style={[styles.alertDetail, { color: alertDetails.direction === 'Left' ? '#FFA500' : alertDetails.direction === 'Right' ? '#FFC107' : '#FF5252' }]}>
                                        Intensity: {alertDetails.intensity}
                                    </Text>
                                    <Text style={[styles.alertDetail, { color: alertDetails.direction === 'Left' ? '#FFA500' : alertDetails.direction === 'Right' ? '#FFC107' : '#FF5252' }]}>
                                        Severity: {alertDetails.severity}
                                    </Text>
                                </>
                            )}
                        </View>
                    </Animated.View>
                    <View style={styles.directionContainer}>
                        <Animated.View
                            style={[
                                styles.directionBox,
                                {
                                    backgroundColor: alertDetails.direction === 'Left' ? '#FFA500' : isDarkMode ? '#444' : '#e0f7fa',
                                    transform: [{ scale: leftScaleAnim }],
                                },
                            ]}
                        >
                            <Image
                                source={require('../icons/left.png')}
                                style={{ width: 60, height: 60, resizeMode: 'contain' }}
                            />
                            <Text style={styles.directionText}>LEFT</Text>
                        </Animated.View>
                        <Animated.View
                            style={[
                                styles.directionBox,
                                {
                                    backgroundColor: alertDetails.direction === 'Right' ? '#FFC107' : isDarkMode ? '#444' : '#e0f7fa',
                                    transform: [{ scale: rightScaleAnim }],
                                },
                            ]}
                        >
                            <Image
                                source={require('../icons/right.png')}
                                style={{ width: 60, height: 60, resizeMode: 'contain' }}
                            />
                            <Text style={styles.directionText}>RIGHT</Text>
                        </Animated.View>
                    </View>
                    <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? '#555' : '#1565C0' }]} onPress={refreshAlerts}>
                        <Text style={styles.buttonText}>Reset Alert</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    content: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    modeToggle: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    modeToggleText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    button: {
        padding: 12,
        borderRadius: 8,
        marginVertical: 12,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 16,
        marginVertical: 8,
    },
    alertContainer: {
        width: width * 0.8, // 80% of screen width
        marginVertical: 12,
    },
    alertBox: {
        width: '100%',
        height: width * 0.8, // Square, matching width
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIcon: {
        marginBottom: 8,
    },
    alertText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    alertDetail: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 8,
    },
    directionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width * 0.8, // 80% of screen width
        marginVertical: 12,
    },
    directionBox: {
        width: '45%', // Two boxes fit within 80% width with spacing
        height: 160, // Increased height to accommodate icon
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        flexDirection: 'column', // Stack icon and text vertically
    },
    directionIcon: {
        marginBottom: 8,
    },
    directionText: {
        fontSize: 22,
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

export default HornDetection;