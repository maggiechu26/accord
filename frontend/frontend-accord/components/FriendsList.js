import React, {Component } from 'react';
import { Modal, Image, ListView, View, Dimensions, Text, StyleSheet, TouchableHighlight, TouchableOpacity, Alert } from 'react-native';
import FriendsProfileBio from './FriendsProfileBio';
import { List, ListItem, Button } from 'react-native-elements'
const _ = require('underscore');
import firebase from 'firebase';
import { connect } from 'react-redux';
import { loadCurrentFriendInfo } from '../actions/index';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class FriendsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      currentFriendProf: {},
      currentFriendId: '',
      data: [],
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    };
  }

  componentWillMount() {
    this._genRows();
  }

  _root: Object;

  _onPressProfile = () => {
    this.setState({visible: true});
  }

  _fetchFriendList(myUserId){
    const data = [];
    fetch('https://us-central1-accord-18bdf.cloudfunctions.net/route/user/friends/' + myUserId)
    .then((response) => response.json())
    .then((responseJson) => {
        for (var i = 0; i < responseJson.length; i++) {
          data.push(responseJson[i]);
        }
        this.setState({
          data,
          dataSource: this.state.dataSource.cloneWithRows(data),
      });
   })
   .catch((err) => {
     console.log('error', err)
   });
  }

  _genRows = () => {
    // var myUserId = this.props.signedIn.split('.')[0];
    var myUserId = this.props.user.email.split('.')[0];
    this._fetchFriendList(myUserId);
    var self = this;
   firebase.database().ref(`/User/${myUserId}/friends`).on('value', function(friendsSnap){
      self._fetchFriendList(myUserId);
   });
  };

  setModalVisible(visible) {
    this.setState({visible: visible});
  }

  whenAvatarClicked(nickname){
    const profile = _.findWhere(this.state.data, {nickname: nickname});
    this.setState({currentFriendProf: profile, currentFriendId: profile.email.split('.')[0]});
    this._onPressProfile();
  }

  _renderRow = obj => { //render our data
    return (
      <TouchableOpacity onPress={() => this.whenAvatarClicked(obj.nickname)}>
        <View style={styles.row}>
          <Text style={styles.text}>{obj.nickname}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  scrollTo = (...args: any) => this._root.scrollTo(...args);

  render() {
    return (
      <View>
      <Text style={{color: '#fffff', alignItems: 'center'}}>Friends</Text>
      <ListView
        {...this.props}
        removeClippedSubviews={false}
        contentContainerStyle={styles.container}
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        ref={el => (this._root = el)}
      />
        <Modal style={styles.modal}
        animationType={"slide"}
        transparent={false}
        visible={this.state.visible}
        onRequestClose={() => this.setState({visible: false})}
        >
          <View style={{flex: 1, backgroundColor: "#000000"}}>
          <View style={{flex: 13, justifyContent: 'space-around', alignItems: 'center', backgroundColor: "#000000"}}>
             <Text style={styles.profileText}>Profile of {this.state.currentFriendProf.nickname}</Text>
             <Image style={{width:200 , height: 200, borderRadius: 100}} source={{uri: this.state.currentFriendProf.img}} />
             <Text style={styles.text}>Nickname: {this.state.currentFriendProf.nickname}</Text>
             <Text style={styles.text}>School: {this.state.currentFriendProf.school}</Text>
             <Text style={styles.text}>Description: {this.state.currentFriendProf.desc}</Text>
             <Text style={styles.text}>Gender: {this.state.currentFriendProf.gender}</Text>
           </View>
             <View style={{flex: 1, flexDirection: 'row'}}>
             <TouchableOpacity
               onPress={() => {this.setModalVisible(!this.state.visible);
                 this.props.navigator.navigate('FriendsChatScreen', {
                  //  username1: this.props.signedIn.split('.')[0],
                  username1: this.props.user.email.split('.')[0],
                   username2: this.state.currentFriendId,
                  //  userObj: this.props.signedinuserObject,
                  userObj: this.props.user,
                    friendObj: this.state.currentFriendProf,
                    navigator: this.props.navigator
                  })

               } }
               style={{backgroundColor: "#6ADAA8", flex: 1, borderRightWidth: 1, color: 'white', justifyContent: 'center', alignItems: 'center'}}
               >
               <Text style={{color: 'white'}}>
                 Chat
               </Text>
             </TouchableOpacity>
             <TouchableOpacity
               onPress={() => this.setModalVisible(!this.state.visible)}
               style={{backgroundColor: "red", flex: 1, borderLeftWidth: 1, color: 'white', justifyContent: 'center', alignItems: 'center'}}
               >
               <Text style={{color: 'white'}}>
                 Close
               </Text>
             </TouchableOpacity>
           </View>
           </View>
      </Modal>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  modal: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileText:{
    color: '#6adaa8',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 20,
    fontSize: 30
  },
  row: {
    margin: 8,
    padding: 16,
    borderRadius: 4,
    backgroundColor: '#6adaa8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const mapStateToProps = ({ user, currentFriend }) => {
	return { user, currentFriend };
};

const mapDispatchToProps = (dispatch) => {
	return {
		loadFriend: (currentFriendJson) => {
			loadCurrentFriendInfo(dispatch, currentFriendJson);
		}
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendsList);
