import React , { useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Text, Image} from 'react-native';
import RoundButton from 'library/RoundButton';
import PropTypes from 'prop-types';

const IndoorControl = ({levels, activeLevel, onPress, onToggleGeocoder}) => {
    const [isCollapsed, setCollapsed ] = useState(false);
    const [controlIndex, setControlIndex] = useState(0)

    const flooChangeHandler = (level) => {
        console.log("Clicked:" +level);
        onPress(level);
    }

    const hideToolbar = () => {
        // Working with 
        console.log("Hiding toolbar");
        setCollapsed(!isCollapsed);
    };


    console.log(isCollapsed);

    return (
        <View 
            style={{
                flex:1,
                position:"absolute",
                bottom:20,
                right:10,
            }}
        >
        <RoundButton
                onPress={onToggleGeocoder}
                text="Go"
                styles={{
                    height:35,
                    width:46,
                    marginLeft:2,
                    borderRadius:10,
                    marginBottom:5
                }}
        />
        <View style={styles.indoorControl}>
            

            <TouchableOpacity
                onPress={hideToolbar}
                style={styles.controlTab}
            >
                <Image
                    style={styles.caretImage}
                    source={isCollapsed?require('../../../assets/images/down.png'):require('../../../assets/images/up.png')}
                />
            </TouchableOpacity>
            {   isCollapsed &&
                levels.map((level, key) => (
                        <TouchableOpacity
                            style={[
                                styles.controlTab,
                                (level == activeLevel ? styles.activeTab : {})
                            ]}
                            key={key}
                            onPress={() => flooChangeHandler(level)}
                        >
                            <Text 
                                style={[
                                    styles.levelText,
                                    (level == activeLevel ? styles.activeText : {})
                                ]}
                            >
                                {level}
                            </Text>
                        </TouchableOpacity>
                ))
            }
        </View>
        </View>
    );
}

IndoorControl.propTypes = {
    levels:PropTypes.arrayOf(PropTypes.number.isRequired),
    activeLevel:PropTypes.number.isRequired,
    onPress:PropTypes.func.isRequired,
    onToggleGeocoder:PropTypes.func.isRequired
};

IndoorControl.defualtProps = {
    activeLevel:''
};

const styles = StyleSheet.create({
    indoorControl:{
        zIndex:1,
        padding:4,
        flex:1,
        width:48,
        backgroundColor:"transparent",
        padding:0,
        overflow:"hidden"
    },
    controlTab:{
        position:"relative",
        backgroundColor:"white",
        height:39,
        width:46,
        borderRadius:10,
        borderWidth:StyleSheet.hairlineWidth,
        borderColor:"#ddd",
        paddingVertical:4,
        paddingHorizontal:5,
        fontSize:15,
        display:"flex",
        alignItems:'center',
        justifyContent:"center",
        margin:1
    },
    activeTab:{
        backgroundColor:'#252525'
    },
    activeText:{
        color:'#fff'
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