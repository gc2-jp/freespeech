import { connect } from 'react-redux';

import { fetchSubscription } from './actions';
import AdMonitor from './components/ad_monitor';

const mapStateToProps = (state) => {
  const s = {
    enabled: state.getIn(['gc2', 'purchases', 'enabled']),
  };
  return s;
};

const mapDispatchToProps = (dispatch) => ({
  fetchSubscription: () => dispatch(fetchSubscription()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdMonitor);
