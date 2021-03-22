import { Tooltip, Menu, Dropdown } from 'antd';
import Logo from '../../static/suter_bridge_logo.svg';
import mLogo from '../../static/bridgeMLogo.svg';

const DropMenu = (intl, currentNav) => {
  return (
    <Menu>
      {currentNav !== 'tutorial' ? (
        <Menu.Item key="tutorial">
          <a
            target="_blank"
            href={
              intl.options.currentLocale === 'zh-CN'
                ? 'https://mp.weixin.qq.com/s/V7Ia_4B-6FoTwlsO_BtY0g'
                : 'https://medium.com/suterusu/tutorial-on-suter-bridge-38b7921af0cf'
            }
          >
            {intl.get('Tutorial')}
          </a>
        </Menu.Item>
      ) : (
        ''
      )}
      <Menu.Item key="proof_of_assets">
        <a href="/proof_of_assets" target="_blank">
          {intl.get('ProofOfAssets')}
        </a>
      </Menu.Item>
    </Menu>
  );
};

const Nav = props => {
  let { intl, indexURL, currentNav } = props;
  return (
    <div className="left">
      <a href={indexURL}>
        <img src={Logo} className="logo pc" />
        <img src={mLogo} className="logo mobbile" />
      </a>
      <ul className="item-ul">
        {currentNav !== 'tutorial' ? (
          <li>
            <a
              target="_blank"
              href={
                intl.options.currentLocale === 'zh-CN'
                  ? 'https://mp.weixin.qq.com/s/V7Ia_4B-6FoTwlsO_BtY0g'
                  : 'https://medium.com/suterusu/tutorial-on-suter-bridge-38b7921af0cf'
              }
            >
              {intl.get('Tutorial')}
            </a>
          </li>
        ) : (
          ''
        )}
        {currentNav !== 'proof_of_assets' ? (
          <li>
            <a target="_blank" href="/proof_of_assets">
              {intl.get('ProofOfAssets')}
            </a>
          </li>
        ) : (
          ''
        )}
      </ul>
    </div>
  );
};

export { Nav, DropMenu };
