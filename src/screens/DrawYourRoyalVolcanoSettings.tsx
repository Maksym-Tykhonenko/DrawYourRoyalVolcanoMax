import {
    ImageBackground,

    Text,

    Dimensions,

    Share,

    View,
    
    Image,

    TouchableOpacity,

    StyleSheet,
    
    SafeAreaView,
} from 'react-native';
import { fonts } from '../assets/fonts';

const notificationIcon = require('../assets/icons/notification.png');
const vibrationIcon = require('../assets/icons/vibration.png');
const shareIcon = require('../assets/icons/share.png');

import React, { useState, useEffect } from 'react';

const VOLCANO_NOTIFICATION_KEY = 'isRoyalNotificationsVolcanoEnabled';
import AsyncStorage from '@react-native-async-storage/async-storage';
const VOLCANO_VIBRATION_KEY = 'isRoyalVibrationVolcanoEnabled';

const DrawYourRoyalVolcanoSettings = () => {
    const dimensions = Dimensions.get('window');
    const styles = DrowYourRoyalVolcanoObjComponentStyles(dimensions);

    const [notificationOn, setNotificationOn] = useState(true);
    const [vibrationOn, setVibrationOn] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const notif = await AsyncStorage.getItem(VOLCANO_NOTIFICATION_KEY);
                if (notif !== null) setNotificationOn(notif === 'true');
                const vibro = await AsyncStorage.getItem(VOLCANO_VIBRATION_KEY);
                if (vibro !== null) setVibrationOn(vibro === 'true');
            } catch (e) {
            }
        })();
    }, []);

    const handleNotificationToggle = async (val: boolean) => {
        setNotificationOn(val);
        try {
            await AsyncStorage.setItem(VOLCANO_NOTIFICATION_KEY, val ? 'true' : 'false');
        } catch (e) {}
    };

    const handleVibrationToggle = async (val: boolean) => {
        setVibrationOn(val);
        try {
            await AsyncStorage.setItem(VOLCANO_VIBRATION_KEY, val ? 'true' : 'false');
        } catch (e) {}
    };

    const CustomToggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
        <TouchableOpacity
            style={{
                borderColor: 'black',
                justifyContent: 'space-between',
                flexDirection: 'row',
                height: dimensions.height * 0.044,
                borderWidth: 1,
                width: dimensions.width * 0.19,
                paddingHorizontal: dimensions.width * 0.001,
                borderRadius: dimensions.width * 0.5,
                alignItems: 'center',
                backgroundColor: '#91181D',
            }}
            activeOpacity={0.8}
            onPress={() => onChange(!value)}
        >
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: dimensions.height * 0.04,
                backgroundColor: value ? '#F49C31' : 'transparent',
                borderRadius: dimensions.width * 0.5,
                width: dimensions.height * 0.04,
            }}>
                <Text style={{
                    fontFamily: fonts.sofiaSansBold,
                    fontSize: dimensions.width * 0.045,
                    fontWeight: 'bold',
                    color: 'black',
                }}>ON</Text>
            </View>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: dimensions.height * 0.04,
                backgroundColor: !value ? '#F49C31' : 'transparent',
                borderRadius: dimensions.width * 0.5,
                width: dimensions.height * 0.04,
            }}>
                <Text style={{
                    fontFamily: fonts.sofiaSansBold,
                    fontSize: dimensions.width * 0.045,
                    fontWeight: 'bold',
                    color: 'black',
                }} numberOfLines={1} adjustsFontSizeToFit>OFF</Text>
            </View>
        </TouchableOpacity>


    );

    const ShareButton = () => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={{
                justifyContent: 'center',
                alignItems: 'center',
            }}
        onPress={() => {
            Share.share({
                message: 'Check out this amazing app: Draw Your Royal Volcano!',
            }).catch((error) => console.log('Error sharing:', error));
        }}
        >
            <Image
                source={require('../assets/images/shareButton.png')}
                style={{
                    width: dimensions.width * 0.3,
                    height: dimensions.height * 0.1,
                }}
                resizeMode="contain"
            />

        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ImageBackground source={require('../assets/images/settingsObject.png')} style={styles.drawBackSettingsCard} resizeMode='stretch' >
                {/* Notification Row */}
                <View style={styles.row}>
                    <Image source={notificationIcon} style={styles.drawIcon} resizeMode="contain" />
                    <Text style={styles.drawLabel}>Notification:</Text>
                    <View style={{ flex: 1 }} />
                    <CustomToggle value={notificationOn} onChange={handleNotificationToggle} />
                </View>
                {/* Share Row */}
                <View style={styles.row}>
                    <Image source={shareIcon} style={styles.drawIcon} resizeMode="contain" />
                    <Text style={styles.drawLabel}>Share App:</Text>
                    <View style={{ flex: 1 }} />
                    <ShareButton />
                </View>
                {/* Vibration Row */}
                <View style={styles.row}>
                    <Image source={vibrationIcon} style={styles.drawIcon} resizeMode="contain" />
                    <Text style={styles.drawLabel}>Vibration:</Text>
                    <View style={{ flex: 1 }} />
                    <CustomToggle value={vibrationOn} onChange={handleVibrationToggle} />
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const DrowYourRoyalVolcanoObjComponentStyles = (dimensions: { width: number; height: number }) => StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    drawBackSettingsCard: {
        overflow: 'hidden',
        width: dimensions.width * 0.88,
        paddingBottom: dimensions.height * 0.03,
        borderRadius: 22,
        top: dimensions.height * 0.25,
        left: dimensions.width * 0.06,
        position: 'absolute',
        paddingTop: dimensions.height * 0.045,
        height: dimensions.height * 0.4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: dimensions.width * 0.07,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: dimensions.height * 0.045,
    },
    drawIcon: {
        width: dimensions.width * 0.07,
        height: dimensions.width * 0.07,
        marginRight: dimensions.width * 0.025,
        tintColor: '#23180f',
    },
    drawLabel: {
        fontFamily: fonts.sofiaSansBold,
        fontSize: dimensions.width * 0.052,
        color: '#23180f',
        marginRight: 8,
    },
});

export default DrawYourRoyalVolcanoSettings;
