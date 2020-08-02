import React from 'react'; 
import {TouchableHighlight, StyleSheet, View, Text} from 'react-native';

const RoundButton = (props) => {
    return (
        <TouchableHighlight
            onPress={props.onPress}
        >
            <View 
                style={styles.button}
            >
                <Text style={styles.buttonText}>{props.text}</Text>
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    button:{
        borderRadius:35,
        backgroundColor:"#2e2e2e",
        height:70,
        width:70,
        marginLeft:"40%",
        alignItems:"center",
        justifyContent:"center"
    },
    buttonText:{
        color:"#fff",
        fontWeight:"700"
    }
});

export default RoundButton;