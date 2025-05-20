/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Vibration,
  Animated,
  Dimensions,
} from 'react-native';
import {connect, MqttClient} from 'mqtt';
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
export default function App() {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlertScreen, setShowAlertScreen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarCircles = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.6)).current,
  ];
  useEffect(() => {
    const client: MqttClient = connect('ws://192.168.8.161:9001', {
      reconnectPeriod: 1000,
      connectTimeout: 4000,
    });
    client.on('connect', () => {
      console.log('✅ MQTT Connected');
      client.subscribe('alerts/siren_detected', err => {
        if (err) {
          console.error('❌ Subscription Error:', err);
        } else {
          console.log('📡 Subscribed to alerts/siren_detected');
        }
      });
    });
    client.on('message', (topic, message) => {
      const msg = message.toString();
      console.log(`🚨 Alert Received: ${msg}`);
      setAlertMessage(msg);
      setShowAlertScreen(true);
      Vibration.vibrate([0, 800, 400, 800, 400, 1200], false);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
      setTimeout(() => {
        setShowAlertScreen(false);
        setAlertMessage(null);
        pulseAnim.setValue(1);
      }, 12000);
    });
    client.on('error', err => {
      console.error('❌ MQTT Error:', err.message);
    });
    return () => {
      client.end();
    };
  }, []);
  useEffect(() => {
    radarCircles.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
            delay: index * 600,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);
  return (
    <View style={styles.container}>
      {/* 🟢 HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🚨 Siren Alert System</Text>
      </View>
      {/* 🔵 Radar Effect */}
      <View style={styles.radarSection}>
        <View style={styles.radarContainer}>
          {radarCircles.map((anim, index) => {
            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 3.5],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 0],
            });
            return (
              <Animated.View
                key={index}
                style={[styles.radarCircle, {transform: [{scale}], opacity}]}
              />
            );
          })}
          <View style={styles.radarCenterDot} />
        </View>
        <Text style={styles.radarLabel}>🔍 Scanning for Sirens...</Text>
      </View>
      {/* App Title */}
      <Text style={styles.title}>Siren Alert for Deaf Drivers</Text>
      {/* Status Card */}
      {!showAlertScreen && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>System Status</Text>
          <Text style={styles.statusText}>
            {alertMessage ? '🚨 Alert Active' : '✅ Monitoring...'}
          </Text>
        </View>
      )}
      {/* Alert Message */}
      <View style={styles.alertBox}>
        <Text style={styles.alertLabel}>Current Alert:</Text>
        <Text style={styles.alertMessage}>
          {alertMessage ? alertMessage : 'No siren detected yet.'}
        </Text>
      </View>
      {/* Alert Overlay */}
      {showAlertScreen && (
        <Animated.View style={[styles.alertOverlay, {opacity: fadeAnim}]}>
          <Animated.Text
            style={[styles.overlayText, {transform: [{scale: pulseAnim}]}]}>
            🚨 SIREN DETECTED!
          </Animated.Text>
        </Animated.View>
      )}
      {/* 🔻 FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© Research Prototype • v1.0</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf1f7',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
    width: '100%',
    backgroundColor: '#003366',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  radarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  radarContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#00ff99',
    backgroundColor: 'rgba(0,255,150,0.15)',
  },
  radarCenterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00cc66',
  },
  radarLabel: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusCard: {
    width: '92%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#999',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 18,
    color: '#222',
  },
  alertBox: {
    width: '92%',
    backgroundColor: '#fff0f0',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  alertLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#cc0000',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#990000',
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(255,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    marginTop: 25,
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});
