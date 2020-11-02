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
    checkTronLinkCount: 0,
    formType: '',
    ethNetwork: '',
    tronNetwork: '',
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
    this.checkEthNetworkType = this.checkEthNetworkType.bind(this)
    this.checkTronNetworkType = this.checkTronNetworkType.bind(this)
  }
	componentDidMount() {
    this.checkWeb3Status();
    this.checkMetaMaskStatus();
    this.interval = setInterval(this.checkTronLinkStatus, 1000);
  }
  
  componentWillUnmount() {
    clearInterval(this.interval)
  }

  setCurrentAccount = (account: string, formType:string) => {
    const connectWalletTxt = account.slice(0, 7) + '...' + account.slice(-5)
    this.setState({ account: account, connectWalletTxt: connectWalletTxt, formType: formType})
  }

  async connectMetaMask(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    this.setCurrentAccount(account, 'Mint');
    this.clearExpiredTask(account);
  }
  
  async connectTronLink(){
    const defaultAccount = await window.tronWeb.defaultAddress["base58"]
    this.setCurrentAccount(defaultAccount, 'Revert');
    this.clearRevertExpiredTask(defaultAccount)
  }
  
  async checkTronLinkStatus() {
    this.setState({checkTronLinkCount: this.state.checkTronLinkCount + 1})
    if(typeof window.tronWeb !== 'undefined'){
      console.log('TronLink is installed!');
      this.setState({ tronLinkInstalled: true })
      clearInterval(this.interval)
      this.checkTronNetworkType()
    }else{
      if(this.state.checkTronLinkCount >= 5){
        clearInterval(this.interval)
        const message = 'Suter Bridge must work with tronLink, please install tronLink'
        openNotificationWithIcon('TronLink Is Not Install!', message, 'warning')
      }
    }
  }
  checkMetaMaskStatus(){
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      this.setState({ metamaskInstalled: true })
      this.checkEthNetworkType()
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

  checkEthNetworkType(){
   if(window.ethereum && window.ethereum.chainId != ETH_CHAIN_ID){
      openNotificationWithIcon('ETH network error!', 'Please change metamask to ropsten network', 'warning')
      this.setState({ethNetwork: window.ethereum.chainId })
   }
  }

  checkTronNetworkType(){
    if(window.tronWeb && window.tronWeb.currentProvider()["fullNode"]["host"].split('.')[1] != TRON_CHAIN_ID ){
      openNotificationWithIcon('TRON network error!', 'Please change tronLink to shasta network', 'warning')
      this.setState({tronNetwork: window.tronWeb.currentProvider()["fullNode"]["host"].split('.')[1] })
    }
  }

  clearExpiredTask(account){
    // clear eth task
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

  clearRevertExpiredTask(account){
    // clear eth task
    let taskQueue = (localStorage.getItem(`${account}RevertTask`) || "").split(",")
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
        Bridge Ethereum Assets to Tron Assets
      </Menu.Item>
      <Menu.Item key="2" onClick={() => this.connectTronLink() } disabled={!tronLinkInstalled}>
        Bridge Tron Assets to Ethereum Assets
      </Menu.Item>
    </Menu>)
  }

  render () {
    const {connectWalletTxt, account, formType } = this.state
    return (
      <Layout className='suterBridge'>
        <Header>
          <Row>
            <Col md={20} sm={12} >
              <a href="/"><img src={ Logo } className='logo' /></a>
            </Col>
            <Col md={4} sm={12}>
              { account !== '' ? <Button className="connectWalletBtn" >
                 <div className='successDot'></div>
                 { connectWalletTxt }
              </Button> : 
              <Dropdown overlay={this.dropDownMenu()}>
                <Button className="connectWalletBtn">
                  { connectWalletTxt }<DownOutlined />
                </Button>
              </Dropdown>
              }
            </Col>
         </Row>
        </Header>
        <Content>
         { account === '' ? <Home dropDownMenu={ this.dropDownMenu} /> : <Form account={account} formType={formType}/> }
        </Content>
        <Footer></Footer>
      </Layout>
    );
  }
}

export default SuterBridge
