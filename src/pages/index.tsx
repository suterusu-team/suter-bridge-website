import React from "react"
import { Layout, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
const { Header, Footer, Content } = Layout;
import { Row, Col, Button } from 'antd';
import { openNotificationWithIcon, MessageWithAlink } from '../components/tools'
import 'antd/dist/antd.css'; 
import Logo from '../static/suter_bridge_logo.png';
import Home from '../components/home';
import Form from '../components/form';

class SuterBridge extends React.Component {
  state = {
    metamaskInstalled: false,
    tronLinkInstalled: false,
    account: '',
    connectWalletTxt: 'Connect Wallet',
    web3Browser: false, 
  }

  constructor(props){
    super(props);
    this.checkWeb3Status = this.checkWeb3Status.bind(this)
    this.checkMetaMaskStatus = this.checkMetaMaskStatus.bind(this)
    this.checkTronLinkStatus = this.checkTronLinkStatus.bind(this)
    this.setCurrentAccount = this.setCurrentAccount.bind(this)
    this.dropDownMenu = this.dropDownMenu.bind(this)
    this.connectMetaMask = this.connectMetaMask.bind(this)
    this.connectTronLink = this.connectTronLink.bind(this)
  }
	componentDidMount() {
    this.checkWeb3Status();
    this.checkMetaMaskStatus();
    this.checkTronLinkStatus();
	}

  setCurrentAccount = account => {
    const connectWalletTxt = account.slice(0, 7) + '...' + account.slice(-5)
    this.setState({ account: account, connectWalletTxt: connectWalletTxt })
  }

  async connectMetaMask(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    this.setCurrentAccount(account);
    this.clearExpiredTask(account);
  }
  
  async connectTronLink(){
    const defaultAccount = window.tronWeb.defaultAddress["base58"]
    this.setCurrentAccount(defaultAccount);
  }
  
  checkTronLinkStatus() {
    if(typeof window.tronWeb !== 'undefined'){
      console.log('TronLink is installed!');
      this.setState({ tronLinkInstalled: true })
    }else{
      const message = 'Suter Bridge must work with tronLink, please install tronLink'
      openNotificationWithIcon('TronLink Is Not Install!', message, 'warning')
    }
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

  clearExpiredTask(account){
    let taskQueue = (localStorage.getItem(`${account}Task`) || "").split(",")
    taskQueue = taskQueue.filter(item => item);
    let expiredKeys = {}
    for (const key of taskQueue) {
      let myTask = localStorage.getItem(key)
      if (!myTask) {
        continue
      }
      const item = JSON.parse(myTask)
      const now = new Date()
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key)
        expiredKeys[key] = true
      }
    }
    taskQueue = taskQueue.filter(item => !expiredKeys[item])
    localStorage.setItem(`${account}Task`, taskQueue)
  }

  dropDownMenu = () => {
    const { metamaskInstalled, tronLinkInstalled} = this.state
    return(<Menu>
      <Menu.Item key="1" onClick={() => this.connectMetaMask() } disabled={!metamaskInstalled}>
        CONNECT METAMASK
      </Menu.Item>
      <Menu.Item key="2" onClick={() => this.connectTronLink() } disabled={!tronLinkInstalled}>
        CONNECT TRONLINK
      </Menu.Item>
    </Menu>)
  }

  render () {
    const { metamaskInstalled, connectWalletTxt, account } = this.state
    return (
      <Layout className='suterBridge'>
        <Header>
          <Row>
            <Col md={20} sm={12} ><img src={ Logo } className='logo' /></Col>
            <Col md={4} sm={12}>
            <Dropdown overlay={this.dropDownMenu()}>
              <Button className="connectWalletBtn">
                { connectWalletTxt }<DownOutlined />
              </Button>
            </Dropdown>
             
              {/* <Button className="connectWalletBtn" onClick={ () => this.connectMetaMask() } disabled={!metamaskInstalled}>
               { account === '' ? '' : <div className='successDot'></div> }
               { connectWalletTxt }
              </Button> */}
            </Col>
         </Row>
        </Header>
        <Content>
         { account === '' ? <Home onClickFunc={ () => this.connectMetaMask() } dropDownMenu={ this.dropDownMenu} metamaskInstalled = { metamaskInstalled } /> : <Form account={account}/> }
        </Content>
        <Footer></Footer>
      </Layout>
    );
  }
}

export default SuterBridge
