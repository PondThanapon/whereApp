import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions
} from "react-native";
import moment from "moment";
import "moment/locale/th"; // without this line it didn't work
import styled from "styled-components";
import { SettingApp } from "../appConfig";
import { AsyncStorage } from "react-native";
import axios from "axios";

moment.locale("th");

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    header: null,
    gesturesEnabled: false,
  };

  state = {
    openMenu: false, // เปิด menu
    time: moment().format("HH:mm"), // เก็บค่าเวลา ณ ปัจจุบัน
    status: "start", // สถานะการทำงาน
    BreakDown: false, // สถานะพาหนะ
    User: "", // ค่า User
    WT_ID : 0, // ค่า ID ของ Worktime ใน Database
    latlng: { // ตำแหน่งสำหรับ Update ใน Database
        latitude: 0,
        longitude: 0
      },
  };


  componentDidMount = async () => {
    try { // นำค่าใน Localstorage มาเก็บไว้
      const value = await AsyncStorage.getItem("@User");
      if (value !== null) {
        await this.setState({ User: JSON.parse(value) });
      }
    } catch (error) {
      console.log(error);
    }

    this.fetchData();
    // เรียกใช้งานทุก 1 วิ
    this.intervalID = setInterval(() => this.tick(), 1000);
    // เรียกใช้งานทุก 5 วิ
    this.intervalID = setInterval(() => this.onUpdateLocation(), 5000);
  };

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  
  tick = async () => {
    // ดึงข้อมูลจาก localStorage
    try {
      const value = await AsyncStorage.getItem("@User");
      if (value !== null) {
        await this.setState({ User: JSON.parse(value) });
      }
    } catch (error) {
      console.log(error);
    }
    // เปลี่ยนเวลาเป็นเวลาปัจจุบัน
    this.setState({
      time: moment().format("HH:mm")
    });
  };


  // ดึงข้อมูลตำแหน่งปัจจุบันของ User Code เป็น Pattle ของ getLocation
  getLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      position => {
          console.log('in')
        let latlng = {
          latitude: parseFloat(JSON.stringify(position.coords.latitude)),
          longitude: parseFloat(JSON.stringify(position.coords.longitude))
        }
        this.setState({ latlng })
      },
      error => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )
    this.watchID = await navigator.geolocation.watchPosition(position => {
      let latlng = {
        latitude: parseFloat(JSON.stringify(position.coords.latitude)),
        longitude: parseFloat(JSON.stringify(position.coords.longitude))
      }
      this.setState({ latlng })
    })
  }

  /// อัพเดทตำแหน่งใน Database
  onUpdateLocation = async() => {
    let {User, latlng} = this.state
    console.log("in ========")
    await this.getLocation()
    // ส่งข้อมูลตำแหน่งไปยัง Database
    axios({
        url: `${SettingApp}/UpdateLocation`,
        method: "post",
        data: {
          Vehicle_ID: `${User.Vehicle_ID}`,
          lat: `${latlng.latitude}`,
          lon: `${latlng.longitude}`
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(function(response) {
            console.log(response.status);
            if (response.status == 200) {
                console.log('updateLocation')
            }
        })
        .catch(function(error) {
          console.log(error);
    });
  }


  fetchData = async () => {
    // ดึงข้อมูลสถานะจาก Database
    const response = await fetch(
      `${SettingApp}/CheckWorkStatus?user_id='${this.state.User.user_id}'`
    ); 
    const CheckWorkStatus = await response.json();

    // ดึงข้อมูลรถที่ใช้อยู่ปัจจุบันจาก Database
    const responseVehicle = await fetch(`${SettingApp}/getVehicleQuery?Vehicle_ID='${CheckWorkStatus[0].Vehicle_ID}'`); 
    const VehicleData = await responseVehicle.json();

    // เก็บค่า
    this.setState({ 
      // status ถ้าเป็น 0 = ทำงานอยู่ , 1 = จบงานแล้วเตรียมเริ่มงานใหม่
      status: CheckWorkStatus[0].status == 0 ? "end" : "start", 
      // ดึงค่า ID ของ worktime ล่าสุด
      WT_ID :  CheckWorkStatus[0].WT_ID,
      // status พาหนะรถ ถ้าเป็น 0 = ปกติ , 1 = รถเสีย
      BreakDown : VehicleData[0].BreakDown_Status == 1 ? true : false 
    });
  };

  // ปุ่มทำงาน
  Working = async() => {
    let { status, User, WT_ID } = this.state;
    // เช็คสถานะของ Status การทำงาน 
    if (status == 'start') {
      // ถ้าเป็น Start ให้กดเพื่อเริ่มทำงาน ส่งค่าไปยัง APi StartWorking โดยส่ง  Vehicle_ID พาหนะที่ใช้ และ user_id
      await axios({
        url: `${SettingApp}/StartWorking`,
        method: "post",
        data: {
          Vehicle_ID: `'${User.Vehicle_ID}'`,
          user_id: `${User.user_id}`
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(function(response) {
          console.log(response.status);
          if (response.status == 200) {      
            Alert.alert("เปลี่ยนสถานะเริ่มงานเรียบร้อย")
        }
        })
        .catch(function(error) {
          console.log(error);
        });
    } else {
      // ถ้าเป็น End ให้กดเพื่อจบการทำงาน ส่งค่าไปยัง APi EndWorking โดยส่ง  Vehicle_ID พาหนะที่ใช้ และ WT_ID
        await axios({
            url: `${SettingApp}/EndWorking`,
            method: 'post',
            data: {
              Vehicle_ID: `'${User.Vehicle_ID}'`,
              WT_ID: `'${WT_ID}'`,
            },
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }
          })
            .then(function (response) {
              console.log(response.status);
                if (response.status == 200) {
                    Alert.alert('เปลี่ยนสถานะจบการทำงานเรียบร้อย')
                }
            })
            .catch(function (error) {
              console.log(error);
            })
    }
    this.setState({ status: this.state.status == "start" ? "end" : "start" });
    await this.fetchData() 
  };

  //เปลี่ยนสถานะพาหนะ ปกติ / เสีย
  onBreakDown = async() => {
    const { navigation } = this.props;
    let { BreakDown, User, WT_ID } = this.state;
    let status = 0;
    Alert.alert(
      `กรุณายืนยัน`,
      `คุณต้องการเปลี่ยนสถานะพาหนะ ใช่หรือไม่?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async() => {
              // this.setState({ BreakDown: !this.state.BreakDown })
            // ถ้าสถานะ BreakDown == false ให้กดเพื่อเปลี่ยนเป็นพาหนะเสีย
            if (BreakDown == false) {
              await Alert.alert(
                `กรุณายืนยัน`,
                `คุณต้องการเปลี่ยนสถานะพาหนะ ใช่หรือไม่?`,
                [
                  {
                    text: "ลางจูง",
                    onPress: async() => {
                      console.log('ลากจูง')
                      await axios({
                        url: `${SettingApp}/StartBreakDown`,
                        method: "post",
                        data: {
                          WT_ID: `'${WT_ID}'`,
                          Vehicle_ID: `'${User.Vehicle_ID}'`,
                          status: `1`,
                          user_id: `'${User.user_id}'`
                        },
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json"
                        }
                      })
                        .then(function(response) {
                          console.log(response.status);
                            if (response.status == 200){ 
                              Alert.alert('เปลี่ยนสถานะพาหนะเรียบร้อย')
                              this.setState({ BreakDown: !this.state.BreakDown});
                            }
                        })
                        .catch(function(error) {
                          console.log(error);
                        });
                    }
                  },
                  {
                    text: "สามารถซ่อมได้",
                    onPress: async() => {
                      console.log('ซ่อมได้')
                      await axios({
                        url: `${SettingApp}/StartBreakDown`,
                        method: "post",
                        data: {
                          WT_ID: `'${WT_ID}'`,
                          Vehicle_ID: `'${User.Vehicle_ID}'`,
                          status: `0`,
                          user_id: `'${User.user_id}'`
                        },
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json"
                        }
                      })
                        .then(function(response) {
                          console.log(response.status);
                            if (response.status == 200){ 
                              Alert.alert('เปลี่ยนสถานะพาหนะเรียบร้อย')
                              this.setState({ BreakDown: !this.state.BreakDown});
                            }
                        })
                        .catch(function(error) {
                          console.log(error);
                        });
                    }
                  }
                ],
                { cancelable: false }
                );
              console.log('breakdown!!!!')
            } 
            else {
              // ถ้าสถานะ BreakDown == true ให้กดเพื่อเปลี่ยนเป็นพาหนะปกติ
              console.log('end')
              await axios({
                  url: `${SettingApp}/EndBreakDown`,
                  method: 'post',
                  data: {
                    Vehicle_ID: `${User.Vehicle_ID}`,
                    // WT_ID: `'7'`,
                  },
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  }
                })
                  .then(function (response) {
                    console.log(response.status);
                    if (response.status == 200){ 
                      Alert.alert('เปลี่ยนสถานะพาหนะเรียบร้อย')
                      this.setState({ BreakDown: !this.state.BreakDown});
                    }
                  })
                  .catch(function (error) {
                    console.log(error);
                  })
                }
                  // Alert.alert('เปลี่ยนสถานะพาหนะเรียบร้อย')
                  this.setState({ BreakDown: !this.state.BreakDown});
              }
            }
          ],
          { cancelable: false }
          );
          // await this.fetchData()
          console.log("BreakDown ::: ",this.state.BreakDown)
  };

  
  onLogOut = () => {
    const { navigation } = this.props;
    Alert.alert(
      `กรุณายืนยัน`,
      `คุณต้องการออกจากระบบใช่หรือไม่?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            AsyncStorage.clear(); //ลบค่าใน Localstorage
            navigation.navigate("Home"); //เปลี่ยนไปหน้า Home
          }
        }
      ],
      { cancelable: false }
    );
  };

  render() {
    const { navigation } = this.props;
    const { User } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.showDate}>
          {moment().format("วันdddd D MMMM ")}{" "}
          {parseInt(moment().format("YYYY")) + 543}
        </Text>
        <Text style={styles.showVehicle}>
          พาหนะที่ใช้ {User.Vehicle_Name}
          {"\n"}
          ประเภท {User.Vehicle_Type}
        </Text>
        <WorkingButton
          status={this.state.status}
          underlayColor="#fff"
          onPress={() => this.Working()}
        >
          <Text style={styles.WorkingBT}>
            
            {this.state.status == "start" ? "เข้างาน" : "ออกงาน"}
          </Text>
        </WorkingButton>

        <Text style={styles.showCompany}>{User.Company}</Text>
        <Text style={styles.showTime}>
          {/* {moment().format('HH:mm')} */}
          {this.state.time}
        </Text>
        <BreakdownButton
          onPress={() => this.onBreakDown()}
          BreakDown={this.state.BreakDown}
        >
          <Text style={styles.BreakdownText}>พาหนะเสีย</Text>
        </BreakdownButton>
        <MenuSlide
          openMenu={this.state.openMenu}
          onPress={() => this.setState({ openMenu: !this.state.openMenu })}
        >
          <TextMenuSlide openMenu={this.state.openMenu}>
            {User.Firstname} {User.Lastname}
          </TextMenuSlide>
          {this.state.openMenu && (
            <>
              <View style={styles.Line} />
              <View style={styles.ViewFlex}>
                <HistoryBTScreen
                  margin="20"
                  onPress={() => navigation.navigate("History")}
                >
                  <Text style={styles.HistoryBT}>ประวัติ</Text>
                </HistoryBTScreen>
                <HistoryBTScreen onPress={() => navigation.navigate("Profile")}>
                  <Text style={styles.HistoryBT}>ข้อมูลส่วนตัว</Text>
                </HistoryBTScreen>
              </View>

              <View style={styles.ViewFlex}>
                {/* <HistoryBTScreen
                  margin="20"
                  onPress={() => navigation.navigate("Vehicle")}
                >
                  <Text style={styles.HistoryBT}>พาหนะ</Text>
                </HistoryBTScreen> */}
                <HistoryBTScreen onPress={() => this.onLogOut()}>
                  <Text style={styles.HistoryBT}>ออกจากระบบ</Text>
                </HistoryBTScreen>
              </View>
            </>
          )}
        </MenuSlide>
      </View>
    );
  }
}

