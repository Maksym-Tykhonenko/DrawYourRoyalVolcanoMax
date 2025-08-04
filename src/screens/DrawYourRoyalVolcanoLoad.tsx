import { loadUserData } from '../redux/userSlice';

import { UserContext } from '../context/UserContext';

import {Image, View, Animated, StyleSheet, Dimensions, ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useMemo, useReducer, useLayoutEffect } from 'react';

import { useNavigation } from '@react-navigation/native';

import DeviceInfo from 'react-native-device-info';

import { useDispatch } from 'react-redux';

const fireFrames = [
  require('../assets/images/loadingVolcanoFires/step1.png'),
  require('../assets/images/loadingVolcanoFires/step2.png'),
  require('../assets/images/loadingVolcanoFires/step3.png'),
  require('../assets/images/loadingVolcanoFires/step4.png'),
  require('../assets/images/loadingVolcanoFires/step5.png'),
  require('../assets/images/loadingVolcanoFires/step6.png'),
  require('../assets/images/loadingVolcanoFires/step7.png'),
  require('../assets/images/loadingVolcanoFires/step8.png'),
];

const ONBOARDING_KEY = 'volcano_onboarded';
const USERDATA_KEY_PREFIX = 'volcano_user_';

function calcFireSize(i: number, w: number, h: number) {
  if (i < 2) return { width: w * 0.14, height: w * 0.14 };
  if (i < 4) return { width: h * 0.12, height: h * 0.12 };
  if (i === 4) return { width: h * 0.16, height: h * 0.16 };
  if (i === 5 || i === 7) return { width: h * 0.14, height: h * 0.14 };
  return { width: h * 0.11, height: h * 0.11 };
}

function frameReducer(state: number, action: { max: number }) {
  return (state + 1) % action.max;
}

const VolcanoLoader: React.FC = () => {
  const nav = useNavigation(); 
  const fade = React.useRef(new Animated.Value(0)).current;
  const { setUser } = React.useContext(UserContext);
  const [frameIdx, nextFrame] = useReducer(frameReducer, 0);
  const dispatch = useDispatch(); 
  const screenDims = Dimensions.get('window');
  
  useLayoutEffect(() => {
    let running = true;
    let localIdx = 0;
    const tick = () => {
      if (!running) return;
      nextFrame({ max: fireFrames.length });
      localIdx = (localIdx + 1) % fireFrames.length;
      setTimeout(tick, localIdx === 7 ? 160 : 140);
    };
    tick();
    return () => { running = false; };
  }, []);

  useLayoutEffect(() => {
    let onboardingNeeded = false;
    (async () => {
      try {
        const id = await DeviceInfo.getUniqueId();
        const userKey = USERDATA_KEY_PREFIX + id;
        const [flag, user] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(userKey)
        ]);
        if (user) setUser(JSON.parse(user));
        else if (!flag) {
          onboardingNeeded = true;
          await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        }
      } catch {}
    })();
    dispatch(loadUserData());
    Animated.timing(fade, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [dispatch, nav, setUser, fade]);

  const fireStyle = useMemo(
    () => calcFireSize(frameIdx, screenDims.width, screenDims.height),
    [frameIdx, screenDims.width, screenDims.height]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ImageBackground
        source={require('../assets/images/volcanoBackImage.png')}
        style={[StyleSheet.absoluteFill, { width: screenDims.width, height: screenDims.height }]}
        resizeMode="cover"
      />
      <Image
        source={fireFrames[frameIdx]}
        style={{
          position: 'absolute',
          ...fireStyle,
          bottom: screenDims.height * 0.331,
          zIndex: 8,
          alignSelf: 'center',
        }}
        resizeMode="contain"
      />
      <Image
        source={require('../assets/images/volcanoImage.png')}
        style={{
          width: screenDims.width * 1.4,
          height: screenDims.height * 0.7,
          zIndex: 10,
          bottom: -screenDims.height * 0.16,
          position: 'absolute',
          alignSelf: 'center',
        }}
        resizeMode="stretch"
      />
    </View>
  );
};

export default VolcanoLoader;