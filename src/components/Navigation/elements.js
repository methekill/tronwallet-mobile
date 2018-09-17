import styled, { css } from 'styled-components'
import { Colors, Spacing } from '../DesignSystem'

export const HeaderWrapper = styled.View`
  background-color:${Colors.background}
`
export const Header = styled.View`
  height: 64px;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  justify-content: center;
  padding: ${Spacing.medium}px;
  ${props => props.position && css`position: ${props.position}`};
  ${props => props.paddingTop && css` padding-top: ${props.paddingTop}px`};
  ${props => props.border && css`border-bottom-width: 1px`};
  ${props => props.border && css`border-bottom-color: black`};
`
export const SearchBarWrapper = styled.View`
    align-items:center;
    flex:1;
    flex-direction: row;
    padding: 5px;
`
export const SearchBar = styled.TextInput`
  font-family: Rubik-Medium;
  font-size: 16px;
  line-height: 18px;
  color: ${Colors.primaryText};
  flex: 1;
  width: 100%;
  padding: 8px;
`
export const SearchPreview = styled.View`
  align-items: center;
  padding: 5px;
`
