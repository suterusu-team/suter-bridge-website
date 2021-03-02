import React from 'react';
import { Layout, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
const { Header, Footer, Content } = Layout;
import { Row, Col, Button } from 'antd';
import {
  openNotificationWithIcon,
  EthChainNameMap,
  BscChainNameMap,
} from '../components/tools';
import detectEthereumProvider from '@metamask/detect-provider';
import 'antd/dist/antd.css';
import Logo from '../static/suter_bridge_logo.png';
import Home from '../components/home';
import Form from '../components/form';

class SuterBridge extends React.Component {
  state = {
    metamaskInstalled: false,
    account: '',
    connectWalletTxt: 'Connect Wallet',
    formType: '',
    chainId: '',
  };

  constructor(props) {
    super(props);
    this.checkMetaMaskStatus = this.checkMetaMaskStatus.bind(this);
    this.setCurrentAccount = this.setCurrentAccount.bind(this);
    this.dropDownMenu = this.dropDownMenu.bind(this);
    this.connectMetaMask = this.connectMetaMask.bind(this);
    this.checkEthNetworkType = this.checkEthNetworkType.bind(this);
  }
  componentDidMount() {
    setTimeout(this.checkMetaMaskStatus, 1000);
  }

  componentWillUnmount() {}

  setCurrentAccount = (account: string, formType: string) => {
    const connectWalletTxt = account.slice(0, 7) + '...' + account.slice(-5);
    this.setState({
      account: account,
      connectWalletTxt: connectWalletTxt,
      formType: formType,
    });
  };

  async connectMetaMask() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    let { chainId } = this.state;
    if (chainId === ETH_CHAIN_ID) {
      this.setCurrentAccount(account, 'Mint');
    } else {
      this.setCurrentAccount(account, 'Revert');
    }
    this.clearExpiredTask(account);
  }

  async checkMetaMaskStatus() {
    const provider = await detectEthereumProvider();
    if (provider === window.ethereum) {
      console.log('MetaMask is installed!');
      this.setState({ metamaskInstalled: true });
      this.checkEthNetworkType();
      this.chainChanged();
      this.accountChanged();
    } else {
      const message = intl.get('NeedMetaMaskTips');
      openNotificationWithIcon(
        intl.get('MetaMaskIsNotInstalled'),
        message,
        'warning',
      );
    }
  }

  accountChanged() {
    window.ethereum.on('accountsChanged', function(accounts) {
      openNotificationWithIcon(
        intl.get('MetamaskAccountChanged'),
        intl.get('PageWillRefresh'),
        'warning',
        4.5,
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });
  }

  chainChanged() {
    window.ethereum.on('chainChanged', chainId => {
      openNotificationWithIcon(
        'Chain changed',
        'Page will refresh after 2 seconds',
        'warning',
        4.5,
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });
  }

  checkEthNetworkType() {
    this.setState({ chainId: window.ethereum.chainId });
    if (
      window.ethereum &&
      (window.ethereum.chainId == ETH_CHAIN_ID ||
        window.ethereum.chainId == BSC_CHAIN_ID)
    ) {
      // this.connectMetaMask();
    } else {
      openNotificationWithIcon(
        'Network error',
        `Please change Metamask network to ${EthChainNameMap[ETH_CHAIN_ID]} or ${BscChainNameMap[BSC_CHAIN_ID]}`,
        'warning',
        4.5,
      );
    }
  }

  clearExpiredTask(account) {
    // clear eth task
    let taskQueue = (localStorage.getItem(`${account}Task`) || '').split(',');
    taskQueue = taskQueue.filter(item => item);
    let expiredKeys = {};
    for (const key of taskQueue) {
      let myTask = localStorage.getItem(key);
      if (!myTask) {
        continue;
      }
      const item = JSON.parse(myTask);
      const now = new Date();
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        expiredKeys[key] = true;
      }
    }
    taskQueue = taskQueue.filter(item => !expiredKeys[item]);
    localStorage.setItem(`${account}Task`, taskQueue);
  }

  clearRevertExpiredTask(account) {
    // clear eth task
    let taskQueue = (localStorage.getItem(`${account}RevertTask`) || '').split(
      ',',
    );
    taskQueue = taskQueue.filter(item => item);
    let expiredKeys = {};
    for (const key of taskQueue) {
      let myTask = localStorage.getItem(key);
      if (!myTask) {
        continue;
      }
      const item = JSON.parse(myTask);
      const now = new Date();
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        expiredKeys[key] = true;
      }
    }
    taskQueue = taskQueue.filter(item => !expiredKeys[item]);
    localStorage.setItem(`${account}Task`, taskQueue);
  }

  dropDownMenu = () => {
    const { metamaskInstalled, chainId } = this.state;
    return (
      <Menu>
        <Menu.Item
          key="1"
          onClick={() => this.connectMetaMask()}
          disabled={!metamaskInstalled || chainId != ETH_CHAIN_ID}
        >
          Bridge Ethereum Assets to BSC Assets
        </Menu.Item>
        <Menu.Item
          key="2"
          onClick={() => this.connectMetaMask()}
          disabled={!metamaskInstalled || chainId != BSC_CHAIN_ID}
        >
          Bridge BSC Assets to Ethereum Assets
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { connectWalletTxt, account, formType } = this.state;
    const scanLink =
      formType == 'Mint'
        ? `${ETHERSCAN}/address/${account}`
        : `${BSCSCAN}/address/${account}`;
    return (
      <Layout className="suterBridge">
        <Header>
          <Row>
            <Col lg={12} xl={12} md={12} sm={12} xs={12}>
              <a href="/">
                <img src={Logo} className="logo" />
              </a>
            </Col>
            <Col lg={12} xl={12} md={12} sm={12} xs={12}>
              {account !== '' ? (
                <a href={scanLink} target="_blank">
                  <Button className="connectWalletBtn">
                    <div className="successDot"></div>
                    {connectWalletTxt}
                  </Button>
                </a>
              ) : (
                <Dropdown
                  overlay={this.dropDownMenu()}
                  onClick={e => e.preventDefault()}
                  arrow
                  placement="bottomCenter"
                >
                  <Button className="connectWalletBtn">
                    {connectWalletTxt}
                    <DownOutlined />
                  </Button>
                </Dropdown>
              )}
            </Col>
          </Row>
        </Header>
        <Content>
          {account === '' ? (
            <Home dropDownMenu={this.dropDownMenu} />
          ) : (
            <Form account={account} formType={formType} />
          )}
        </Content>
        <Footer></Footer>
      </Layout>
    );
  }
}

export default SuterBridge;
