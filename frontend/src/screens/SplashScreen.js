import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinishLoading }) {
  // Animation values
  const progress = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Loading bar animation (0% to 100% over 3.5 seconds)
    Animated.timing(progress, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: false, // width cannot be animated using native driver
    }).start(({ finished }) => {
      if (finished && onFinishLoading) {
        // Delay slightly for a smoother transition feel
        setTimeout(onFinishLoading, 500);
      }
    });

    // 2. Pulsing "Loading..." text animation (infinite loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [onFinishLoading]);

  // Interpolate progress value to width percentage
  const progressBarWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <ImageBackground
        source={require('../../assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Loading Indicator Section */}
          <View style={styles.loaderContainer}>
            {/* Progress Track */}
            <View style={styles.progressTrack}>
              {/* Animated Progress Fill */}
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressBarWidth,
                  },
                ]}
              />
              {/* Faint Dashed/Dotted Guide in background */}
              <View style={styles.dashedOverlay}>
                <View style={styles.dash} />
                <View style={styles.dash} />
                <View style={styles.dash} />
                <View style={styles.dash} />
              </View>
            </View>

            {/* Loading text */}
            <Animated.Text style={[styles.loadingText, { opacity: textOpacity }]}>
              Loading...
            </Animated.Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: width * 0.75,
    height: width * 0.75,
  },
  loaderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 80,
  },
  progressTrack: {
    width: width * 0.45,
    height: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // light lavender track
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6D28D9', // Deep violet progress bar
    borderRadius: 2,
  },
  dashedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    pointerEvents: 'none',
  },
  dash: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // subtle dashes
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B', // Navy blue color
    letterSpacing: 0.5,
  },
});
