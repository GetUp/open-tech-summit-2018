import React from 'react';
import { AsyncStorage } from 'react-native';
import { EventEmitter } from 'fbemitter';
import _ from 'lodash';

const _emitter = new EventEmitter();
const _savedTalksStorageKey = '@OpenTechSummit:savedTalks';
const _savedAuthStorageKey = '@OpenTechSummit:authentication';
let _savedTalks;
let _authenticated;

export const loadAuthenticationAsync = async () => {
  try {
    let result = await AsyncStorage.getItem(_savedAuthStorageKey);
    if (result) {
      _authenticated = JSON.parse(result);
    }
  } catch (e) {
    console.warn(e);
    _authenticated = false;
  } finally {
    if (!_authenticated) {
      _authenticated = false;
    }
  }
  return _authenticated
};

export const removeAuthenticationAsync = async () => {
  await AsyncStorage.removeItem(_savedAuthStorageKey);
};

export const loadSavedTalksAsync = async () => {
  try {
    let result = await AsyncStorage.getItem(_savedTalksStorageKey);
    if (result) {
      _savedTalks = JSON.parse(result);
    }
  } catch (e) {
    console.warn(e);
  } finally {
    if (!_savedTalks) {
      _savedTalks = {};
    }
  }
};

export function getSavedStateForAuth() {
  return _authenticated;
}

export function getSavedStateForTalk(talk) {
  const talkKey = _.snakeCase(talk.title);
  const active = _savedTalks[talkKey];
  return active;
}

// Returns the subscription, subscriber needs to remove subscription on unmount
export function subscribeToUpdates(talk, onUpdateFn) {
  const talkKey = _.snakeCase(talk.title);
  return _emitter.addListener('change', () => {
    const active = _savedTalks[talkKey];
    onUpdateFn(active);
  });
}

export const toggleSaved = talk => {
  let key = _.snakeCase(talk.title);
  let newSavedTalks = {
    ..._savedTalks,
    [key]: !_savedTalks[key],
  };

  _updateSavedTalks(newSavedTalks);
};

function _updateSavedTalks(savedTalks) {
  _savedTalks = savedTalks;
  _emitter.emit('change');
  _updateSavedTalksAsyncStorage();
}

export const toggleAuthenticated = () => {
  _updateAuthentication();
};

function _updateAuthentication() {
  _emitter.emit('change');
  _updateAuthenticationAsyncStorage();
}

function _updateSavedTalksAsyncStorage() {
  try {
    AsyncStorage.setItem(_savedTalksStorageKey, JSON.stringify(_savedTalks));
  } catch (e) {
    console.warn(e);
  }
}

function _updateAuthenticationAsyncStorage() {
  try {
    AsyncStorage.setItem(_savedAuthStorageKey, JSON.stringify(_authenticated || true));
  } catch (e) {
    console.warn(e);
  }
}

export function withSaveState(WrappedComponent) {
  class ComponentWithSaveState extends React.Component {
    state = {
      saved: getSavedStateForTalk(this.props.talk)
    };

    componentWillMount() {
      this._subscription = subscribeToUpdates(this.props.talk, saved => {
        if (saved !== this.state.saved) {
          this.setState({ saved });
        }
      });
    }

    componentWillUnmount() {
      this._subscription.remove();
    }

    render() {
      return <WrappedComponent saved={this.state.saved} {...this.props} />;
    }
  }

  return ComponentWithSaveState;
}

export function withAuthedState(WrappedComponent) {
  class ComponentWithAuthedState extends React.Component {
    state = {
      authed: getSavedStateForAuth()
    };

    render() {
      return <WrappedComponent authed={this.state.authed} {...this.props} />;
    }
  }

  return ComponentWithAuthedState;
}
