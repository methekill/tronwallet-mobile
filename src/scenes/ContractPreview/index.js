import React, { Component } from 'react'

import { Container, Content } from '../../components/Utils'

import ContractCard from './ContractCard'

export default class ContractPreview extends Component {
  render () {
    const { params } = this.props.navigation.state

    return (
      <Container>
        <Content flex={1} paddingVertical='big' justify='center' background="white">
          <ContractCard {...this.props} params={params} />
        </Content>
      </Container>
    )
  }
}
