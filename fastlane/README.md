fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios test
```
fastlane ios test
```
Submit a new Beta Build to Apple TestFlight

Runs all the tests
### ios upgrade
```
fastlane ios upgrade
```

### ios build
```
fastlane ios build
```


----

## Android
### android test
```
fastlane android test
```
Submit a new Beta to Android Beta Testers

Runs all tests
### android upgrade
```
fastlane android upgrade
```

### android build
```
fastlane android build
```


----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
