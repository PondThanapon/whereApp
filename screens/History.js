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
  StatusBar
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { SettingApp } from "../appConfig";
import { AsyncStorage } from "react-native";
import moment from "moment"; 
import "moment/locale/th"; // without this line it didn't work
moment.locale("th");

export default class History extends React.Component {

  static navigationOptions = { 
    title: "ประวัติการทำงาน", //ชื่อด้านบนแอป
    gesturesEnabled: false,  // ปิดการ Back
  };

  state = { 
    historyData: [], //สร้างตัวแปรเก็บค่าประวัติที่ดึงมาจาก Database
    User : '' //เก็บค่า User จาก Localstorage
  };

  componentDidMount = async() => {
    try { // ดึงค่าจาก Localstrage
      const value = await AsyncStorage.getItem("@User");
      if (value !== null) {
        await this.setState({ User: JSON.parse(value) });
      }
    } catch (error) {
      console.log(error);
    }

    this.fetchData(); // เรียกฟังชั่น Fetchdata
  };

  fetchData = async () => {
    let {User} = this.state 
    const response = await fetch( //สร้างตัวแปรสำหรับเรียกดูค่า History ใน Database โดยค้นหาจาก User_id
      `${SettingApp}/WorkStatusHistory?user_id=${User.user_id}`
    ); 
    const historyData = await response.json(); // แปลงค่าที่รับมาเป็น Json

    this.setState({ historyData }); // เก็บค่าลงใน State
  };

  render() {
    let Month = []; //สร้างตัวแปรสำหรับเก็บค่าเดือน

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" /> 
        {/* เปลี่ยนสี status bar ให้เป็นสีดำ */}

        {/* <Text style={styles.title}>ประวัติการทำงาน</Text> */}
        <ScrollView>

          {this.state.historyData.map((items, key) => { // นำค่าในที่ดึงมาจาก Database มาวนลูปเพื่อสร้าง Card
            var dataDateTimeIn = items.Time_In.split(" "); // ใช้คำสั่ง split แยกระหว่างวันที่ กับเดือน
            var dataDateTimeOut =
              items.Time_Out != null //สร้างเงื่อนไขเช็คว่ามีเวลาออกหรือยัง
                ? items.Time_Out.split(" ") // ใช้คำสั่ง split แยกระหว่างวันที่ กับเดือน
                : "ยังไม่ออกงาน";

            // เช็คว่าถ้ายังไม่ออกจากงานให้แสดง "ยังไม่ออกงาน" แต่ถ้าออกแล้วให้ใส่ค่าเวลาที่ออก
            let timeOut = dataDateTimeOut != "ยังไม่ออกงาน" && dataDateTimeOut[1];
            let textMonth = `${moment(dataDateTimeIn[0]).format( // เปลี่ยน Format ให้เป็น 10 มกราคม 2563
              "MMMM "
            )} ${parseInt(moment(dataDateTimeIn[0]).format("YYYY")) + 543}`;

            var findIfExist = Month.indexOf(textMonth); //หาเดือนที่ซ้ำ
            if (findIfExist == -1) Month.push(textMonth); // ถ้าไม่เจอเดือนทีี่ซ้ำให้เก็บค่าเดือนนั้นลงในตัวแปร
            return (
              <View key={key}>
                {findIfExist == -1 && (
                  <Text style={styles.MonthTitle}>{textMonth}</Text>
                )}
                <View style={styles.card} key={key}>
                  <View
                    style={{
                      width: 100,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    {
                    items.Vehicle_Type == "Bus" && (
                      <Image
                        style={styles.image}
                        source={require(`../assets/icon/icon_Bus.png`)}
                      />
                    )}
                    {items.Vehicle_Type == "Boat" && (
                      <Image
                        style={styles.image}
                        source={require(`../assets/icon/icon_Boat.png`)}
                      />
                    )}
                    {items.Vehicle_Type == "Van" && (
                      <Image
                        style={styles.image}
                        source={require(`../assets/icon/icon_Van.png`)}
                      />
                    )}
                    {items.Vehicle_Type == "Truck" && (
                      <Image
                        style={styles.image}
                        source={require(`../assets/icon/icon_Truck.png`)}
                      />
                    )}
                  </View>
                  <View>
                    <Text style={styles.content}>
                      {moment(dataDateTimeIn[0]).format("วันdddd D MMMM ")}
                      {parseInt(moment(dataDateTimeIn[0]).format("YYYY")) + 543}
                    </Text>
                    <Text style={styles.content}>
                      เวลาเข้างาน : {dataDateTimeIn[1]} น.
                    </Text>
                    <Text style={styles.content}>
                      เวลาออกงาน : {timeOut || "ยังไม่ออกงาน"}
                    </Text>
                    <Text style={styles.content}>
                      พาหนะที่ใช้ : {items.Vehicle_Name}
                    </Text>
                    <Text style={styles.content}>
                      เวลาทำงาน : {items.workTime} ชม.
                    </Text>
                  </View>
                </View>
              </View>
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
  }
});
