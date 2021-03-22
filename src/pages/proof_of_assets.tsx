import React from 'react';
import { Layout } from 'antd';
const { Header, Footer, Content } = Layout;
import { Row, Col, Button } from 'antd';
import intl from 'react-intl-universal';
import 'antd/dist/antd.css';
import { Nav } from '../components/nav';
import CopyIcon from '../static/copy.svg';
import LinkIcon from '../static/link.svg';
import LinkLogoIcon from '../static/linkLogo.svg';
const locales = {
  'en-US': require('../locales/en_US'),
  'zh-CN': require('../locales/zh_CN'),
};

class SuterBridge extends React.Component {
  state = {
    erc20BridgeBalance: 0,
    erc2oBrigeColdWalletBalance: 0,
    bep20BridgeBalance: 0,
  };

  constructor(props) {
    super(props);
  }
  componentDidMount() {
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
  langChangeTo = lang => {
    localStorage.setItem('lang', lang);
    this.loadLocales(lang);
  };

  render() {
    let lang = intl.options.currentLocale;
    let {
      erc20BridgeBalance,
      erc2oBrigeColdWalletBalance,
      bep20BridgeBalance,
    } = this.state;
    return (
      <Layout className="suterBridge">
        <Header>
          <div className="head-top">
            <Nav intl={intl} indexURL="/" currentNav="proof_of_assets" />
          </div>
          <div className="header-btn">
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
        </Header>
        <Content>
          <div className="proofOfAssets">
            <Row style={{ alignItems: 'center' }}>
              <Col xs={24} sm={24} md={11} lg={11} xl={11}>
                <h1>ERC20 Assets</h1>
                <div className="card">
                  <div className="item mb20">
                    <p>ERC20 SUTER Bridge Contract</p>
                    <div className="block">
                      <div className="left">
                        <h2>{erc20BridgeBalance.toLocaleString()} SUTER</h2>
                        <div className="address">
                          {BridgeInfo['Mint'].CONTRACT_ADDRESS}
                        </div>
                      </div>
                      <div>
                        <img src={CopyIcon} alt="copy" />
                        <img src={LinkIcon} alt="link" />
                      </div>
                    </div>
                  </div>
                  <div className="item">
                    <p>Suter Bridge Cold Wallet</p>
                    <div className="block">
                      <div className="left">
                        <h2>
                          {erc2oBrigeColdWalletBalance.toLocaleString()} SUTER
                        </h2>
                        <div className="address">
                          {BridgeInfo['Revert'].CONTRACT_ADDRESS}
                        </div>
                      </div>
                      <div>
                        <img src={CopyIcon} alt="copy" />
                        <img src={LinkIcon} alt="link" />
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={0} sm={0} md={1} lg={1} xl={1} className="linkLogo">
                <img src={LinkLogoIcon} alt="link icon" />
              </Col>
              <Col xs={24} sm={24} md={11} lg={11} xl={11}>
                <h1>BEP20 Assets</h1>
                <div className="card">
                  <div className="item mb20">
                    <p>BEP20 SUTER Bridge Contract</p>
                    <div className="block">
                      <div className="left">
                        <h2>{bep20BridgeBalance.toLocaleString()} SUTER</h2>
                        <div className="address">
                          {BridgeInfo['Revert'].CONTRACT_ADDRESS}
                        </div>
                      </div>
                      <div>
                        <img src={CopyIcon} alt="copy" />
                        <img src={LinkIcon} alt="link" />
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Content>
        <Footer></Footer>
      </Layout>
    );
  }
}

export default SuterBridge;
