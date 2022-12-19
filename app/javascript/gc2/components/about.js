import React from 'react';
import Column from '../../mastodon/features/ui/components/column';
import ColumnBackButtonSlim from '../../mastodon/components/column_back_button_slim';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

const messages = defineMessages({
  heading: { id: 'gc2_ad_about.heading', defaultMessage: 'About advertisement' },
});

export default @injectIntl
class AboutAd extends React.Component {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  render() {
    const { intl, multiColumn } = this.props;
    return (
      <Column bindToDocument={!multiColumn} heading={intl.formatMessage(messages.heading)}>
        <ColumnBackButtonSlim />
        <div className='gc2-about-ad scrollable'>
          <div className='column-list'>
            <h2>広告表示について</h2>
            <div>iOSまたはAndroidのGC2アプリにて有料登録したアカウントでログインした場合は、Webサイト上の広告が表示されなくなります。</div>
            <div>アプリで有料登録をしたにも関わらずWebサイト上の広告が消えない場合は以下をお試しください。</div>
            <ul>
              <li>アプリの再起動</li>
              <li>Webサイトのリロード、ブラウザの再起動など</li>
            </ul>
          </div>
        </div>
      </Column>
    );
  }

}
