import React, { PureComponent } from 'react'
import { TouchableWithoutFeedback, View, ScrollView } from 'react-native'

import NavigationHeader from '../../components/Navigation/Header'
import ModalWebView from './../../components/ModalWebView'

// Design
import { Container, Content, Row, HorizontalSpacer, VerticalSpacer, VersionText, SafeAreaView } from '../../components/Utils'
import { Description, SectionTitle, Getty, PayPartner, TutorialWrapper, TutorialText } from './elements'

// Utils
import tl from '../../utils/i18n'
import ConfigJson from '../../../package.json'

class About extends PureComponent {
  static navigationOptions = {
    header: null
  }

  render () {
    return (
      <SafeAreaView>
        <Container>
          <NavigationHeader
            onBack={() => this.props.navigation.goBack()}
            title={tl.t('settings.about.title').toUpperCase()}
          />
          <ScrollView>
            <Content justify='space-between' flex={1}>
              <View>
                <Description>{tl.t('settings.about.description')}</Description>
                <VerticalSpacer size='large' />
                <TutorialWrapper>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      this.webView.open('https://blog.getty.io/how-to-tronwallet-tutorial-2228a6218646')
                    }}
                  >
                    <TutorialText>{tl.t('settings.about.tutorial')}</TutorialText>
                  </TouchableWithoutFeedback>
                </TutorialWrapper>
              </View>
              <View>
                <SectionTitle>{tl.t('settings.partners')}</SectionTitle>
                <Row justify='center'>
                  <TouchableWithoutFeedback onPress={() => this.webView.open('https://www.hummingpay.io/')} >
                    <PayPartner
                      source={require('../../assets/paysponsor.png')}
                    />
                  </TouchableWithoutFeedback>
                  <HorizontalSpacer size='large' />
                  <HorizontalSpacer size='large' />
                  <TouchableWithoutFeedback onPress={() => this.webView.open('https://getty.io/')} >
                    <Getty source={require('../../assets/gettysponsor.png')} />
                  </TouchableWithoutFeedback>
                </Row>
                <VersionText>{`v${ConfigJson.version}`}</VersionText>
              </View>
            </Content>
          </ScrollView>
        </Container>

        <ModalWebView ref={ref => { this.webView = ref }} />
      </SafeAreaView>
    )
  }
}

export default About
