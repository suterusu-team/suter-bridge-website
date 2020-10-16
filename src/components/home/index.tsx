import React from "react"
import { Row, Col, Button } from 'antd';
import MetaMask from '../../static/metamask.svg';
import './index.less';

class Home extends React.Component {
  constructor(props){
    super(props);
  }
  render () {
  	const { onClickFunc, metamaskInstalled } = this.props
  	return (
  		<div className="home">
  		  <Row>
          <Col span={24}>
            <div className="title">
              <h1>Suter Bridge Alpha</h1>
              <h1>A Glance of Suter VM</h1>
            </div>
           </Col>
       </Row>
       <Row>
          <Col span={24}>
            <div className="metamaskContainer">
              <img src={ MetaMask } width="250px" />
            </div>
          </Col>
       </Row>
       <Row>
           <Col span={24}>
             <div className="tipTextContainer">
               <p>To mint or revert assets, connect your wallet.</p>
             </div>
           </Col>
          </Row>
          <Row>
           <Col span={24}>
             <div className="connectMetaMaskButtonContainer">
               <Button type="primary" size="large" onClick={ onClickFunc } disabled={ !metamaskInstalled }>CONNECT METAMASK</Button>
             </div>
           </Col>
        </Row>
      </div>
  	)
  }
}

export default Home