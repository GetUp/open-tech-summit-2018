import React from 'react';
import {
  Animated,
  Linking,
  Platform,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  Alert,
  Button
} from 'react-native';

import { Asset, LinearGradient, WebBrowser, Video, AuthSession} from 'expo';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { NavigationActions } from 'react-navigation';
import FadeIn from 'react-native-fade-in-image';
import { View as AnimatableView } from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';

import AnimatedScrollView from '../components/AnimatedScrollView';
import NavigationBar from '../components/NavigationBar';
import TalksUpNext from '../components/TalksUpNext';
import MenuButton from '../components/MenuButton';
//import VideoBackground from '../components/VideoBackground';
import { BoldText, SemiBoldText } from '../components/StyledText';
import { connectDrawerButton } from '../Navigation';
import { Colors, FontSizes, Layout } from '../constants';
import { Speakers, Talks } from '../data';
import {
  HideWhenConferenceHasStarted,
  HideWhenConferenceHasEnded,
  ShowWhenConferenceHasEnded,
} from '../utils';
import { toggleAuthenticated, loadAuthenticationAsync, withAuthedState } from '../utils/storage';

@withAuthedState
class Home extends React.Component {
  state = {
    scrollY: new Animated.Value(0),
  };

  async componentDidMount() {
    const authed = await loadAuthenticationAsync()
    this.setState({authed: authed})
    const { navigation } = this.props
    navigation.setParams({isHeaderShow: authed})
  }

  loginWithAuth0 = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    console.log(`Redirect URL (add this to Auth0): ${redirectUrl}`);
    const result = await AuthSession.startAsync({
      authUrl: `${auth0Domain}/authorize` + toQueryString({
        client_id: auth0ClientId,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri: redirectUrl,
      }),
    });

    console.log(result);
    if (result.type === 'success') {
      this.handleParams(result.params);
    }
  }

  handleParams = (responseObj) => {
    const { navigation } = this.props
    if (responseObj.error) {
      Alert.alert('Error', responseObj.error_description
        || 'something went wrong while logging in');
      return;
    }
    toggleAuthenticated()
    this.setState({authed: true})
    navigation.setParams({isHeaderShow: authed})
  }

  render() {
    const { scrollY, authed } = this.state;
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 150],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ flex: 1 }}>
        <AnimatedScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 + Layout.notchHeight / 2 }}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { useNativeDriver: true }
          )}
        >
          <View
            style={{
              backgroundColor: '#1dafec',
              padding: 10,
              paddingTop: Layout.headerHeight - 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={styles.headerVideoLayer}>
              {/*<Image
                source={require('../assets/home.jpg')}
                style={{ width: 1000, height: 200, resizeMode: 'contain' }}
                tintColor="#fff"
              />*/}
              {/*<VideoBackground />*/}
              <View style={styles.headerVideoOverlay} />
              <LinearGradient
                colors={[Colors.blue, 'transparent']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            </View>
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 320, height: 100, resizeMode: 'contain' }}
              tintColor="#fff"
            />
            <View style={styles.headerContent}>
              <ShowWhenConferenceHasEnded>
                <SemiBoldText style={styles.headerText}>
                  Thank you for joining us!
                </SemiBoldText>
                <SemiBoldText style={styles.headerText}>
                  See you in November, 2019!
                </SemiBoldText>
              </ShowWhenConferenceHasEnded>

              <HideWhenConferenceHasEnded>
                <SemiBoldText style={styles.headerText}>
                  April 23th to 27th
                </SemiBoldText>
                <SemiBoldText style={styles.headerText}>
                  Cluj, Romania
                </SemiBoldText>
              </HideWhenConferenceHasEnded>
            </View>
          </View>
          { authed &&
            <DeferredHomeContent />
          }
          { !authed &&
            <DeferredLoginContent loginWithAuth0={this.loginWithAuth0.bind(this)} />
          }
          <OverscrollView />
        </AnimatedScrollView>

        <NavigationBar
          renderLeftButton={() => <MenuButton />}
          animatedBackgroundOpacity={headerOpacity}
        />
      </View>
    );
  }

}

@withNavigation
class DeferredHomeContent extends React.Component {
  state = {
    ready: Platform.OS === 'android' ? false : true,
  };

  componentDidMount() {
    if (this.state.ready) {
      return;
    }

    setTimeout(() => {
      this.setState({ ready: true });
    }, 200);
  }

