import _ from 'lodash';
import moment from 'moment';

export const Speakers = [
  ...require('../data/speakers.json'),
  ...require('../data/keynotes.json'),
];
export const Schedule = require('../data/schedule.json');
export const Talks = _.chain(Schedule)
  .map(day =>
    day.slots.map(slot => {
      slot.day = day.title;
      slot.dateTime = talkToDateTime(slot);
      return slot;
    })
  )
  .flatten()
  .filter(slot => slot.talk || slot.keynote)
  .value();

export const TalksByTime = _.groupBy(Talks, talk => talk.dateTime);

export function dayToDate(day) {
  switch(day) {
    case 'Monday':
        return '2018-04-23';
        break;
    case 'Tuesday':
        return '2018-04-24';
        break;
    case 'Wednesday':
        return '2018-04-25';
        break;
    case 'Thursday':
        return '2018-04-26';
        break;
    case 'Friday':
        return '2018-04-27';
        break;
    default:
        return '2018-04-23';
  }
}

export function talkToDateTime(talk) {
  let date = dayToDate(talk.day);
  let timeRange = talk.time.split(' ');
  let startTime = timeRange[0];
  let endTime = timeRange[2];
  let ampm = timeRange[3];

  if (!endTime) {
    ampm = timeRange[1];
  } else if (endTime && parseInt(endTime, 10) < parseInt(startTime, 10)) {
    // if end is 12:00pm and start is 11:00am, we need am not pm
    ampm = ampm === 'pm' ? 'am' : 'pm';
  }

  return moment(`${date} ${startTime} ${ampm} -0600`, 'YYYY-MM-DD HH:mm a Z');
}

export function findNextTalksAfterDate(date = new Date(), allTalks = Talks) {
  date = moment(date);
  let sortedMatches = _.chain(allTalks)
    .filter(talk => talk.dateTime.isAfter(date))
    .sortBy(talk => talk.dateTime.unix())
    .value();

  // This will happen after the conference
  if (!sortedMatches[0]) {
    return [NextYearTalk];
  } else {
    let nextTime = sortedMatches[0].dateTime;
    return TalksByTime[nextTime];
  }
}

export function findRandomTalk(allTalks = Talks) {
  return [_.sample(allTalks)];
}

const NextYearTalk = {
  talk: true,
  keynote: true,
  room: 'Unknown',
  summary: '',
  time: '-',
  title: 'Open Tech Summit 2019',
  speaker: 'Maybe you?',
};

export function findTalkData(speakerName) {
  return _.find(Talks, talk => talk.speaker === speakerName);
}

export function findSpeakerData(speakerName) {
  return _.find(Speakers, speaker => speaker.name === speakerName);
}
