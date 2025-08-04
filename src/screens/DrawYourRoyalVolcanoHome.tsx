import {
  Keyboard,
  ImageBackground,
  Dimensions,
  StyleSheet,
  Platform,
  SafeAreaView,
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import DrowVolcanoPageModal from '../components/DrowVolcanoPageModal';

import DrawYourRoyalVolcanoDrawsHistory from './DrawYourRoyalVolcanoDrawsHistory';

import DrawYourRoyalVolcanoSettings from './DrawYourRoyalVolcanoSettings';

import React, { useState } from 'react';

type drawHomeScreenTab = 'DrawHome' | 'Settings' | 'All Draws';

import drawYourRoyalButtonsBottom from '../components/drawYourRoyalButtonsBottom';
const DrawYourRoyalVolcanoHome: React.FC = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [drowVolcanoModalVisible, setDrowVolcanoModalVisible] = useState(false);
  const [drawActiveVolcanoTab, setDrawActiveVolcanoTab] = useState<drawHomeScreenTab>('DrawHome');
  const [selectedVolcano, setSelectedVolcano] = useState<any | null>(null);

  const drowWolcanoCards = [
    {
      id: 1,
      image: require('../assets/images/drowCards/volcanoDraw1.png'),
      whiteImage: require('../assets/images/drowCards/volcanoWhiteDraw1.png'),
      colors: [
        '#9CA6AF',
        '#B1BCC4',
        '#89929B',
        '#5F666D',
        '#6B737C',
        '#778089',
        '#6893BE',
        '#66AAED',
        '#7FC8F4',
        '#F2AA36',
        '#EFE926',
      ]
    },
    {
      id: 2,
      image: require('../assets/images/drowCards/volcanoDraw2.png'),
      whiteImage: require('../assets/images/drowCards/volcanoWhiteDraw2.png'),
      colors: [
        '#B0CE84',
        '#81A586',
        '#81A586',
        '#526652',
        '#5F666D',
        '#6B737C',
        '#F2AA36',
        '#EF7F1B',
        '#ED4C14',
      ]
    },
    {
      id: 3,
      image: require('../assets/images/drowCards/volcanoDraw3.png'),
      whiteImage: require('../assets/images/drowCards/volcanoWhiteDraw3.png'),
      colors: [
        '#526652',
        '#688C53',
        '#688C53',
        '#60874D',
        '#79A361',
        '#6F9959',
        '#E1EFF4',
        '#C4D1D6',
        '#B9C3C6',
        '#9EA6A8',
      ]
    },
    {
      id: 4,
      image: require('../assets/images/drowCards/volcanoDraw4.png'),
      whiteImage: require('../assets/images/drowCards/volcanoWhiteDraw4.png'),
      colors: [
        '#F2AA36',
        '#66544F',
        '#7D868E',
        '#5F666D',
        '#43484C',
        '#EA8018',
        '#B5C0C9',
        '#CFDAE2',
      ]
    },
    {
      id: 5,
      image: require('../assets/images/drowCards/volcanoDraw5.png'),
      whiteImage: require('../assets/images/drowCards/volcanoWhiteDraw5.png'),
      colors: [
        '#9CA6AF',
        '#B1BCC4',
        '#89929B',
        '#5F666D',
        '#6B737C',
        '#778089',
        '#6893BE',
        '#66AAED',
        '#7FC8F4',
        '#F2AA36',
        '#EFE926',
      ]
    },
  ]

  const getWrappedIndex = (idx: number) => {
    const len = drowWolcanoCards.length;
    return ((idx % len) + len) % len;
  };

  const getVisibleCards = () => {
    const len = drowWolcanoCards.length;
    return [
      drowWolcanoCards[getWrappedIndex(currentCardIndex - 1)],
      drowWolcanoCards[getWrappedIndex(currentCardIndex)],
      drowWolcanoCards[getWrappedIndex(currentCardIndex + 1)],
    ];
  };

  const handleCardPress = (pos: number) => {
    if (pos === 0) setCurrentCardIndex(getWrappedIndex(currentCardIndex - 1));
    if (pos === 1) {
      const selected = drowWolcanoCards[currentCardIndex];
      setSelectedVolcano(selected);
      setDrowVolcanoModalVisible(true);
    }
    if (pos === 2) setCurrentCardIndex(getWrappedIndex(currentCardIndex + 1));
  };

  let yourContentDraw: React.ReactNode = null;
  if (drawActiveVolcanoTab === 'DrawHome') {
    yourContentDraw = (
      <SafeAreaView style={{
        flex: 1,
        width: dimensions.width * 0.93,
        marginTop: Platform.OS === 'android' ? dimensions.height * 0.03 : 0,
        alignSelf: 'center',
        alignItems: 'center',
      }}>
        <Image
          source={require('../assets/images/energyImages/fullEnergyImage.png')}
          style={{
            width: dimensions.width * 0.35,
            height: dimensions.height * 0.1,
            alignSelf: 'flex-end',
          }}
          resizeMode='contain'
        />
        {/* Volcano Carousel */}
        <View style={{
          marginTop: -dimensions.height * 0.1,
          width: dimensions.width,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}>
          <FlatList
            data={getVisibleCards()}
            keyExtractor={(_, idx) => idx.toString() + currentCardIndex}
            horizontal
            scrollEnabled={false}
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              width: dimensions.width,
            }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={index === 1 ? 1 : 0.7}
                onPress={() => handleCardPress(index)}
                style={{
                  marginHorizontal: -dimensions.width * 0.09,
                  zIndex: index === 1 ? 2 : 1,
                  transform: [
                    { scale: index === 1 ? 1 : 0.8 },
                  ],
                  shadowColor: '#000',
                  shadowOpacity: index === 1 ? 0.18 : 0.08,
                  shadowRadius: index === 1 ? 12 : 4,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: index === 1 ? 8 : 2,
                }}
              >
                <Image
                  source={item.image}
                  style={{
                    backgroundColor: '#fff',
                    borderColor: index === 1 ? '#F7E6A2' : '#B23B2A',
                    borderRadius: 22,
                    height: dimensions.width * (index === 1 ? 0.59 : 0.38),
                    borderWidth: 3,
                    width: dimensions.width * (index === 1 ? 0.59 : 0.38),
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          />
        </View>

        <Modal
          visible={drowVolcanoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDrowVolcanoModalVisible(false)}
        >
          <DrowVolcanoPageModal
            onClose={() => setDrowVolcanoModalVisible(false)}
            selectedVolcano={selectedVolcano}
          />
        </Modal>
      </SafeAreaView>
    );
  } else if (drawActiveVolcanoTab === 'Settings') {
    yourContentDraw = <DrawYourRoyalVolcanoSettings />;
  } else if (drawActiveVolcanoTab === 'All Draws') {
    yourContentDraw = <DrawYourRoyalVolcanoDrawsHistory
      editModalVisible={editModalVisible}
      setEditModalVisible={setEditModalVisible}
    />;
  }

  return (
    <View style={{
      backgroundColor: 'black',
      flex: 1,
      width: '100%',
      height: dimensions.height,
    }}>
      <ImageBackground
        source={require('../assets/images/volcanoBackImage.png')}
        style={{
          top: 0,
          position: 'absolute',
          right: 0,
          width: dimensions.width,
          flex: 1,
          bottom: 0,
          height: dimensions.height,
          left: 0,
        }}
        resizeMode="cover"
      />
      {yourContentDraw}
      {!editModalVisible && (
        <View style={{
          bottom: dimensions.height * 0.05,
          alignSelf: 'center',
          position: 'absolute',
        }}>
          <View style={{
            alignItems: 'center',
            paddingHorizontal: dimensions.width * 0.012,
            justifyContent: 'space-between',
            width: dimensions.width * 0.9,
            flexDirection: 'row',
          }}>
            {drawYourRoyalButtonsBottom.map((button, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setDrawActiveVolcanoTab(button.rulerName)}
              >
                <Image
                  source={drawActiveVolcanoTab === button.rulerName ? button.volcanoYellowIcon : button.volcanoRedIcon}
                  style={{
                    width: dimensions.height * 0.1,
                    height: dimensions.height * 0.1,
                  }}
                  resizeMode='contain'
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default DrawYourRoyalVolcanoHome;