  render() {
    if (!this.state.ready) {
      return null;
    }
    return (
      <AnimatableView animation="fadeIn" useNativeDriver duration={800}>
        <TalksUpNext
          style={{ marginTop: 20, marginHorizontal: 15, marginBottom: 2 }}
        />
        <View style={{ marginHorizontal: 15, marginBottom: 20 }}>
          <TouchableOpacity onPress={this._handlePressAllTalks}>
            <SemiBoldText style={styles.seeAllTalks}>
              See all talks →
            </SemiBoldText>
          </TouchableOpacity>
        </View>

        <ClipBorderRadius>
          <RectButton
            style={styles.bigButton}
            onPress={this._handlePressAgendaButton}
            underlayColor="#fff"
          >
            <Ionicons
              name="md-chatbubbles"
              size={23}
              style={{
                color: '#fff',
                marginTop: 3,
                backgroundColor: 'transparent',
                marginRight: 5,
              }}
            />
            <SemiBoldText style={styles.bigButtonText}>
              Read The Summit Agenda
            </SemiBoldText>
          </RectButton>
        </ClipBorderRadius>

        <ClipBorderRadius>
          <RectButton
            style={styles.bigButton}
            onPress={this._handlePressMapButton}
            underlayColor="#fff"
          >
            <Ionicons
              name="md-map"
              size={23}
              style={{
                color: '#fff',
                marginTop: 3,
                backgroundColor: 'transparent',
                marginRight: 5,
              }}
            />
            <SemiBoldText style={styles.bigButtonText}>
              {Platform.OS === 'android' ? 'Download' : 'Open'} The Summit Map
            </SemiBoldText>
          </RectButton>
        </ClipBorderRadius>

        <ClipBorderRadius>
          <RectButton
            style={styles.bigButton}
            onPress={this._handlePressRepoButton}
            underlayColor="#fff"
          >
            <Ionicons
              name="logo-github"
              size={23}
              style={{
                color: '#fff',
                marginTop: 3,
                backgroundColor: 'transparent',
                marginRight: 5,
              }}
            />
            <SemiBoldText style={styles.bigButtonText}>
              This is Open Source
            </SemiBoldText>
          </RectButton>
        </ClipBorderRadius>

        <ClipBorderRadius>
          <RectButton
            style={styles.bigButton}
            onPress={this._handlePressTwitterButton}
            underlayColor="#fff"
          >
            <Ionicons
              name="logo-twitter"
              size={23}
              style={{
                color: '#fff',
                marginTop: 3,
                backgroundColor: 'transparent',
                marginRight: 5,
              }}
            />
            <SemiBoldText style={styles.bigButtonText}>
              @opentechsummit2018
            </SemiBoldText>
          </RectButton>
        </ClipBorderRadius>
      </AnimatableView>
    );
  }

  _handlePressAllTalks = () => {
    this.props.navigation.dispatch(
      NavigationActions.navigate({
        routeName: 'Schedule',
      })
    );
  };

  _handlePressAgendaButton = () => {
    WebBrowser.openBrowserAsync('https://www.the-open.net/home#collaborate');
  };

  _handlePressRepoButton = () => {
    WebBrowser.openBrowserAsync('https://github.com/GetUp/open-tech-summit-2018');
  };

  _handlePressTwitterButton = async () => {
    try {
      await Linking.openURL(`twitter://user?screen_name=GetUp`);
    } catch (e) {
      WebBrowser.openBrowserAsync('https://twitter.com/GetUp');
    }
  };

  _handlePressMapButton = () => {
    let url = Asset.fromModule(require('../assets/open-summit-map.pdf')).uri;
    if (Platform.OS === 'android') {
      Linking.openURL(url);
    } else {
      WebBrowser.openBrowserAsync(url);
    }
  };
}

const auth0ClientId = 'RLh0VMRszt3MeT0B36SK2ZL6BA4T1ckM';
const auth0Domain = 'https://getup.auth0.com';

  /**
   * Converts an object to a query string.
   */
function toQueryString(params) {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

class DeferredLoginContent extends React.Component {
  state = {
    username: undefined,
  };

  render() {
    const { loginWithAuth0 } = this.props
    return (
      <View style={styles.container}>
        {this.state.username !== undefined ?
          <Text style={styles.title}>Hi {this.state.username}!</Text> :
          <View>
            <View
              style={{
                padding: 10,
                paddingTop: Layout.headerHeight - 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View>
                <SemiBoldText>
                  Thank you for joining us!
                </SemiBoldText>
                <BoldText>
                  Please Login to Continue!
                </BoldText>
              </View>
            </View>
            <ClipBorderRadius>
              <RectButton
                style={styles.bigButton}
                onPress={() => loginWithAuth0()}
                underlayColor="#fff"
              >
                <Ionicons
                  name="md-unlock"
                  size={23}
                  style={{
                    color: '#fff',
                    marginTop: 3,
                    backgroundColor: 'transparent',
                    marginRight: 5,
                  }}
                />
                <SemiBoldText style={styles.bigButtonText}>
                  LOGIN
                </SemiBoldText>
              </RectButton>
            </ClipBorderRadius>
          </View>
        }
      </View>
    );
  }
}

const OverscrollView = () => (
  <View
    style={{
      position: 'absolute',
      top: -400,
      height: 400,
      left: 0,
      right: 0,
      backgroundColor: '#1dafec',
    }}
  />
);

const ClipBorderRadius = ({ children, style }) => {
  return (
    <View
      style={[
        { borderRadius: BORDER_RADIUS, overflow: 'hidden', marginTop: 10 },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const BORDER_RADIUS = 3;

const styles = StyleSheet.create({
  headerContent: {
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 10,
  },
  headerVideoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  headerVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.blue,
    opacity: 0.8,
  },
  headerText: {
    color: '#eee',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 14 * 1.5,
  },
  buyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS,
  },
  buyButtonText: {
    backgroundColor: 'transparent',
    color: 'rgba(0,0,0,0.9)',
    fontSize: FontSizes.normalButton,
  },
  bigButton: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 15,
    height: 50,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bigButtonText: {
    fontSize: FontSizes.normalButton,
    color: '#fff',
    textAlign: 'center',
  },
  seeAllTalks: {
    fontSize: FontSizes.normalButton,
    color: Colors.blue,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default Home;
