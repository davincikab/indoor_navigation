import React, { useState, useEffect } from 'react';
import {View, TextInput, FlatList, StyleSheet, TouchableHighlight, Text, Button} from 'react-native';
import RoundButton from '../../library/RoundButton';
 
const GeocoderControl = (props) => {
    const [startAddress, setStartAddress] = useState('');
    const [destination, setDestination] = useState('');
    const [addresses, setAddress] = useState([]);
    const [indoorPoints, setIndoorPoints] = useState(props.data);
    const [controlIndex, setControlIndex] = useState(props.controlIndex);

    // update the zIndex
    useEffect(() => {
        console.log("GeocoderIndex: " + props.controlIndex);
        setControlIndex(props.controlIndex);
    }, [props.controlIndex]);


    // filter addresses
    const filterAddress = (inputText) => {
        // get the address matching the query
        console.log(inputText);
        let address = JSON.parse(JSON.stringify(indoorPoints));

        address.features = address.features.filter(feature => {
            if(feature.properties.Name.toLowerCase().includes(inputText.toLowerCase())){
                return feature;
            }
        });
   
        if(address.features.length > 10) {
            setAddress(address.features.slice(0,15));
        }else{
            setAddress(address.features);
        }
        
    };

    const onStartLocationChange = (text) => {
        // setStartAddress(event);
        setStartAddress(text);

        if(!text) {
            setAddress([]);
            return;
        }

        console.log("Text Input: " + text);
        filterAddress(text); 
    };

    const onDestinatioLocationChange = (text) =>{
        console.log(text)
        setDestination(text);

        if(!text) {
            setAddress([]);
            return;
        }
        filterAddress(text);
    };

    // update the addresses
    const onFocus = () => {
        
    }   

    // On item press
    const onItemPress = (item) => {
        console.log(item.properties.Name);
        setStartAddress(item.properties.Name);
    }

    const calculateRoute = () => {
        // spinner update the path

        // hide this component
        setControlIndex(0);
    }

    // flatlist items
    const renderItem = ({index, item}) => {
        return (
            <TouchableHighlight
                onPress={() => onItemPress(item)}
            >
                <View
                    style={{
                        backgroundColor: "#fff",
                        ...styles.resultItem
                    }}
                >
                    <Text
                        style={styles.textBold}
                    >
                        {item.properties.Name}
                    </Text>
                    <Text
                        style={styles.textSmall}
                    >
                        Floor {item.properties.level}, {item.properties.block}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }



    return (
        <View
            style={{
                zIndex:controlIndex,
                ...styles.geocoderView
            }}
        >
            <TextInput
                style={styles.formControl}
                key={'start'}
                placeholder={"Current Location ...."}
                onChangeText={text => onStartLocationChange(text)}
                value={startAddress}
            ></TextInput>

            <TextInput
                style={styles.formControl}
                key={"destination"}
                placeholder={"Destination Location ...."}
                onChangeText ={text => onDestinatioLocationChange(text)}
                value={destination}
            ></TextInput>

            {/* Results View */}
            <View
                style={ styles.resultsView}
            >
                {
                    addresses[0] &&
                    <FlatList
                        data={addresses}
                        renderItem={renderItem}
                        keyExtractor={item => item.properties.fid.toString()}
                    />
                }
                
            </View>
            {
                Boolean(destination) && Boolean(startAddress) &&
                <RoundButton
                    onPress={calculateRoute}
                    text="Go home"
                />
             }
        </View>
    );
}

const styles = StyleSheet.create({
    geocoderView:{
        display:"none",
        flex:0,
        position:"absolute",
        top:4,
        left:0,
        right:0,
        bottom:0,
        backgroundColor:'white'
    },
    formControl:{
        paddingHorizontal:12,
        paddingVertical:5,
        backgroundColor:"white",
        borderColor:"#ddd",
        borderWidth:0.5,
        borderTopWidth:0,
        borderLeftWidth:0,
        borderRightWidth:0,
        marginHorizontal:20
    },
    resultsView:{
        flex:0.8,
        backgroundColor:'white',
        // height:450,
        marginTop:10
        // paddingHorizontal:30
    },
    resultItem:{
        paddingVertical:5,
        borderTopWidth:1,
        borderColor:"#ddd",
        paddingHorizontal:30
    },
    textBold:{
        fontSize:15,
        fontWeight:"800",
        fontStyle:"normal",
        color:"#2e2e2e"
    },
    textSmall:{
        fontSize:14,
        color:"#ddd",
        fontStyle:"italic"
    }
});

export default GeocoderControl;