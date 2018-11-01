import React, { PureComponent } from 'react'
import {
  Modal,
  WebView,
  TouchableWithoutFeedback,
  View,
  ScrollView
} from 'react-native'

import NavigationHeader from '../../components/Navigation/Header'
import Loading from '../../components/LoadingScene'

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

  state = {
    modalVisible: false,
    partnerUri: ''
  }

  _openLink = partnerUri => this.setState({ modalVisible: true, partnerUri })

  render () {
    const { modalVisible, partnerUri } = this.state

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
                    onPress={() =>
                      this._openLink(
                        'https://blog.getty.io/how-to-tronwallet-tutorial-2228a6218646'
                      )
                    }
                  >
                    <TutorialText>
                      {tl.t('settings.about.tutorial')}
                    </TutorialText>
                  </TouchableWithoutFeedback>
                </TutorialWrapper>
                <Modal
                  animationType='slide'
                  transparent={false}
                  visible={modalVisible}
                  onRequestClose={() => this.setState({ modalVisible: false })}
                >
                  <SafeAreaView>
                    <NavigationHeader
                      title=''
                      onBack={() => {
                        this.props.navigation.goBack()
                      }}
                    />
                    <WebView
                      source={{ uri: partnerUri }}
                      renderLoading={() => <Loading />}
                      startInLoadingState
                    />
                  </SafeAreaView>
                </Modal>
              </View>
              <View>
                <SectionTitle>{tl.t('settings.partners')}</SectionTitle>
                <Row justify='center'>
                  <TouchableWithoutFeedback
                    onPress={() => this._openLink('https://www.hummingpay.io/')}
                  >
                    <PayPartner
                      source={require('../../assets/paysponsor.png')}
                    />
                  </TouchableWithoutFeedback>
                  <HorizontalSpacer size='large' />
                  <HorizontalSpacer size='large' />
                  <TouchableWithoutFeedback
                    onPress={() => this._openLink('https://getty.io/')}
                  >
                    <Getty source={require('../../assets/gettysponsor.png')} />
                  </TouchableWithoutFeedback>
                </Row>
                <VersionText>{`v${ConfigJson.version}`}</VersionText>
              </View>
            </Content>
          </ScrollView>
        </Container>
      </SafeAreaView>
    )
  }
}

export default About
