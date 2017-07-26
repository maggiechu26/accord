import React, {Component} from 'react';
import { Text, AsyncStorage } from 'react-native';
import Swipers from '../components/swiper';
import { connect } from 'react-redux';
import { loadStoredUserInfo } from '../actions/index';

class WelcomeScreen extends Component {
  goToSignUp = () => {
    this.props.navigation.navigate('Auth');
  }

  goToLogIn = () => {
    this.props.navigation.navigate('Login');
  }

  componentDidMount() {
    // add if statement here to check if reducer already has something on initial login
    // if user is not initialized in the store, then g
    if(JSON.stringify(this.props.user) === '{}'){
      AsyncStorage.getItem('user')
      .then((result) => {
        // result will be null by default (different than the state)
        // TODO: where do we setItem to null?
        if (JSON.parse(result)) {
          this.props.addStoredUser(JSON.parse(result));
          this.props.navigation.navigate('AllScreen');
        }
      })
      .catch((err) => {
        console.log('error w/ AsyncStorage', err);
      })
    }


  }

  render() {
    return(
      <Swipers
          goToSignUp={this.goToSignUp}
          goToLogIn={this.goToLogIn}
       />
    )
  }
}

const mapStateToProps = ({user}) => {
	return {user};
};

const mapDispatchToProps = (dispatch) => {
	return {
		addStoredUser: (userJson) => {
			return loadStoredUserInfo(dispatch, userJson);
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeScreen);
