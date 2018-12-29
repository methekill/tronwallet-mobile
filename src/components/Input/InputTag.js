import React from 'react'
import { Keyboard } from 'react-native'
import styled from 'styled-components'
import Modal from 'react-native-modal'
import Input from './index'
import { Colors } from './../DesignSystem'

const Tag = styled.Text`
  background-color: yellow;
  padding: 5px 15px;
  color: #000;
`

const View = styled.View``

const ModalContainer = styled.View`
  background-color: ${Colors.background};
  flex: 1;
  justify-content: flex-start;
  align-items: flex-start;
  align-content: flex-start;
  border-radius: 4px;
  border-width: 1px;
`

class InputTag extends React.Component {
  state = {
    isModalVisible: false,
    tag: null
  }

  componentWillUnmount () {
    this._toggleModal()
  }

  _toggleModal = () =>
    this.setState({ isModalVisible: !this.state.isModalVisible });

  _leftContent = () => {
    const { tag } = this.state
    if (!tag) return null

    return (
      <View>
        <Tag>{tag}</Tag>
      </View>
    )
  }

  _onChangeText = (text) => {
    const isModalVisible = text.length > 2
    this.setState({ text, isModalVisible }, () => {
      if (isModalVisible) {
        Keyboard.dismiss(0)
      }
    })
  }

  render () {
    return (
      <React.Fragment>
        <Input
          leftContent={this._leftContent}
          onChangeText={this._onChangeText}
          placeholder='use @ to autocomplete contact name'
        />
        <Modal
          isVisible={this.state.isModalVisible}
          animationIn='fadeIn'
          animationOut='fadeOut'
          backdropColor={Colors.darkerBackground}
          onBackButtonPress={this._toggleModal}
          onBackdropPress={this._toggleModal}
          useNativeDriver
          style={{ padding: 10 }}
        >
          <ModalContainer>
            <Input
              noBorder
              onChangeText={() => null}
            />
            <View>
              <Tag>Tag 1</Tag>
            </View>
          </ModalContainer>
        </Modal>
      </React.Fragment>
    )
  }
}

export default InputTag