let width = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 3,
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 150
  },
  showDate: {
    fontSize: 25,
    color: "grey"
  },
  showCompany: {
    fontSize: 20,
    color: "grey"
  },
  showVehicle: {
    fontSize: 20,
    color: "grey",
    textAlign: "center"
  },
  showTime: {
    fontSize: 70,
    color: "rgb(29, 25, 204)"
  },
  WorkingBT: {
    fontSize: 50,
    color: "rgb(29, 25, 204)",
    textAlign: "center",
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: "900"
  },
  Line: {
    width: 40,
    height: 3,
    backgroundColor: "rgb(71, 69, 245)",
    top: 0,
    position: "absolute",
    borderRadius: 50,
    marginTop: 10
  },
  HistoryBT: {
    fontSize: 20,
    color: "rgb(29, 25, 204)",
    textAlign: "center"
  },
  ViewFlex: {
    alignItems: "center",
    flexDirection: "row"
  },
  BreakdownText: {
    fontSize: 25,
    color: "#fff"
  }
});

const WorkingButton = styled(TouchableOpacity)`
    width: 250;
    height: 250;
    marginRight: 40;
    marginLeft: 40;
    marginTop: 10;
    paddingTop: 10;
    paddingBottom: 10;
    backgroundColor: #fff;
    borderRadius: 200;
    borderWidth: 10;
    borderColor: ${props => props.status == 'start' ? 'pink' : 'rgb(29,25,204)'};
    justifyContent: center;
    alignItems: center;
`


