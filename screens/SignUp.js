import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Image,
  StatusBar
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { SettingApp } from "../appConfig";

export default class ShowMap extends React.Component {
  static navigationOptions = {
    title: "Sign Up",
    gesturesEnabled: false
  };

  //สร้างตัวแปรสำหรับเก็บข้อมูล
  state = {
    username: "",
    password: "",
    re_password: "",
    Firstname: "",
    Lastname: "",
    address: "",
    Phone_num: ""
  };


  
  RegisFuction = async () => {
    const { navigation } = this.props;
    let {
      username,
      password,
      re_password,
      Firstname,
      Lastname,
      address,
      Phone_num
    } = this.state;
    // เช็คว่า Password ตรงกันหรือไม่
    if (password != re_password) {
      Alert.alert("รหัสผ่านไม่ถูกต้อง");
    } else {
    // เช็คข้อมูลว่าครบมั้ย
      if (
        username == "" ||
        password == "" ||
        re_password == "" ||
        Firstname == "" ||
        Lastname == "" ||
        address == "" ||
        Phone_num == ""
      ) {
        Alert.alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      } else {
        // ส่งค่าเข้าไปในหลังบ้าน
        await axios({
          url: `${SettingApp}/regis`,
          method: "post",
          data: {
            username: `'${username}'`,
            password: `'${password}'`,
            Firstname: `'${Firstname}'`,
            Lastname: `'${Lastname}'`,
            address: `'${address}'`,
            Phone_num: `'${Phone_num}'`
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        })
          .then(function(response) {
            console.log(response.status);
            if (response.status == 200) {
              Alert.alert("Register Successfully"); // แสดง Pop up
              navigation.navigate("Home"); //กลับไปที่หน้า Home
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    }
  };

  render() {
    return (
      <KeyboardAwareScrollView>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.welcomeContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.welcomeImage}
            />
            <TextInput
              placeholder="Email"
              style={styles.InputStyle}
              keyboardType="email-address"
              onChangeText={username => this.setState({ username })}
              value={this.state.username}
            />
            <TextInput
              placeholder="Password"
              style={styles.InputStyle}
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
              secureTextEntry={true}
            />
            <TextInput
              placeholder="Re-Password"
              style={styles.InputStyle}
              onChangeText={re_password => this.setState({ re_password })}
              value={this.state.re_password}
              secureTextEntry={true}
            />
            <TextInput
              placeholder="Firstname"
              style={styles.InputStyle}
              onChangeText={Firstname => this.setState({ Firstname })}
              value={this.state.Firstname}
            />
            <TextInput
              placeholder="Lastname"
              style={styles.InputStyle}
              onChangeText={Lastname => this.setState({ Lastname })}
              value={this.state.Lastname}
            />
            <TextInput
              placeholder="Address"
              style={styles.InputStyle}
              onChangeText={address => this.setState({ address })}
              value={this.state.address}
            />
            <TextInput
              placeholder="Phone Number"
              style={styles.InputStyle}
              keyboardType="phone-pad"
              onChangeText={Phone_num => this.setState({ Phone_num })}
              value={this.state.Phone_num}
              maxLength={10}
            />

            <TouchableOpacity
              style={styles.loginScreenButton}
              underlayColor="#fff"
              onPress={() => this.RegisFuction()}
            >
              <Text style={styles.Submit}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 3,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  welcomeContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20
  },
  InputStyle: {
    width: 330,
    height: 50,
    backgroundColor: "rgb(240, 240, 240)",
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 20,
    paddingLeft: 20,
    color: "grey"
  },
  loginScreenButton: {
    width: 330,
    height: 50,
    marginRight: 40,
    marginLeft: 40,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "rgb(29, 25, 204)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff"
  },
  Submit: {
    fontSize: 20.0,
    color: "#fff",
    textAlign: "center",
    paddingLeft: 10,
    paddingRight: 10
  },
  welcomeImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginTop: 3,
    marginBottom: 10
  }
});
