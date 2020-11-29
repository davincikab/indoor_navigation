import React from 'react';
import PropTypes from 'prop-types';

import {
    View, Dimensions,
    StyleSheet, Text, FlatList, TouchableOpacity, Image
} from 'react-native';

import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

import getDirections from '../utils/routing/RouteDirection';

export default class DirectionsControl extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCollapsed:false,
            path:{},
            directions:[],
            time:null,
            distance:null,
            audioOn:false,
            start:false,
            end:false,
            activeDirection:{},
            recognized:false,
            language:'en-US',
            voice:'',
        };

        this.textToSpeech.bind(this);

        Tts.setDefaultLanguage(this.state.language);
        Tts.setDefaultRate(0.4);
    }
  
    // tts
    textToSpeech() {
        const { activeDirection, directions } = this.state;

        Tts.voices().then(vc => {
          // console.log(vc);
          vc.forEach(v => {
            if(v.language.includes("en-US")) {
            //   console.log(v);
            }
          });
        });
        
        console.log("Active Direction speak")
        console.log(activeDirection.item.from);

        if(activeDirection.isViewable) {
            let textInfo = activeDirection.item.turn;

            if(activeDirection.index == 0) {
                textInfo =  "From " + textInfo + " walk " + activeDirection.item.distance + " metres";
               
            } else if( activeDirection.index == directions.length -1) {
                textInfo = 'You have arrived at your destination: ' + textInfo;
            } else {
                textInfo = textInfo + " and Walk " + activeDirection.item.distance + " metres";
            }

            Tts.speak(textInfo);


            
        }
        
    }
  
    toggleLanguageAndVoice() {
        let voice = this.state.voice == "sw" ? "en-US" : "sw";
        let language = this.state.language == "sw-KE" ? "en-US" : "sw-KE";
  
        // check network connection
        this.setState({
          language,
          voice
        });
    }

    onViewableItemsChanged = ({viewableItems, changed}) => {
        console.log("Active Item");
        console.log(changed);

        if(viewableItems[0]) {
            this.setState({
                activeDirection:changed[0]
            }, () => {
                if(this.state.audioOn) {
                    this.textToSpeech();
                }
                
                this.props.onPress(this.state.activeDirection.item)
            });
        }
        
        
    }

    onAudioPress = () => {
        const { audioOn } = this.state;

        this.setState({
            audioOn:!audioOn
        }, () => {
            if(!this.state.audioOn) {
                Tts.stop();
            } else {
                this.textToSpeech();
            }
        });

        // update the
    }

    getIcon = (angle) => {
        if(!Boolean(angle)) {
            return require("../../assets/images/up-arrow.png");
        } else if (angle == 0) {
            return require("../../assets/images/up-arrow.png");
        } else if (angle < 180) {
            return require("../../assets/images/turn-left.png");
        } else {
            return require("../../assets/images/turn-right.png");
        }
    }

    onItemPress = (item) => {
        console.log("Item Press")
        console.log(item);
        this.props.onPress(item);
    }

    renderItem = ({ item, index }) => {
        const { directions } = this.state;

        // console.log("Item index:" +index);

        let turn, icon;
        if(index == 0) {
            icon = require("../../assets/images/icon.png");
            turn = item.from;
        } else if( index == directions.length -1) {
            icon = require("../../assets/images/icon.png")
            turn = item.from;
        } else {
            let angle = item.bearing - directions[index-1].bearing;
            angle = angle < 0 ? angle + 2 * 180 : angle;

            turn = !Boolean(angle) ? "Head Straight": angle == 0  ? "Head Straight" : angle < 180 ? 'Turn Left' : "Turn Right";
            icon = this.getIcon(angle);
        }

        item.turn = turn;
        let distance = item.distance ? item.distance + " metres" : '';

        return (
            <TouchableOpacity style={styles.directionItem} onPress={() => this.onItemPress(item)}>
                <Image style={styles.image} source={icon} />
                <View>
                    <Text style={styles.place}>{turn}</Text>
                    <Text style={styles.distance}>{distance}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    componentDidMount() {
        const {isCollapsed, path} = this.props;
        let directions = getDirections(path);

        console.log(directions);
        this.setState({
            isCollapsed:isCollapsed,
            path:path,
            directions:directions,
            distance:path.properties.distance,
            time:path.properties.time
        });
    }

    componentWillUnMount() {
        Voice.destroy().then(Voice.removeAllListeners());
        Tts.stop();
    }   

    render() {
        const { isCollapsed, directions, time, distance, audioOn} = this.state;
        let zIndex = isCollapsed ? 0 : 3;
        return (
            <View style={{
                    zIndex:zIndex,
                    ...styles.containerStyle
                }}
            >   
                <View style={styles.summary}>
                    <View style={styles.summaryTab}>
                        <Text style={[styles.summaryText,styles.timeText]}>{time}</Text>
                        <Text style={[styles.summaryText,styles.distanceText]}>({distance} m)</Text>
                    </View>

                    <View style={styles.audioControl}>
                        <TouchableOpacity onPress={this.onAudioPress}>
                            <Image 
                                source={
                                    audioOn ? require("../../assets/images/volume.png") : require("../../assets/images/mute.png")
                                } 
                            />
                        </TouchableOpacity>
                    </View>
                    {/* audio */}
                </View>                
                {directions[0] &&
                    <>
                        <Text>Steps</Text>

                        {/* HORIZONTAL */}
                        <FlatList
                            style={styles.stepsTab}
                            data={directions}
                            keyExtractor={item => item.from}
                            renderItem={this.renderItem}
                            horizontal={true}
                            onViewableItemsChanged={this.onViewableItemsChanged}
                        />
                    </>
                }
            </View>
        )
    }
}   

DirectionsControl.propTypes = {
    path:PropTypes.object.isRequired,
    isCollapsed:PropTypes.bool,
    onPress:PropTypes.func.isRequired
}

DirectionsControl.defaultProps = {
    isCollapsed:true
}

const styles = StyleSheet.create({
    containerStyle:{
        flex:1,
        bottom:0,
        backgroundColor:"#fff",
        left:0,
    },
    directionItem:{
        width:300,
        justifyContent:'flex-start',
        alignItems:'center',
        paddingVertical:5,
        paddingHorizontal:10,
        backgroundColor:"#fff",
        flexDirection:'row',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderBottomColor:'#CBD000',
        marginRight:35
    },
    image:{
        // height:24,
        // width:24,
        marginRight:10,
        resizeMode:'contain'
    },
    place:{
        fontSize:18,
        fontWeight:"600"
    },
    distance:{
        fontSize:15
    },
    summary:{
        justifyContent:"space-between",
        flexDirection:"row",
        alignItems:'center',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderBottomColor:'#ddd'
    },
    summaryTab:{
        justifyContent:'flex-start',
        flexDirection:"row",
        alignItems:'center',
        backgroundColor:"#fff",
        padding:10,
    },
    summaryText:{
        fontSize:20
    },
    audioControl:{
        marginRight:20
    },
    timeText:{
        color:'#156504',
        marginRight:10,
        fontSize:21,
        fontWeight:"700"
    },
    distanceText:{
        color:'#525252'
    },
    stepsTab:{
        paddingVertical:5,
        paddingHorizontal:15
    }
});