import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  StatusBar,
  Keyboard
} from 'react-native';
import {SettingApp} from '../appConfig';
import {AsyncStorage} from 'react-native';

export default class HomeScreen extends React.Component {

  static navigationOptions = {
    title: 'Home',
    gesturesEnabled: false,
  };

  state = { // สร้างตัวแปรสำหรับเก็บข้อมูล username password
    username: "",
    password: "",
  }

  componentDidMount = async() => {
    const { navigation } = this.props
    try { //ดึงข้อมูลจาก localstorage และเช็คว่ามีข้อมูลหรือไม่ ถ้ามีให้เข้าไปที่หน้าต่อไปเลย
      const value = await AsyncStorage.getItem('@User');
      if (value !== null) {
        let temp = JSON.parse(value) // แปลงค่าที่ได้เป็น json
        // เช็คว่าเป็นคนขับหรือไม่ถ้าเป็นไปหน้า WorkTime ถ้าไม่ใช้ให้ไป Menu
        if(temp.driver == '1')navigation.navigate('WorkTime')
        else navigation.navigate('Menu')
      }
    } catch (error) {
      console.log(error)
    }
  }



  fetchData = async () => { // Login Function
    let { username, password } = this.state;
    const { navigation } = this.props
    // ส่งค่าไปหลังบ้านเพื่อเช็คข้อมูล Login 
    const response = await fetch(`${SettingApp}/user?username='${username}'&password='${password}'`) 
    const users = await response.json();//นำข้อมูลที่ได้มาใส่ในตัวแปรรูปแบบ Json
    Keyboard.dismiss() //ปิดคีย์บอร์ด

    if (users.length > 0) { //ถ้ามีข้อมูลมากกว่า 1 ตัว
      try { //เก็บค่าใน Localstorage
        await AsyncStorage.setItem('@User', JSON.stringify(users[0])); 
      } catch (error) {
        console.log(error)
        // Error saving data
      }
      Alert.alert('Welcome to Where App')
      // เช็คว่าเป็นคนขับหรือไม่
      if(users[0].driver == '1')navigation.navigate('WorkTime')
      else navigation.navigate('Menu')
    }
    else Alert.alert('Plase Try Angian')
  }


  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.welcomeContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.welcomeImage}
          />
          <TextInput
            placeholder='Email'
            style={styles.InputStyle}
            keyboardType='email-address'
            onChangeText={(username) => this.setState({ username })}
            value={this.state.username}
          />
          <TextInput
            placeholder='Password'
            style={styles.InputStyle}
            onChangeText={(password) => this.setState({ password })}
            value={this.state.password}
            secureTextEntry={true}
          />

          <TouchableOpacity
            style={styles.loginScreenButton}
            underlayColor='#fff'
            onPress={() => this.fetchData()}
          >
            <Text style={styles.SignInBT}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.FlexSignUp} >
            <Text style={styles.SignUpText1}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}  >
              <Text style={styles.SignUpText2}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    );
  }


}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 3,
    justifyContent: 'center',
    alignItems: "center",
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 3,
    marginBottom: 10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  InputStyle: {
    width: 330,
    height: 50,
    backgroundColor: 'rgb(240, 240, 240)',
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 20,
    paddingLeft: 20,
    fontSize: 20,
    color: 'grey'
  },
  loginScreenButton: {
    width: 330,
    height: 50,
    marginRight: 40,
    marginLeft: 40,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgb(29, 25, 204)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff'
  },
  SignInBT: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  ForgotBT: {
    fontSize: 18,
    color: 'rgb(29, 25, 204)',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 25,
  },
  FlexSignUp: {
    marginTop: 130,
    flexDirection: "row"
  },
  SignUpText1: {
    fontSize: 18,
    color: 'lightgrey',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 25,

  },
  SignUpText2: {
    fontSize: 18,
    color: 'rgb(29, 25, 204)',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 25,
  }
});
