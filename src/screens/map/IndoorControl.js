import React , { useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Text, Image} from 'react-native';
import RoundButton from '../../library/RoundButton';

const IndoorControl = (props) => {
    const [isCollapsed, setCollapsed ] = useState(false);
    const [controlIndex, setControlIndex] = useState(0)

    const flooChangeHandler = (level) => {
        console.log("Clicked:" +level);
        props.onPress(level);
    }

    const hideToolbar = () => {
        // Working with 
        console.log("Hiding toolbar");
        setCollapsed(!isCollapsed);
    };


    console.log(isCollapsed);
    return (
        <View style={styles.indoorControl}>
            <RoundButton
                onPress={props.onToggleGeocoder}
                text="Go"
            />

            <TouchableOpacity
                onPress={hideToolbar}
                style={styles.controlTab}
            >
                <Image
                    style={styles.caretImage}
                    source={isCollapsed?require('../../../assets/down.png'):require('../../../assets/up.png')}
                />
            </TouchableOpacity>
            {   isCollapsed &&
                props.levels.map((level, key) => (
                        <TouchableOpacity
                            style={styles.controlTab}
                            key={key}
                            onPress={() => flooChangeHandler(level)}
                        >
                            <Text 
                                style={styles.levelText}>
                                    {level}
                            </Text>
                        </TouchableOpacity>
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
        zIndex:1,
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
        fontSize:15,
        display:"flex",
        alignItems:'center',
        justifyContent:"center"
    },
    levelText:{
        color:"#2e2e2e",
        fontWeight:"900",
        textAlign:"center"
    },
    caretImage:{
        height:30,
        width:22
    }
});

export default IndoorControl;