const MenuSlide = styled(TouchableOpacity)`
    width: ${width};
    height: ${props => props.openMenu ? 450 : 120};
    position:absolute;
    bottom:-20;
    backgroundColor: 'rgb(29,25,204)';
    borderRadius:${props => props.openMenu ? 60 : 200};;
    borderBottomEndRadius :  ${props => props.openMenu ? 0 : 200};
    borderBottomStartRadius :  ${props => props.openMenu ? 0 : 200};
    borderWidth: 0;
    justifyContent: flex-start;
    alignItems: center;
    paddingTop : 15;
`;

const TextMenuSlide = styled(Text)`
    fontSize: 25;
    color: #fff;
    textAlign: center;
    paddingLeft: 10;
    paddingRight: 10;
    marginTop: ${props => props.openMenu ? 30 : 20};
    marginBottom : 30;
`
const HistoryBTScreen = styled(TouchableOpacity)`
    width: 120;
    height: 130;
    backgroundColor: pink;
    borderRadius: 40;
    justifyContent: center;
    alignItems: center;
    marginTop : 10;
    marginRight : ${props => props.margin || 0};
`;

const BreakdownButton = styled(TouchableOpacity)`
    width: 250;
    height: 60;
    backgroundColor: ${props => props.BreakDown ? '#cc0e0e' : '#c7c7c7'};
    borderRadius: 40;
    justifyContent: center;
    alignItems: center;
`;