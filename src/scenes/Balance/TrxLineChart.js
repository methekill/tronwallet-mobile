import React from 'react'
import PropTypes from 'prop-types'
import { LineChart } from 'react-native-svg-charts'
import axios from 'axios'
import Config from 'react-native-config'

import Gradient from '../../components/Gradient'
import GrowIn from '../../components/Animations/GrowIn'

class TrxLineChart extends React.Component {
  static defaultProps = {
    height: 40
  }

  static propTypes = {
    height: PropTypes.number
  }

  state = {
    loading: true,
    data: []
  }

  async componentDidMount () {
    const response = await axios.get(`${Config.TRX_HISTORY_API}/histohour?fsym=TRX&tsym=USD&limit=23`)
    this.setState({
      loading: false,
      data: response.data.Data.map(item => item.close)
    })
  }

  render () {
    const { height } = this.props
    return (
      <GrowIn name='linechart' height={height}>
        <LineChart
          style={{ height }}
          data={this.state.data}
          svg={{ stroke: 'url(#gradient)', strokeWidth: 3 }}
          animate
        >
          <Gradient />
        </LineChart>
      </GrowIn>
    )
  }
}

export default TrxLineChart
