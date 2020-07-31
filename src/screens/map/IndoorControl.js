import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text } from 'react-native'

const IndoorControl = (props) => {
    const flooChangeHandler = (level) => {
        console.log("Clicked:" +level);
        props.onPress(level);
    }

    console.log(props.levels)
    return (
        <View style={styles.indoorControl}>
            {
                props.levels.map((level, key) => (
                    <View 
                        style={styles.controlTab}
                        key={key}
                    >
                        <TouchableOpacity
                            key={key}
                            onPress={() => flooChangeHandler(level)}
                        >
                            <Text 
                                style={styles.levelText}>
                                    {level}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))
            }
        </View>
    );
}

const styles = StyleSheet.create({
    indoorControl:{
        position:"absolute",
        bottom:20,
        right:16,
        zIndex:3,
        padding:4,
        flex:1,
        width:48,
        backgroundColor:"white",
        padding:0,
        overflow:"hidden"
    },
    controlTab:{
        position:"relative",
        backgroundColor:"white",
        height:39,
        width:48,
        borderWidth:2,
        borderColor:"#ddd",
        paddingVertical:4,
        paddingHorizontal:5,
        fontSize:15
    },
    levelText:{
        color:"red",
        fontWeight:"900",
        textAlign:"center"
    }
});

export default IndoorControl;