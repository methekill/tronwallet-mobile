import styled from 'styled-components'
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from '../../components/DesignSystem'

export const HeaderContainer = styled(LinearGradient).attrs({
  colors: [Colors.primaryGradient[0], Colors.primaryGradient[1]],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 }
})`
  z-index: 2;
  display: flex;
  flex: 0.20;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

export const PageWrapper = styled.View`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  background-color: ${Colors.lightBackground}
`

export const HeaderView = styled.View`
  z-index: 3;
  width: 100%;
  height: 70;
  justify-content: center;
  align-items: center;
`

export const URLInput = styled.TextInput`
  background-color: ${Colors.primaryText};
  width: 85%;
  height: 70%;
  color: ${Colors.titleLabel};
  borderRadius: 5;
`

export const BlankPage = styled.View`
  flex: 0.80;
  background-color: ${Colors.lightBackground};
`

export const WebViewLimit = styled.View`
  flex: 0.001;
`
