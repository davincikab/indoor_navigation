import React from 'react'; 
import {TouchableHighlight, StyleSheet, View, Text} from 'react-native';

const RoundButton = (props) => {
    return (
        <TouchableHighlight
            onPress={props.onPress}
        >
            <View 
                style={{
                    ...props.styles,
                    ...styles.button
                }}
            >
                <Text style={styles.buttonText}>{props.text}</Text>
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    button:{
        backgroundColor:"#2e2e2e",
        alignItems:"center",
        justifyContent:"center"
    },
    buttonText:{
        color:"#fff",
        fontWeight:"700"
    }
});

export default RoundButton;