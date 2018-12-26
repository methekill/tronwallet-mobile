import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { TouchableOpacity, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Colors } from '../../../components/DesignSystem'

import TrxValue from '../TrxValue'
import * as Utils from '../../../components/Utils'
import { CarouselCard, CardInfo, CardFooter, TronLogo, Icon, BtnTrash, Label, Value, TopCardGradient } from './elements'

import { shortNumberFormat } from './../../../utils/numberUtils'
import tl from '../../../utils/i18n'

const Card = ({ name, address, price, balance, tronPower, bandwidth, currency, showDeleteBtn, onCopy, onDelete, onCurrencyPress }) => {
  const avaliable = (balance * price)
  const frozen = (tronPower * price)
  const trxBalance = frozen + avaliable

  return (
    <CarouselCard>
      <TopCardGradient />
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0 }}
        colors={['rgb(48, 50, 76)', 'rgb(38, 40, 64)']}
        style={styles.linearCardBody}
      >
        <React.Fragment>
          <Utils.View padding={22} width='100%'>
            <Utils.Text color='#9b9cb9'>{name}</Utils.Text>
            <TronLogo>
              <Icon source={require('../../../assets/tron-logo-small.png')} />
            </TronLogo>
            <Utils.VerticalSpacer />

            <Utils.View width={132}>
              <TouchableOpacity onPress={() => onCopy(address)} >
                <Utils.Text color='white' size='smaller' font='regular' numberOfLines={1} ellipsizeMode='middle'>
                  {address}
                </Utils.Text>
              </TouchableOpacity>
            </Utils.View>

            <Utils.VerticalSpacer size='small' />
            <TouchableOpacity onPress={onCurrencyPress}>
              <TrxValue trxBalance={trxBalance} currency={currency} />
            </TouchableOpacity>

            <Utils.VerticalSpacer size='small' />
            <Utils.Row justify='space-between'>
              <CardInfo
                label={tl.t('avaliable')}
                value={balance}
                currency='TRX'
              />
              <CardInfo
                label={tl.t('frozen')}
                value={tronPower}
                currency='TRX'
              />
            </Utils.Row>
          </Utils.View>

          <CardFooter>
            <Utils.Column width='50%'>
              <Utils.Row>
                <Utils.TWIcon name='bandwidth' size={16} color={Colors.greyBlue} />
                <Label paddingLeft={10}>{tl.t('balance.bandwidth')}</Label>
              </Utils.Row>
            </Utils.Column>

            <Utils.Column width='50%' align='flex-end'>
              <Utils.Row justify='center' align='center'>
                <Value paddingRight={20}>
                  {shortNumberFormat(bandwidth)}
                </Value>
                {showDeleteBtn && (
                  <BtnTrash onPress={() => onDelete(address, balance)} />
                )}
              </Utils.Row>
            </Utils.Column>
          </CardFooter>
        </React.Fragment>
      </LinearGradient>
    </CarouselCard>
  )
}

const styles = StyleSheet.create({
  linearCard: {
    height: 3,
    borderRadius: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  linearCardBody: {
    flex: 1,
    alignItems: 'flex-start',
    borderRadius: 6
  }
})

Card.displayName = 'BalanceCard'
Card.propTypes = {
  name: PropTypes.string,
  address: PropTypes.string,
  price: PropTypes.number.isRequired,
  balance: PropTypes.number,
  tronPower: PropTypes.number,
  bandwidth: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  showDeleteBtn: PropTypes.bool,
  onCopy: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCurrencyPress: PropTypes.func.isRequired
}

Card.defaultProps = {
  showDeleteBtn: false
}

export default Card
