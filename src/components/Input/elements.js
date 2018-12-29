import styled from 'styled-components'
import PropTypes from 'prop-types'
import capitalize from 'lodash/capitalize'

import { Colors } from '../DesignSystem'

export const Wrapper = styled.View`
  padding-vertical: 6px;
  position: relative;
  width: 100%;
`

export const InputWrapper = styled.View`
  padding-horizontal: 8px;
  padding-vertical: 5.5px;
  border-radius: 4px;
  border-width: ${props => props.noBorder ? 0 : '1px'};
  border-color: #51526B;
  flex-direction: row;
  align-items: center;
`

export const LabelWrapper = styled.View`
  padding-vertical: 2px;
  padding-horizontal: 4px;
  background-color: ${props => props.color};
  z-index: 999;
  position: absolute;
  left: 5px;
`

export const Label = styled.Text`
  font-size: 10px;
  font-family: ${props => `Rubik-${capitalize(props.font)}`};
  letter-spacing: 0.55;
  line-height: 11px;
  color: ${Colors.secondaryText};
`
Label.defaultProps = {
  font: 'medium'
}

Label.propTypes = {
  font: PropTypes.oneOf(['bold', 'light', 'black', 'medium', 'regular'])
}

export const TextInput = styled.TextInput`
  font-family: ${props => `Rubik-${capitalize(props.font)}`};
  font-size: 16px;
  line-height: 18px;
  color: ${props => props.color || Colors.primaryText};
  flex: 1;
  padding: 8px;
  ${props => props.align && `text-align: ${props.align}`};
`
TextInput.defaultProps = {
  font: 'medium'
}

TextInput.propTypes = {
  font: PropTypes.oneOf(['bold', 'light', 'black', 'medium', 'regular'])
}