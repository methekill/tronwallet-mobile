import React from 'react'
import { Linking } from 'react-native'
import * as Utils from '../../components/Utils'
import { Colors } from './../../components/DesignSystem'

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

const Link = Utils.Text.extend.attrs({
  size: 'smaller',
  light: true
})``

const goToURL = (url) => {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url)
    } else {
      console.log('Don\'t know how to open URI: ' + this.props.url)
    }
  })
}

export const PolicyText = () => (
  <React.Fragment>
    <Title>Privacy Policy</Title>
    <Text>
      Your privacy is important to us. It is TronWallet's policy to respect your privacy regarding any information we may collect from you across our website, <Link onPress={() => goToURL('https://tronwallet.me')}>http://tronwallet.me</Link>, and other sites we own and operate.{'\n'}
      We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.{'\n'}
      We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.{'\n'}
      We don't share any personally identifying information publicly or with third-parties, except when required to by law.{'\n'}
      Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.{'\n'}
      You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.{'\n'}
      Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.{'\n'}
      This policy is effective as of 1 July 2018.{'\n'}
    </Text>

    <Title>TronWallet Terms of Service</Title>
    <SubTitle>1. Terms</SubTitle>
    <Text>
      By accessing the website at <Link onPress={() => goToURL('https://tronwallet.me')}>http://tronwallet.me</Link>, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.{'\n'}
    </Text>
    <SubTitle>2. Use License</SubTitle>
    <Text>
      Permission is granted to temporarily download one copy of the materials (information or software) on TronWallet's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:{'\n'}
      modify or copy the materials;{'\n'}
      use the materials for any commercial purpose, or for any public display (commercial or non-commercial);{'\n'}
      attempt to decompile or reverse engineer any software contained on TronWallet's website;{'\n'}
      remove any copyright or other proprietary notations from the materials;{'\n'}
      or transfer the materials to another person or "mirror" the materials on any other server.{'\n'}
      This license shall automatically terminate if you violate any of these restrictions and may be terminated by TronWallet at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.{'\n'}
    </Text>

    <SubTitle>3. Disclaimer</SubTitle>
    <Text>
      The materials on TronWallet's website are provided on an 'as is' basis. TronWallet makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.{'\n'}
      Further, TronWallet does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.{'\n'}
    </Text>

    <SubTitle>4. Limitations</SubTitle>
    <Text>
      In no event shall TronWallet or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TronWallet's website, even if TronWallet or a TronWallet authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.{'\n'}
    </Text>

    <SubTitle>5. Accuracy of materials</SubTitle>
    <Text>
      The materials appearing on TronWallet's website could include technical, typographical, or photographic errors. TronWallet does not warrant that any of the materials on its website are accurate, complete or current. TronWallet may make changes to the materials contained on its website at any time without notice. However TronWallet does not make any commitment to update the materials.{'\n'}
    </Text>

    <SubTitle>6. Links</SubTitle>
    <Text>
      TronWallet has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TronWallet of the site. Use of any such linked website is at the user's own risk.{'\n'}
    </Text>

    <SubTitle>7. Modifications</SubTitle>
    <Text>
      TronWallet may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.{'\n'}
    </Text>

    <SubTitle>8. Governing Law</SubTitle>
    <Text>
      These terms and conditions are governed by and construed in accordance with the laws of Vancouver, Canada and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.{'\n'}
    </Text>

    <SubTitle>9. CRYPTOCURRENCY RISKS</SubTitle>
    <Text>Cryptocurrency assets are subject to high market risks and volatility. Past performance is not indicative of future results. Investments in blockchain assets may result in loss of part or all of your investment. Please do your own research and use caution. You are solely responsible for your actions on the TRONWALLET. TRONWALLET Team is not responsible for your investment losses.{'\n'}</Text>

    <SubTitle>10. THE TRON NETWORK (SEPARATE FROM TRONWALLET)</SubTitle>
    <Text>TronWallet is only a user interface to TRON and does not operate the TRON NETWORK. TronWallet is unable to control the actions of others on the TRON NETWORK. When using TRONWALLET, you are directly communicating with the TRON PUBLIC API operated by TRON Foundation. Transactions on the TRONWALLET are irreversible.{'\n'}</Text>

    <SubTitle>11. TRONWALLET DOES NOT ENDORSE ANYTHING</SubTitle>
    <Text>TRONWALLET does NOT endorse ANY asset on the TRON NETWORK. Asset "listings" on TRONWALLET are NOT endorsements. TRONWALLET is a software client ONLY and does NOT conduct any independent diligence or review of any asset. TRON is an open system meaning that scams and market manipulators may exist. Prices shown on TRONWALLET are for informational purposes and do not imply that they can actually be redeemed for a certain price.{'\n'}</Text>

    <SubTitle>12. YOUR OWN RESPONSIBILITIES</SubTitle>
    <Text>You, the user, are solely responsible for ensuring your own compliance with laws and taxes in your jurisdiction. Cryptocurrencies may be illegal in your area. You, are solely responsible for your own security including keeping your account secret keys safe and backed up.{'\n'}</Text>

    <SubTitle>13. DISCLAIMER OF WARRANTY</SubTitle>
    <Text>TRONWALLET is provided free of charge and on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.{'\n'}</Text>
  </React.Fragment >
)
