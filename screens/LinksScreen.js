import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar
} from 'react-native';
import {AsyncStorage} from 'react-native';

export default class LinksScreen extends React.Component {

  static navigationOptions = {
    headerLeft: null,
    title: 'Menu',
    gesturesEnabled: false,
  };

  gotoProfile = () => {
    const { navigation } = this.props
    navigation.navigate('ShowMap')
  }

  componentDidMount = async() => {
    try {
      const value = await AsyncStorage.getItem('@User');
      if (value !== null) {
        console.log(JSON.parse(value));
      }
    } catch (error) {
      console.log(error)
    }
  }


  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.menuFlex}>
          <TouchableOpacity onPress={() => this.gotoProfile()}>
            <Image
              style={styles.LogoStyle}
              source={require('../assets/icon/menu1.png')}
            />
          </TouchableOpacity>
          <View style={styles.space} />
          <TouchableOpacity onPress={() =>  Alert.alert('coming soon...')}>
            <Image
              style={styles.LogoStyle}
              source={require('../assets/icon/menu2.png')}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.menuFlex}>
          <TouchableOpacity onPress={() => Alert.alert('coming soon...')}>
            <Image
              style={styles.LogoStyle}
              source={require('../assets/icon/menu3.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('coming soon...')}>
            <Image
              style={styles.LogoStyle}
              source={require('../assets/icon/menu4.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 2,
    justifyContent: 'center',
    alignItems: "center",
  },
  menuFlex: {
    flexDirection: "row",
  },
  LogoStyle: {
    width: 130,
    height: 130,
    marginBottom: 50,
    resizeMode: 'contain',
  },
  space: {
    width: 30
  }
});

