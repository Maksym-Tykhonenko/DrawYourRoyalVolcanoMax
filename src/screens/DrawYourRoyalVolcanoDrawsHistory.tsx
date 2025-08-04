import {
    Image,
    SafeAreaView,
    Modal,
    Pressable,
    View,
    Dimensions,
    StyleSheet,
    ImageBackground,
    Text,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScrollView } from 'react-native-gesture-handler';
import DrowVolcanoPageModal from '../components/DrowVolcanoPageModal';
import { fonts } from '../assets/fonts';

import Svg, { Path, Image as SvgImage } from 'react-native-svg';
import React, { useState, useEffect } from 'react';

const DrawYourRoyalVolcanoDrawsHistory = ({ editModalVisible, setEditModalVisible }) => {
    const dimensions = Dimensions.get('window');
    
    const [editVolcano, setEditVolcano] = useState<any | null>(null);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [activeDraws, setActiveDraws] = useState<any[]>([]);
    const [inProgressOrDone, setInProgressOrDone] = useState<'inProgress' | 'done'>('inProgress');
    const [editDrawId, setEditDrawId] = useState<string | null>(null);
    const [activeDraw, setActiveDraw] = useState<any | null>(null);
    const [editPaths, setEditPaths] = useState<any[]>([]);
    
    useEffect(() => {
        const loadDraws = async () => {
            try {
                const raw = await AsyncStorage.getItem('activeDraws');
                if (raw) {
                    setActiveDraws(JSON.parse(raw));
                } else {
                    setActiveDraws([]);
                }
            } catch (e) {
                setActiveDraws([]);
            }
        };
        loadDraws();
    }, []);

    const filteredDraws = activeDraws.filter(
        d => (d.status || 'inProgress') === inProgressOrDone
    );

    const reloadDraws = async () => {
        try {
            const raw = await AsyncStorage.getItem('activeDraws');
            if (raw) setActiveDraws(JSON.parse(raw));
            else setActiveDraws([]);
        } catch {
            setActiveDraws([]);
        }
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            {/* DrowVolcanoPageModal for inProgress */}
            {editModalVisible && editVolcano && (
                <DrowVolcanoPageModal
                    selectedVolcano={editVolcano}
                    onClose={() => {
                        setEditModalVisible(false);
                        setEditVolcano(null);
                        setEditPaths([]);
                        setEditDrawId(null);
                        reloadDraws();
                    }}
                    initialPaths={editPaths}
                    drawId={editDrawId}
                />
            )}
            {/* MODAL FULL DRAW PREVIEW for done */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    flex: 1,
                }}>
                    {activeDraw && (
                        <SafeAreaView style={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'white',
                            padding: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 18,
                        }}>
                            {/* Close button */}
                            <View style={{
                                marginTop: dimensions.height * 0.04039340,
                                flexDirection: 'row',
                                marginBottom: -dimensions.height * 0.1,
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                zIndex: 1000,
                                width: '95%',
                            }}>
                                <TouchableOpacity style={{

                                }} onPress={() => setModalVisible(false)}>
                                    <Image
                                        source={require('../assets/images/backImage.png')}
                                        style={{
                                            width: dimensions.width * 0.19,
                                            height: dimensions.height * 0.08,
                                        }}
                                        resizeMode='contain'
                                    />
                                </TouchableOpacity>

                                <Image
                                    source={activeDraw.selectedVolcano.image}
                                    style={{
                                        width: dimensions.width * 0.4,
                                        height: dimensions.width * 0.4,
                                    }}
                                    resizeMode='contain'
                                />
                            </View>
                            {/* Full SVG preview */}
                            <Svg
                                width={'95%'}
                                height={'80%'}
                                viewBox={`0 0 ${activeDraw.canvasWidth || 1000} ${activeDraw.canvasHeight || 590}`}
                                style={{
                                    alignSelf: 'center',
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    marginTop: 30,
                                }}
                                preserveAspectRatio="xMidYMid meet"
                            >
                                {(() => {
                                    // Фонова картинка
                                    const bgUri = activeDraw.selectedVolcano?.whiteImage
                                        ? (typeof activeDraw.selectedVolcano.whiteImage === 'string'
                                            ? activeDraw.selectedVolcano.whiteImage
                                            : (activeDraw.selectedVolcano.whiteImage.uri || Image.resolveAssetSource(activeDraw.selectedVolcano.whiteImage)?.uri))
                                        : null;
                                    return (
                                        <>
                                            {bgUri && (
                                                <SvgImage
                                                    x={0}
                                                    y={0}
                                                    width={activeDraw.canvasWidth || 1000}
                                                    height={activeDraw.canvasHeight || 590}
                                                    href={{ uri: bgUri }}
                                                    preserveAspectRatio="none"
                                                />
                                            )}
                                            {Array.isArray(activeDraw.paths) && activeDraw.paths.map((p: any, idx: number) => (
                                                <Path
                                                    key={idx}
                                                    d={p.d}
                                                    stroke={p.color}
                                                    strokeWidth={8}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            ))}
                                        </>
                                    );
                                })()}
                            </Svg>
                        </SafeAreaView>
                    )}
                    {/* Закриття по натисканню на фон */}
                    <Pressable
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                        }}
                        onPress={() => setModalVisible(false)}
                    />
                </View>
            </Modal>

            <View style={{
                zIndex: 555,
                flexDirection: 'row',
                justifyContent: 'center',
                height: dimensions.height * 0.14,
                alignSelf: 'center',
                marginBottom: -dimensions.height * 0.03,
                alignItems: 'center',
                gap: dimensions.width * 0.03,
            }}>
                <TouchableOpacity onPress={() => setInProgressOrDone('done')}>
                    <Image
                        source={inProgressOrDone !== 'done' ? require('../assets/images/doneInProgress/bluredDone.png') : require('../assets/images/doneInProgress/doneImage.png')}
                        style={{
                            width: inProgressOrDone === 'done' ? dimensions.width * 0.4 : dimensions.width * 0.21,
                            height: inProgressOrDone === 'done' ? dimensions.height * 0.14 : dimensions.height * 0.07,
                        }}
                        resizeMode='contain'
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setInProgressOrDone('inProgress')}>
                    <Image
                        source={inProgressOrDone !== 'done' ? require('../assets/images/doneInProgress/inProgressImage.png') : require('../assets/images/doneInProgress/bluredInProgress.png')}
                        style={{
                            width: inProgressOrDone !== 'done' ? dimensions.width * 0.4 : dimensions.width * 0.21,
                            height: inProgressOrDone !== 'done' ? dimensions.height * 0.14 : dimensions.height * 0.07,
                        }}
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{
                width: '100%',
                paddingBottom: 100,
            }}>
                <View style={{
                    alignSelf: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    marginTop: dimensions.height * 0.05,
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: dimensions.width * 0.86,
                }}>
                    {filteredDraws.length === 0 ? (
                        <Text style={{
                            fontFamily: fonts.sofiaSansBold,
                            width: '100%',
                            textAlign: 'center',
                            marginTop: dimensions.height * 0.08,
                            fontSize: dimensions.width * 0.05,
                            color: 'white',
                        }}>
                            {inProgressOrDone === 'done'
                                ? 'No completed drawings yet.'
                                : 'No in-progress drawings yet.'}
                        </Text>
                    ) : (
                        filteredDraws.map((draw, index) => {
                            // Визначаємо розміри полотна для ескізу
                            const sketchWidth = dimensions.width * 0.3;
                            const sketchHeight = draw.canvasHeight && draw.canvasWidth
                                ? sketchWidth * (draw.canvasHeight / draw.canvasWidth)
                                : dimensions.width * 0.3 * 0.59;

                            // Масштабуємо шляхи у viewBox, щоб вони виглядали так само як при малюванні
                            const viewBox = `0 0 ${draw.canvasWidth || 1000} ${draw.canvasHeight || 590}`;

                            const bgUri = draw.selectedVolcano?.whiteImage
                                ? (typeof draw.selectedVolcano.whiteImage === 'string'
                                    ? draw.selectedVolcano.whiteImage
                                    : (draw.selectedVolcano.whiteImage.uri || Image.resolveAssetSource(draw.selectedVolcano.whiteImage)?.uri))
                                : null;
                            return (
                                <TouchableOpacity
                                    key={draw.id || index}
                                    style={{
                                        marginTop: dimensions.height * 0.021,
                                    }}
                                    onPress={() => {
                                        if ((draw.status || 'inProgress') === 'inProgress') {
                                            setEditVolcano(draw.selectedVolcano);
                                            setEditPaths(draw.paths || []);
                                            setEditDrawId(draw.id);
                                            setEditModalVisible(true);
                                        } else {
                                            setActiveDraw(draw);
                                            setModalVisible(true);
                                        }
                                    }}
                                >
                                    <ImageBackground
                                        source={require('../assets/images/settingsObject.png')}
                                        style={{
                                            width: dimensions.width * 0.4,
                                            height: dimensions.width * 0.4,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        resizeMode='stretch'
                                    >
                                        <Svg
                                            width={sketchWidth}
                                            height={sketchHeight}
                                            viewBox={viewBox}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: 12,
                                            }}
                                        >
                                            {bgUri && (
                                                <SvgImage
                                                    x={0}
                                                    y={0}
                                                    width={draw.canvasWidth || 1000}
                                                    height={draw.canvasHeight || 590}
                                                    href={{ uri: bgUri }}
                                                    preserveAspectRatio="none"
                                                />
                                            )}
                                            {Array.isArray(draw.paths) && draw.paths.map((p: any, idx: number) => (
                                                <Path
                                                    key={idx}
                                                    d={p.d}
                                                    stroke={p.color}
                                                    strokeWidth={draw.canvasWidth ? 4 * (draw.canvasWidth / sketchWidth) : 4}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            ))}
                                        </Svg>
                                    </ImageBackground>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DrawYourRoyalVolcanoDrawsHistory;
