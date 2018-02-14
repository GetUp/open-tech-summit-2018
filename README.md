# OpenTechSummit app

- Download [OpenTechSummit on the Apple App Store](https://itunes.apple.com/us/app/opentechsummit/)
- Download [OpenTechSummit on Google Play](https://play.google.com/store/apps/details?id=org.opentechsummit.app&hl=en)
- Open OpenTechSummit [with the Expo client](https://expo.io/@opentechsummit/app)

## Get it running on your machine (anybody)

- `yarn global add exp`
- Clone this repo, cd into it, run `yarn`
- `exp start`
- Scan the QR code from your phone. Alternatively, in another terminal window run `exp ios` and/or `exp android` to open in simulator.

## Deployment (for project owners)

### Publishing updates (JS only)

First, sign in `opentech` Expo account.

- Android: `exp publish --release-channel android`
- iOS: `exp publish --release-channel ios`
- Expo client: `exp publish`

### Standalone builds

First, sign in to the `opentech` Expo account.

- Android: `exp build:android --release-channel android`
- iOS: `exp build:android --release-channel ios`
