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
import { AsyncStorage } from "react-native";

export default class Profile extends React.Component {
  static navigationOptions = {
    title: "Profile",
    gesturesEnabled: false,
  };

  state = {
    User: "",
    username: "",
    Firstname: "",
    Lastname: "",
    address: "",
    Phone_num: "",
    driver : 0
  };

  componentDidMount = async () => {
    try { //ดึงค่าจาก Localstorage
      const value = await AsyncStorage.getItem("@User");
      if (value !== null) {
        await this.setState({ //นำค่าใน Localstorage มาใส่ไว้ในตัวแปร
          User: JSON.parse(value),
          username: JSON.parse(value).username,
          Firstname: JSON.parse(value).Firstname,
          Lastname: JSON.parse(value).Lastname,
          address: JSON.parse(value).address,
          Phone_num: JSON.parse(value).Phone_num,
          driver: JSON.parse(value).driver
        });
        console.log(this.state.User);
      }
    } catch (error) {
      console.log(error);
    }

    this.fetchData(); //เรียกฟังชั่น
  };

  fetchData = async () => {
    //ดึงค่าจาก Database มาเพื่อแสดงในแต่ละฟิล
    const response = await fetch(
      `${SettingApp}/user?user_id=${this.state.User.user_id}`
    ); 
    const users = await response.json();
    //นำค่าที่ได้เก็บไว้ในตัวแปรที่ตั้งไว้
    this.setState({
      username: users[0].username,
      Firstname: users[0].Firstname, 
      Lastname: users[0].Lastname,
      address: users[0].address,
      Phone_num: users[0].Phone_num
    });

    console.log(this.state);
  };

  submitFuction = async () => { 
    const { navigation } = this.props;
    let { Firstname, Lastname, address, Phone_num, driver, User } = this.state;

    //เช็คว่าข้อมูลครบมั้ย
    if (Firstname == "" || Lastname == "" || address == "" || Phone_num == "") {
      Alert.alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    } else {
      //ส่งค่าไปที่หลังบ้านเพื่อเปลี่ยนข้อมูลส้วนตัว
      axios({
        url: `${SettingApp}/editProfile`,
        method: "post",
        data: {
          user_id: `${User.user_id}`,
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
          if (response.status == 200)
            // นำค่าจาก Localstorage มาเปลี่ยนแปลง
            AsyncStorage.getItem("@User")
              .then(dataStorage => {
                dataStorage = JSON.parse(dataStorage);
                console.log({ dataStorage });
                dataStorage.Firstname = Firstname;
                dataStorage.Lastname = Lastname;
                dataStorage.address = address;
                dataStorage.Phone_num = Phone_num;
                console.log({ dataStorage });
                AsyncStorage.setItem("@User", JSON.stringify(dataStorage));
              })
              .done();
          Alert.alert("แก้ไขข้อมูลส่วนตัวเรียบร้อย");

              //ถ้าเป็น Driver ไปที่หน้า WorkTime ถ้าไม่ใช่ไปที่หน้า Menu
          if (driver == "1") navigation.navigate("WorkTime");
          else navigation.navigate("Menu");
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  };

  render() {
    return (
      <KeyboardAwareScrollView>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.welcomeImage}
          />

          <Text style={styles.TextTitle}> username </Text>
          <TextInput
            placeholder="username"
            style={styles.InputFixStyle}
            // keyboardType="email-address"
            onChangeText={username => this.setState({ username })}
            value={this.state.username}
            editable={false}
          />
          <Text style={styles.TextTitle}> Firstname </Text>
          <TextInput
            placeholder="Firstname"
            style={styles.InputStyle}
            onChangeText={Firstname => this.setState({ Firstname })}
            value={this.state.Firstname}
          />
          <Text style={styles.TextTitle}> Lastname </Text>
          <TextInput
            placeholder="Lastname"
            style={styles.InputStyle}
            onChangeText={Lastname => this.setState({ Lastname })}
            value={this.state.Lastname}
          />
          <Text style={styles.TextTitle}> Address </Text>
          <TextInput
            placeholder="Address"
            style={styles.InputStyle}
            onChangeText={address => this.setState({ address })}
            value={this.state.address}
          />
          <Text style={styles.TextTitle}> Phone Number </Text>
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
            onPress={() => this.submitFuction()}
          >
            <Text style={styles.Submit}>ยืนยัน</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80
  },
  welcomeContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20
  },
  TextTitle : {
    fontSize:20,
    width: 330,
    marginTop: 10,
    marginBottom: 10,
    color: "grey"
  },
  InputStyle: {
    fontSize:20,
    width: 330,
    height: 50,
    backgroundColor: "rgb(240, 240, 240)",
    borderRadius: 25,
    marginBottom: 20,
    paddingLeft: 20,
    color: "grey"
  },
  InputFixStyle: {
    fontSize:20,
    width: 330,
    height: 50,
    backgroundColor: "rgb(240, 240, 240)",
    borderRadius: 25,
    marginBottom: 20,
    paddingLeft: 20,
    color: "lightgrey"
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
    borderColor: "#fff",
    marginBottom: 40
  },
  Submit: {
    fontSize: 20.0,
    color: "#fff",
    textAlign: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  welcomeImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginTop: -20,
    marginBottom: 10
  }
});
