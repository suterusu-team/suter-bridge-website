import React from "react"
import { Layout } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
import { Row, Col, Button } from 'antd';
import { openNotificationWithIcon, MessageWithAlink } from '../components/tools'
import 'antd/dist/antd.css'; 
import Logo from '../static/suter_bridge_logo.png';
import Home from '../components/home';
import Form from '../components/form';
import Eth from 'ethjs-query';
import EthContract from 'ethjs-contract';

class SuterBridge extends React.Component {
  constructor(props){
    super(props);
    this.state = { metamaskInstalled: false, account: '', connectWalletTxt: 'Connect Wallet', web3Browser: false };
    this.setCurrentAccount = this.setCurrentAccount.bind(this)
  }
	componentDidMount() {
		this.checkMetaMaskStatus();
    this.checkWeb3Status();
	}

  setCurrentAccount = account => {
    const connectWalletTxt = account.slice(0, 7) + '...' + account.slice(-5)
    this.setState({ account: account, connectWalletTxt: connectWalletTxt })
  }

  async connectMetaMask(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    this.setCurrentAccount(account);
  }

  checkMetaMaskStatus(){
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      this.setState({ metamaskInstalled: true })
    }else{
      const message = 'Suter Bridge must work with metamask, please install metamask'
      openNotificationWithIcon('MetaMask Is Not Install!', message, 'warning')
    }
  }
  checkWeb3Status(){
    // Check if Web3 has been injected by the browser:
    if (typeof web3 !== 'undefined') {
      // You have a web3 browser! Continue below!
      this.setState({ "web3Browser": true })
    } else {
      const message = "Your should use a web3 browser."
      openNotificationWithIcon('Invalid browser', message, 'warning')
    }
  }

  render () {
    const { metamaskInstalled, connectWalletTxt, account } = this.state
    return (
      <Layout className='suterBridge'>
        <Header>
          <Row>
            <Col md={20} sm={12} ><img src={ Logo } className='logo' /></Col>
            <Col md={4} sm={12}>
              <Button className="connectWalletBtn" onClick={ () => this.connectMetaMask() } disabled={!metamaskInstalled}>
               { account === '' ? '' : <div className='successDot'></div> }
               { connectWalletTxt }
              </Button>
            </Col>
         </Row>
        </Header>
        <Content>
         { account === '' ? <Home onClickFunc={ () => this.connectMetaMask() } metamaskInstalled = { metamaskInstalled } /> : <Form account={account}/> }
        </Content>
        <Footer></Footer>
      </Layout>
    );
  }
}

export default SuterBridge
