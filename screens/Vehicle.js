import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Button
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { AsyncStorage } from "react-native";
import { SettingApp } from "../appConfig";
import moment from "moment";
import "moment/locale/th"; // without this line it didn't work

moment.locale("th");

export default class Vehicle extends React.Component {
  static navigationOptions = {
    title: "เลือกพาหนะ",
    gesturesEnabled: false,
  };

  state = {
    VehicleData: [],
    User: ""
  };

  componentDidMount = async () => {
    try {
      const value = await AsyncStorage.getItem("@User");
      if (value !== null) {
        await this.setState({
          User: JSON.parse(value)
        });
      }
    } catch (error) {
      console.log(error);
    }
    this.fetchData();
  };

  fetchData = async () => {
    // ส่งข้อมูลเพื่อดึงค่่าพาหนะของ User ทั้งหมด 
    let { User } = this.state;
    const response = await fetch(`${SettingApp}/getVehicle?user_id=${User.user_id}`);
    const VehicleData = await response.json();

    this.setState({ VehicleData });
  };

  // ฟังชั่นเลือกพาหนะที่ต้องการใช้
  onSelectVehicle = async data => {
    const { navigation } = this.props;
    Alert.alert(
      `กรุณายืนยัน`,
      `คุณต้องการเปลี่ยนพาหนะเป็น ${data.Vehicle_Name} ใช่หรือไม่?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () =>
            axios({ // ส่งค่า Vehicle_ID รถที่ต้องการและ user_id 
              url: `${SettingApp}/selectVehicle`,
              method: "post",
              data: {
                Vehicle_ID: `'${data.Vehicle_ID}'`,
                user_id: `${this.state.User.user_id}`
              },
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              }
            })
              .then(function(response) {
                AsyncStorage.getItem("@User") // เปลี่ยนค่าใน Localstorage สำหรับรถที่เลือกใช้ 
                  .then(dataStorage => {
                    dataStorage = JSON.parse(dataStorage);
                    console.log({ dataStorage });
                    dataStorage.Vehicle_ID = data.Vehicle_ID;
                    dataStorage.Vehicle_Name = data.Vehicle_Name;
                    dataStorage.Vehicle_Type = data.Vehicle_Type;
                    console.log({ dataStorage });
                    AsyncStorage.setItem("@User", JSON.stringify(dataStorage));
                  })
                  .done();
                console.log(response.status);
                if (response.status == 200)
                  Alert.alert("เปลี่ยนพาหนะเรียบร้อย");
                navigation.navigate("WorkTime");
              })
              .catch(function(error) {
                console.log(error);
              })
        }
      ],
      { cancelable: false }
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView>
          {this.state.VehicleData.map((items, key) => {
            return (
              <TouchableOpacity
                style={styles.card}
                key={key}
                onPress={() => this.onSelectVehicle(items)}
              >
                <View
                  style={{
                    width: 100,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                {  items.Vehicle_Type == "Bus" && <Image
                  style={styles.image}
                  source={require(`../assets/icon/icon_Bus.png`)}
                />}
                {  items.Vehicle_Type == "Boat" && <Image
                  style={styles.image}
                  source={require(`../assets/icon/icon_Boat.png`)}
                />}
                {  items.Vehicle_Type == "Van" && <Image
                  style={styles.image}
                  source={require(`../assets/icon/icon_Van.png`)}
                />}
                {  items.Vehicle_Type == "Truck" && <Image
                  style={styles.image}
                  source={require(`../assets/icon/icon_Truck.png`)}
                />}
                </View>
                <View style={{ width: 150, justifyContent: "center" }}>
                  <Text style={styles.content}>
                    ชื่อพาหนะ : {items.Vehicle_Name}
                  </Text>
                  <Text style={styles.content}>
                    ประเภทพาหนะ : {items.Vehicle_Type}{" "}
                  </Text>
                  <Text style={styles.content}>
                    สถานะ : {items.BreakDown_Status == 0 ? "ปกติ" : "พาหนะเสีย"}
                  </Text>
                </View>
                <View
                  style={{
                    width: 100,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {items.Active == "1" && (
                    <Image
                      style={{ width: 30, height: 30 }}
                      source={require(`../assets/icon/check.png`)}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    flex: 3,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: 10,
    paddingEnd: 10,
    borderRadius: 10,
    width: 350,
    // boxShadow: 0px 4px 3px 0px rgba(222,222,222,1),
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "rgba(222,222,222,1)",
    shadowOpacity: 0.5,
    shadowRadius: 10
  },
  title: {
    fontSize: 18,
    marginBottom: 5,
    fontSize: 14
  },
  MonthTitle: {
    fontSize: 18,
    marginTop: 15,
    fontWeight: "bold"
  },
  image: {
    width: 60,
    height: 60
  },
});
