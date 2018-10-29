import React from 'react'

import * as Utils from '../../components/Utils'
import { Colors } from './../../components/DesignSystem'
import tl from '../../utils/i18n'

const Text = Utils.Text.extend.attrs({
  color: Colors.greyBlue,
  size: 'smaller',
  light: true,
  paddingBottom: 20
})``

const Title = Utils.Text.extend.attrs({
  marginBottom: 20,
  size: 'average'
})``

const SubTitle = Utils.Text.extend.attrs({
  paddingBottom: 10,
  size: 'small'
})``

export const PolicyText = () => (
  <React.Fragment>
    <Title>{tl.t('privacyPolicy.docTitle')}</Title>
    <Text>
      {tl.t('privacyPolicy.introduction')}{'\n'}
    </Text>
    <Title>{tl.t('privacyPolicy.termsOfService.title')}</Title>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section1.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section1.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section2.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section2.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section3.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section3.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section4.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section4.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section5.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section5.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section6.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section6.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section7.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section7.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section8.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section8.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section9.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section9.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section10.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section10.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section11.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section11.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section12.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section12.body')}{'\n'}</Text>

    <SubTitle>{tl.t('privacyPolicy.termsOfService.section13.title')}</SubTitle>
    <Text>{tl.t('privacyPolicy.termsOfService.section13.body')}{'\n'}</Text>

  </React.Fragment >
)
