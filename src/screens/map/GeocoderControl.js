import React, { useState } from 'react';
import {View, TextInput, FlatList, StyleSheet, SafeAreaView} from 'react-native';

const GeocoderControl = (props) => {
    const [startAddress, setStartAddress] = useState('');
    const [destination, setDestination] = useState('');
    const [addresses, setAddress] = useState();

    const filterAddress = (address) => {
        // get the address matching the query
    };

    const onStartLocationChange = (event) => {
        // setStartAddress(event);
        filterAddress();
    };

    const onDestinatioLocationChange = (event) =>{
        // setDestination(event);
        filterAddress();
    };

    // update the addresses
    const onFocus = () => {
        
    }   

    // flatlist items
    const renderItem = (item) => {

    }


    return (
        <View
        style={styles.geocoderView}
        >
            <TextInput
                style={styles.formControl}
                key={'start'}
                onChange={onStartLocationChange}

            ></TextInput>

            <TextInput
                style={styles.formControl}
                key={"destination"}
                onChange={onDestinatioLocationChange}
            ></TextInput>

            {/* Results View */}
            <SafeAreaView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    geocoderView:{
        flex:1,
        position:"absolute",
        top:4,
        left:10,
        right:10,
        zIndex:1,
    },
    formControl:{
        paddingHorizontal:12,
        paddingVertical:5,
        backgroundColor:"white",
        borderColor:"#ddd",
        borderWidth:2
    }
});

export default GeocoderControl;