import React from 'react';
import { Layout } from 'antd';
const { Header, Footer, Content } = Layout;
import { Row, Col, Button } from 'antd';
import {
  openNotificationWithIcon,
  EthChainNameMap,
  BscChainNameMap,
} from '../components/tools';
import detectEthereumProvider from '@metamask/detect-provider';
import intl from 'react-intl-universal';
import 'antd/dist/antd.css';
import Logo from '../static/suter_bridge_logo.svg';
import MLogo from '../static/bridgeMLogo.svg';
import Home from '../components/home';
import Form from '../components/form';

const locales = {
  'en-US': require('../locales/en_US'),
  'zh-CN': require('../locales/zh_CN'),
};

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
    this.connectMetaMask = this.connectMetaMask.bind(this);
    this.checkEthNetworkType = this.checkEthNetworkType.bind(this);
  }
  componentDidMount() {
    setTimeout(this.checkMetaMaskStatus, 1500);
    this.loadLocales();
  }

  loadLocales = (lang = 'en-US') => {
    // init method will load CLDR locale data according to currentLocale
    // react-intl-universal is singleton, so you should init it only once in your app
    var userLang = navigator.language || navigator.userLanguage;
    if (userLang) {
      if (userLang === 'zh') {
        lang = 'zh-CN';
      }
    }
    let cacheLang = localStorage.getItem('lang');
    if (cacheLang) {
      lang = cacheLang;
    }
    intl
      .init({
        currentLocale: lang, // TODO: determine locale here
        locales,
      })
      .then(() => {
        // After loading CLDR locale data, start to render
        this.setState({ initDone: true });
      });
  };

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
    if (chainId === BridgeInfo.Mint.CHAIN_ID) {
      this.setCurrentAccount(account, 'Mint');
    } else {
      this.setCurrentAccount(account, 'Revert');
    }
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
        intl.get('MetaMaskAccountChanged'),
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
        intl.get('ChainChanged'),
        intl.get('PageWillRefresh'),
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
      (window.ethereum.chainId == BridgeInfo.Mint.CHAIN_ID ||
        window.ethereum.chainId == BridgeInfo.Revert.CHAIN_ID)
    ) {
      // this.connectMetaMask();
    } else {
      openNotificationWithIcon(
        intl.get('NetworkError'),
        `${intl.get('PleaseChangeMetaMaskNetworkTo')} ${
          EthChainNameMap[BridgeInfo.Mint.CHAIN_ID]
        } ${intl.get('or')} ${BscChainNameMap[BridgeInfo.Revert.CHAIN_ID]}`,
        'warning',
        4.5,
      );
    }
  }

  langChangeTo = lang => {
    localStorage.setItem('lang', lang);
    this.loadLocales(lang);
  };

  render() {
    const { connectWalletTxt, account, formType, chainId } = this.state;
    let lang = intl.options.currentLocale;
    const scanLink =
      formType == 'Mint'
        ? `${BridgeInfo.Mint.SCAN}/address/${account}`
        : `${BridgeInfo.Revert.SCAN}/address/${account}`;
    return (
      <Layout className="suterBridge">
        <Header>
          <Row>
            <Col lg={12} xl={12} md={12} sm={12} xs={12}>
              <a href="/">
                <img src={Logo} className="logo pc" />
                <img src={MLogo} className="logo mobile" width="45px" />
              </a>
            </Col>
            <Col lg={12} xl={12} md={12} sm={12} xs={12}>
              <div className="header-btn">
                {account !== '' ? (
                  <a href={scanLink} target="_blank">
                    <Button className="connectWalletBtn" shape="round">
                      <div className="successDot"></div>
                      {connectWalletTxt}
                    </Button>
                  </a>
                ) : (
                  ''
                )}
                <div className="top-btn">
                  <i
                    onClick={() => this.langChangeTo('en-US')}
                    className={`${lang === 'en-US' ? 'active' : ''}`}
                  >
                    EN
                  </i>
                  <i
                    className={`${lang === 'zh-CN' ? 'active' : ''}`}
                    onClick={() => this.langChangeTo('zh-CN')}
                  >
                    中
                  </i>
                </div>
              </div>
            </Col>
          </Row>
        </Header>
        <Content>
          {account === '' ? (
            <Home
              chainId={chainId}
              connectMetaMask={this.connectMetaMask}
              intl={intl}
            />
          ) : (
            <Form account={account} formType={formType} intl={intl} />
          )}
        </Content>
        <Footer></Footer>
      </Layout>
    );
  }
}

export default SuterBridge;
