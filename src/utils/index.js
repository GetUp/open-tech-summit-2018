import moment from 'moment-timezone';

export function getAvatarURL(person) {
  if (person.avatar.includes('gravatar')) {
    return person.avatar;
  } else {
    return `https://s3.amazonaws.com/open-tech-summit-2018/${person.avatar}`;
  }
}

const CONFERENCE_START_TIME = moment.tz('2018-04-23T08:30:00', 'Europe/Bucharest');
const CONFERENCE_END_TIME = moment.tz('2018-04-27T20:00:00', 'Europe/Bucharest');

export function conferenceHasStarted() {
  return moment.tz('Europe/Bucharest').isAfter(CONFERENCE_START_TIME);
}

export function conferenceHasEnded() {
  return moment.tz('Europe/Bucharest').isAfter(CONFERENCE_END_TIME);
}

export function HideWhenConferenceHasStarted({children}) {
  if (conferenceHasStarted()) {
    return null;
  } else {
    return children;
  }
}

export function HideWhenConferenceHasEnded({children}) {
  if (conferenceHasEnded()) {
    return null;
  } else {
    return children;
  }
}

export function ShowWhenConferenceHasEnded({children}) {
  if (conferenceHasEnded()) {
    return children;
  } else {
    return null;
  }
}