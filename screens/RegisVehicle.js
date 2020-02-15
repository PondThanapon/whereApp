import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Alert,
    Image,
    StatusBar
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import axios from 'axios';
import { Dropdown } from 'react-native-material-dropdown';

import { SettingApp } from '../appConfig';

export default class ShowMap extends React.Component {

    static navigationOptions = {
        title: '',
        gesturesEnabled: false,
    };

    state = { 
        Vehicle_Name: "", //ชื่อ
        Vehicle_Type: "Bus",//ประเภท
        Vehicle_BusLine: "",//สาย
        dataBusLine: [],//ข้อมูลสาย
        busLine: [],//
    }

    componentDidMount = () => {
        this.fetchData()
    }



    RegisFuction = async () => {
        const { navigation } = this.props
        let {
            Vehicle_Name,
            Vehicle_Type,
            Vehicle_BusLine,
            busLine
        } = this.state;

        // แยกระหว่างชื่อสายกับเลขสาย
        var temp = Vehicle_BusLine.split(".");
        index = busLine.findIndex(x => x.busline_name == temp[0]);
        // เช็คว่ากรอกข้อมูลครบมั้ย
        if (Vehicle_Name == "" || (Vehicle_Type == 'bus' && Vehicle_BusLine == "")) {
            Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน')
        }
        else {
            // เช็คค่าประเภทเพื่อนำค่ามาใส่
            let tempBuslineCode = Vehicle_Type === 'bus' || Vehicle_Type === 'van'  ? `${busLine[index].busline_code}` : '0'
            // ใส่ค่าใน Database
            axios({
                url: `${SettingApp}/regisVehicle`,
                method: 'post',
                data: {
                    Vehicle_Name: `'${Vehicle_Name}'`,
                    Vehicle_Type: `'${Vehicle_Type}'`,
                    busline_code: `'${tempBuslineCode}'`,
                    user_id: `'1'`,
                },
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            })
                .then(function (response) {
                    console.log(response.status);
                    if (response.status == 200) Alert.alert('ลงทะเบียนพาหนะเรียบร้อย')
                    navigation.navigate('WorkTime')
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }



    fetchData = async () => {
        //ดึงค่า Busline จาก Database
        const response = await fetch(`${SettingApp}/busLine`)
        // แปลงเป็น Json
        const busLine = await response.json()

        let dataBusLine = []
        // นำค่ามาวนลูปเพื่อใส่ค่าใน Combobox
        busLine.map(item => {
            console.log(item.busline_detail)
            dataBusLine.push({
                value: `${item.busline_name}. ${item.busline_detail}`,
                key: item.busline_code
            })
        })



        await this.setState({ dataBusLine, busLine })
    }



    render() {

        // สร้างตัวแปรสำหรับเก็บ Type เพ่่ื่อนำไปใช้ใน Combobox
        let data = [{
            value: 'Bus',
        }, {
            value: 'Van',
        }, {
            value: 'Truck',
        }, {
            value: 'Boat',
        }];


        return (
            <KeyboardAwareScrollView>
                <StatusBar barStyle="dark-content" />
                <View style={styles.container}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.welcomeImage}
                    />
                    <Text style={styles.TextTopic}>ลงทะเบียนพาหนะ</Text>
                    <TextInput
                        placeholder='Vehicle Name'
                        style={styles.InputStyle}
                        onChangeText={(Vehicle_Name) => this.setState({ Vehicle_Name })}
                        value={this.state.Vehicle_Name}
                    />
                    <Dropdown
                        label='Vehicle Type'
                        data={data}
                        containerStyle={{ width: 330, backgroundColor: 'rgb(240, 240, 240)', borderRadius: 25, paddingStart: 10, paddingEnd: 10, marginTop: 10, marginBottom: 20, }}
                        value={this.state.Vehicle_Type}
                        onChangeText={(Vehicle_Type) => this.setState({ Vehicle_Type })}
                    />
                    {
                        this.state.Vehicle_Type == "Bus" &&
                        <Dropdown
                            label='Vehicle Type'
                            data={this.state.dataBusLine}
                            containerStyle={{ width: 330, backgroundColor: 'rgb(240, 240, 240)', borderRadius: 25, paddingStart: 10, paddingEnd: 10, marginTop: 10 }}
                            value={this.state.Vehicle_BusLine}
                            onChangeText={(Vehicle_BusLine) => this.setState({ Vehicle_BusLine })}
                        />
                    }




                    <TouchableOpacity
                        style={styles.SubmitScreenButton}
                        underlayColor='#fff'
                        onPress={() => this.RegisFuction()}
                    >
                        <Text style={styles.Submit}>Submit</Text>
                    </TouchableOpacity>

                </View>
            </KeyboardAwareScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 3,
        justifyContent: 'space-between',
        alignItems: "center",
        marginTop: 50,
    },
    welcomeContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    InputStyle: {
        width: 330,
        height: 50,
        backgroundColor: 'rgb(240, 240, 240)',
        borderRadius: 25,
        marginTop: 10,
        marginBottom: 20,
        paddingLeft: 20,
        color: 'grey'
    },
    SubmitScreenButton: {
        width: 330,
        height: 50,
        marginRight: 40,
        marginLeft: 40,
        marginTop: 80,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: 'rgb(29, 25, 204)',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#fff'
    },
    Submit: {
        fontSize: 20.0,
        color: '#fff',
        textAlign: 'center',
        paddingLeft: 10,
        paddingRight: 10
    },
    welcomeImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginTop: 3,
        marginBottom: 10,
    },
    TextTopic: {
        fontSize: 40,
        color: 'rgb(29, 25, 204)',
        marginTop: 40,
        marginBottom: 40,
    }
});

