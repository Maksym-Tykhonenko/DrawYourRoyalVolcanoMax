import DrawVolcanoOnboardingAnimation from '../components/DrawVolcanoOnboardingAnimation';

import { useNavigation } from '@react-navigation/native';

import React, { useRef, useReducer, useCallback } from 'react';

import { fonts } from '../assets/fonts';

import { View, Dimensions, Animated, Image, Text, Pressable } from 'react-native';

const onboardingSteps = [
  `Color unique volcano pictures and create your own fiery masterpieces.
A collection of exciting coloring pages awaits you!`,
  `Every coloring page requires energy.
Color gradually, save your drawings and come back to finish your work.`,
  `Continue your drawings in progress, choose pictures from a selection of volcanoes and customize the application to your preferences.`
];

const initialState = {
  step: 0,
  animating: false,
};

function reducer(state: typeof initialState, action: { type: 'next' | 'reset'; max: number }) {
  switch (action.type) {
    case 'next':
      if (state.step < action.max - 1) {
        return { ...state, step: state.step + 1, animating: false };
      }
      return { ...state, animating: false };
    case 'reset':
      return { step: 0, animating: false };
    default:
      return state;
  }
}

const DrawYourRoyalVolcanoOnboarding: React.FC = () => {
  const nav = useNavigation();
  const [{ step, animating }, dispatch] = useReducer(reducer, initialState);
  const fade = useRef(new Animated.Value(1)).current;
  const { width, height } = Dimensions.get('window');

  const handleAdvance = useCallback(() => {
    if (animating) return;
    if (step >= onboardingSteps.length - 1) {
      nav.replace && nav.replace('DrawYourRoyalVolcanoHome');
      return;
    }
    Animated.sequence([
      Animated.timing(fade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dispatch({ type: 'next', max: onboardingSteps.length });
    });
  }, [animating, step, nav, fade]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image
        source={require('../assets/images/volcanoOnboBackImage.png')}
        style={{
          position: 'absolute',
          width,
          height,
          top: 0,
          left: 0,
        }}
        resizeMode="cover"
      />
      <View style={{
        position: 'absolute',
        alignSelf: 'center',
        top: height * 0.19,
        zIndex: 10,
        width: 100,
        height: 100,
        overflow: 'visible',
      }}>
        <DrawVolcanoOnboardingAnimation />
      </View>
      <Animated.View style={{
        position: 'absolute',
        alignSelf: 'center',
        top: height * 0.64,
        zIndex: 11,
        width: width * 0.75,
        opacity: fade,
      }}>
        <Text style={{
          color: '#111',
          fontSize: width * 0.043,
          fontFamily: fonts.sofiaSansRegular,
          textAlign: 'center',
        }}>
          {onboardingSteps[step]}
        </Text>
      </Animated.View>
      <Pressable
        style={{
          width: width * 0.5,
          height: height * 0.19,
          position: 'absolute',
          alignSelf: 'center',
          bottom: height * 0.0,
        }}
        android_ripple={{ color: '#222', borderless: false }}
        onPress={handleAdvance}
      />
    </View>
  );
};

export default DrawYourRoyalVolcanoOnboarding;