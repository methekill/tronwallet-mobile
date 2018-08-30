import { Colors, Spacing } from '../../components/DesignSystem'
import styled, { css } from 'styled-components'

export const Divider = styled.View`
    height:${props => Spacing[props.size]}px;
    ${props => props.size && css`margin-horizontal: ${Spacing[props.size]}`}px;
    ${props => props.marginBottom && css`margin-bottom:${props.marginBottom}px`};
    border-bottom-width: 1px;
    border-bottom-color: ${Colors.lighterBackground};
`

export const SelecterWrapper = styled.View`
    flex:1;
    background-color:${Colors.lighterBackground};
    border-radius:5px;
    border-width: 1px;
    border-color:${Colors.lighterBackground};
    padding: 1px;
`
export const SelecterOption = styled.TouchableOpacity`
    flex-grow: 0.33;
    background-color: ${props => props.disabled ? Colors.lightPurple : Colors.lightestBackground};
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 5px;
    margin-vertical: 2px;
    margin-horizontal: 4px;
`
export const DarkButton = styled.TouchableOpacity`
    background-color:${Colors.lightBackground};
    align-items: center;
    justify-content: center;
    padding-vertical: 8px;
    padding-horizontal: 30px;
    border-radius: 3px;
`
