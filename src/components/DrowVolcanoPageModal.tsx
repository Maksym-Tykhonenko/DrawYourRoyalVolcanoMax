import AsyncStorage from '@react-native-async-storage/async-storage';
import { fonts } from '../assets/fonts';

import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Image as SvgImage } from 'react-native-svg';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard, PanResponder, Animated } from 'react-native';

interface DrawingPageProps {
    drawId?: string | null; // drawId: якщо є — редагуємо існуючий, якщо null — створюємо новий
    initialPaths?: { color: string, d: string }[];
    onClose: () => void;
    selectedVolcano: any;
}

const DrowVolcanoPageModal: React.FC<DrawingPageProps> = ({
    drawId = null,
    onClose,
    initialPaths = [],
    selectedVolcano,
}) => {
    const dimensions = Dimensions.get('window');
    if (!selectedVolcano) return null;

    const [selectedColor, setSelectedColor] = useState<string>(selectedVolcano.colors[0]);

    const currentColorRef = useRef(selectedVolcano.colors[0]);
    const [mode, setMode] = useState<'paint' | 'zoom'>('paint');
    const [paths, setPaths] = useState<{ color: string, d: string }[]>(initialPaths);
    const [currentPath, setCurrentPath] = useState<string>('');
    const svgRef = useRef<any>(null);
    const [isAllDonePressed, setIsAllDonePressed] = useState(false);

    // background image (SVG or PNG/JPG)
    const backgroundImage = Image.resolveAssetSource(selectedVolcano.whiteImage)?.uri;

    // --- ZOOM & PAN state ---
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    useEffect(() => {
        pan.setValue(position);
    }, [position]);

    // PanResponder for zoom mode
    const zoomPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => mode === 'zoom',
            onMoveShouldSetPanResponder: () => mode === 'zoom',
            onPanResponderGrant: () => {
                pan.setOffset({ x: pan.x._value, y: pan.y._value });
            },
            onPanResponderMove: (e, gestureState) => {
                if (mode === 'zoom' && gestureState.numberActiveTouches === 1) {
                    Animated.event(
                        [null, { dx: pan.x, dy: pan.y }],
                        { useNativeDriver: false }
                    )(e, gestureState);
                }
            },
            onPanResponderRelease: (_, gesture) => {
                pan.flattenOffset();
                setPosition({
                    x: pan.x._value,
                    y: pan.y._value,
                });
            },
        })
    ).current;

    // Zoom in/out handlers
    const handleZoom = (type: 'in' | 'out') => {
        // Зберігаємо поточну лінію перед зумом
        if (currentPath) {
            setPaths(prev => [...prev, { color: selectedColor, d: currentPath }]);
            setCurrentPath('');
        }
        setScale(prev => {
            let next = type === 'in' ? prev * 1.15 : prev / 1.15;
            if (next < 1) next = 1;
            if (next > 4) next = 4;
            return next;
        });
    };

    // Reset position if scale is 1
    useEffect(() => {
        if (scale === 1) {
            setPosition({ x: 0, y: 0 });
            pan.setValue({ x: 0, y: 0 });
        }
    }, [scale]);

    const handleColorChange = (color: string) => {
        if (mode === 'paint' && currentPath) {
            setPaths(prev => [...prev, { color: currentColorRef.current, d: currentPath }]);
            setCurrentPath('');
        }
        setSelectedColor(color);
        currentColorRef.current = color;
    };

    // Слідкуємо за зміною selectedColor (на випадок зміни volcano)
    useEffect(() => {
        currentColorRef.current = selectedColor;
    }, [selectedColor]);

    // --- DRAW SESSION ID ---
    const [drawSessionId, setDrawSessionId] = useState<string | null>(drawId);
    // Track the id for the current drawing session (guaranteed stable after first stroke)
    const drawingIdRef = useRef<string | null>(drawId);

    // ОНОВЛЮЄМО ТІЛЬКИ КОЛИ ЗМІНИВСЯ drawId (тобто відкривається інший малюнок)
    useEffect(() => {
        setPaths(initialPaths);
        setDrawSessionId(drawId);
        drawingIdRef.current = drawId;
    }, [drawId]);

    const saveActiveDraw = async (
        pathsToSave: { color: string, d: string }[],
        idOverride?: string
    ) => {
        // Always use the same id for the session after the first stroke
        let id = drawingIdRef.current || drawSessionId || idOverride;
        if (!id) {
            id = `draw_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
            setDrawSessionId(id);
            drawingIdRef.current = id;
        }
        try {
            const activeDrawsRaw = await AsyncStorage.getItem('activeDraws');
            let activeDraws = activeDrawsRaw ? JSON.parse(activeDrawsRaw) : [];
            const canvasWidth = dimensions.width;
            const canvasHeight = dimensions.width * 0.59;

            let idx = activeDraws.findIndex((d: any) => d.id === id);

            if (idx === -1) {
                // Create new drawing only if it doesn't exist yet
                if (pathsToSave.length > 0) {
                    activeDraws.unshift({
                        id,
                        selectedVolcano,
                        paths: pathsToSave,
                        canvasWidth,
                        canvasHeight,
                        status: 'inProgress',
                    });
                    await AsyncStorage.setItem('activeDraws', JSON.stringify(activeDraws));
                    setDrawSessionId(id);
                    drawingIdRef.current = id;
                }
            } else {
                // Update existing drawing
                activeDraws[idx] = {
                    ...activeDraws[idx],
                    paths: pathsToSave,
                    canvasWidth,
                    canvasHeight,
                };
                await AsyncStorage.setItem('activeDraws', JSON.stringify(activeDraws));
                setDrawSessionId(id);
                drawingIdRef.current = id;
            }
        } catch (e) {
            // handle error
        }
    };

    // --- PAINT PanResponder ---
    const paintPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => mode === 'paint',
            onMoveShouldSetPanResponder: () => mode === 'paint',
            onPanResponderGrant: async (evt, gestureState) => {
                // Переводимо координати у "глобальні" (відносно полотна)
                const { locationX, locationY } = evt.nativeEvent;
                const x = (locationX - position.x) / scale;
                const y = (locationY - position.y) / scale;
                setCurrentPath(`M${x},${y}`);

                // If no id yet, generate and set it (but don't save to storage yet)
                if (!drawingIdRef.current) {
                    const id = `draw_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
                    setDrawSessionId(id);
                    drawingIdRef.current = id;
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                const { locationX, locationY } = evt.nativeEvent;
                const x = (locationX - position.x) / scale;
                const y = (locationY - position.y) / scale;
                setCurrentPath(prev => prev + ` L${x},${y}`);
            },
            onPanResponderRelease: async (evt, gestureState) => {
                setCurrentPath(prev => {
                    if (prev) {
                        setPaths(pathsPrev => {
                            const newPaths = [
                                ...pathsPrev,
                                { color: currentColorRef.current, d: prev }
                            ];
                            // Always use the same id for this session
                            saveActiveDraw(newPaths, drawingIdRef.current);
                            return newPaths;
                        });
                    }
                    return '';
                });
            },
        })
    ).current;

    // Also update AsyncStorage when paths change (if not during pan responder)
    useEffect(() => {
        if (drawSessionId) {
            saveActiveDraw(paths);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paths]);

    // --- HANDLERS ---
    const handleSetDone = async () => {
        const volcanoId = selectedVolcano.id || selectedVolcano.name || 'volcano';
        try {
            setIsAllDonePressed(true);
            // Save current paths before marking as done
            const activeDrawsRaw = await AsyncStorage.getItem('activeDraws');
            let activeDraws = activeDrawsRaw ? JSON.parse(activeDrawsRaw) : [];
            let idx = activeDraws.findIndex((d: any) =>
                (d.selectedVolcano?.id || d.selectedVolcano?.name || 'volcano') === volcanoId
            );
            if (idx !== -1) {
                activeDraws[idx] = {
                    ...activeDraws[idx],
                    status: 'done',
                };
                await AsyncStorage.setItem('activeDraws', JSON.stringify(activeDraws));
            }
        } catch (e) {
            // handle error
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{
                alignSelf: 'center',
                top: 0,
                width: Dimensions.get('window').width,
                zIndex: 9999,
                position: 'absolute',
                height: Dimensions.get('window').height,
                left: 0,
                backgroundColor: 'white',
                right: 0,
                bottom: 0,
                flex: 1,
            }}>
                <SafeAreaView style={{
                    width: '100%',
                    flex: 1,
                    alignItems: 'center',
                    padding: dimensions.width * 0.0590432,
                    position: 'relative',
                }}>
                    <View style={{
                        zIndex: 1000,
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        width: '95%',
                    }}>
                        <TouchableOpacity style={{

                        }} onPress={onClose}>
                            <Image
                                source={require('../assets/images/backImage.png')}
                                style={{
                                    width: dimensions.width * 0.19,
                                    height: dimensions.height * 0.08,
                                }}
                                resizeMode='contain'
                            />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Image
                                source={selectedVolcano.image}
                                style={{
                                    width: dimensions.width * 0.4,
                                    height: dimensions.width * 0.4,
                                }}
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        marginTop: dimensions.height * 0.05,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Animated.View
                            style={{
                                width: dimensions.width,
                                height: dimensions.width * 0.59,
                                backgroundColor: 'white',
                                overflow: 'hidden',
                                // ВАЖЛИВО: scale першим, потім translate!
                                transform: [
                                    { scale: scale },
                                    { translateX: pan.x },
                                    { translateY: pan.y },
                                ],
                            }}
                            {...(mode === 'zoom'
                                ? zoomPanResponder.panHandlers
                                : mode === 'paint'
                                    ? paintPanResponder.panHandlers
                                    : {})}
                            pointerEvents="auto"
                        >
                            <Svg
                                ref={svgRef}
                                width={dimensions.width}
                                height={dimensions.width * 0.59}
                                style={{ position: 'absolute', left: 0, top: 0 }}
                            >
                                {/* Фон: SVG або PNG/JPG */}
                                {backgroundImage && (
                                    <SvgImage
                                        x={0}
                                        y={0}
                                        width={dimensions.width}
                                        height={dimensions.width * 0.59}
                                        href={{ uri: backgroundImage }}
                                        preserveAspectRatio="none"
                                    />
                                )}
                                {/* Всі намальовані шляхи */}
                                {paths.map((p, idx) => (
                                    <Path
                                        key={idx}
                                        d={p.d}
                                        stroke={p.color}
                                        strokeWidth={4}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                ))}
                                {/* Поточний шлях */}
                                {currentPath ? (
                                    <Path
                                        d={currentPath}
                                        stroke={selectedColor}
                                        strokeWidth={4}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                ) : null}
                            </Svg>
                        </Animated.View>
                    </View>

                    <View style={{
                        height: dimensions.height * 0.12,
                        overflow: 'hidden',
                        alignItems: 'center',
                        position: 'absolute',
                        bottom: dimensions.height * 0.14,
                        borderWidth: 1,
                        width: dimensions.width * 0.12,
                        right: dimensions.width * 0.019,
                        borderRadius: dimensions.width * 0.03,
                        borderColor: 'black',
                        justifyContent: 'space-between',
                    }}>
                        <LinearGradient
                            colors={['#F5E795', '#F18C50']}
                            style={{
                                bottom: 0,
                                height: '100%',
                                justifyContent: 'center',
                                right: 0,
                                position: 'absolute',
                                top: 0,
                                alignItems: 'center',
                                left: 0,
                                width: '100%',
                            }}
                        />
                        <TouchableOpacity style={{
                            borderBottomWidth: 0.5,
                            alignItems: 'center',
                            height: '50%',
                            justifyContent: 'center',
                            width: '100%',
                            borderBottomColor: 'black',
                        }} activeOpacity={0.75} onPress={() => handleZoom('in')}>
                            <Image
                                source={require('../assets/icons/volcanoPlus.png')}
                                style={{
                                    width: '44%',
                                    height: '44%',
                                    resizeMode: 'contain',
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            borderTopWidth: 0.5,
                            height: '50%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderTopColor: 'black',
                            width: '100%',
                        }} activeOpacity={0.75} onPress={() => handleZoom('out')}>
                            <Image
                                source={require('../assets/icons/volcanoMinus.png')}
                                style={{
                                    height: '44%',

                                    resizeMode: 'contain',

                                    width: '44%',
                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* All Done button only if more than one path */}
                    {paths.length > 1 && !isAllDonePressed && (
                        <TouchableOpacity
                            style={{
                                overflow: 'hidden',
                                borderWidth: 1,
                                position: 'absolute',
                                alignItems: 'center',
                                height: dimensions.width * 0.12,
                                left: dimensions.width * 0.019,
                                width: dimensions.height * 0.12,
                                borderColor: 'black',
                                justifyContent: 'center',
                                borderRadius: dimensions.width * 0.03,
                                bottom: dimensions.height * 0.14,
                            }}
                            onPress={handleSetDone}
                        >
                            <LinearGradient
                                colors={['#F5E795', '#F18C50']}
                                style={{
                                    bottom: 0,
                                    height: '100%',
                                    right: 0,
                                    alignItems: 'center',
                                    position: 'absolute',
                                    top: 0,
                                    justifyContent: 'center',
                                    left: 0,
                                    width: '100%',
                                }}
                            />
                            <Text style={{
                                alignSelf: 'center',
                                fontSize: dimensions.width * 0.05,
                                textAlign: 'center',
                                color: 'black',
                                fontFamily: fonts.sofiaSansBold,
                            }}>
                                All Done
                            </Text>
                        </TouchableOpacity>
                    )}

                    {!isAllDonePressed && (
                        <View style={{
                            bottom: dimensions.height * 0.05,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            justifyContent: 'space-between',
                            width: '95%',
                        }}>
                            {selectedVolcano.colors.map((color: string, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        opacity: mode === 'zoom' ? 0.5 : 1,
                                        backgroundColor: color,
                                        alignItems: 'center',
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: selectedColor === color ? 'black' : 'transparent',
                                        width: dimensions.width / selectedVolcano.colors.length - dimensions.width * 0.016,
                                        justifyContent: 'center',
                                        height: dimensions.width / selectedVolcano.colors.length - dimensions.width * 0.016,
                                    }}
                                    onPress={() => {
                                        if (mode === 'paint') handleColorChange(color);
                                    }}
                                    disabled={mode === 'zoom'}
                                >
                                    <Text style={{
                                        fontFamily: fonts.sofiaSansBold,
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: dimensions.width / selectedVolcano.colors.length * 0.5,
                                        color: 'black',
                                    }}>
                                        {index + 1}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback >
    );
};
export default DrowVolcanoPageModal;

