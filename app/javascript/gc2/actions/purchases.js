import api from '../../mastodon/api';

export const SET_PURCHASE_STATUS = 'SET_PURCHASE_STATUS';

export const setPurchaseStatus = (purchased) => ({
  type: SET_PURCHASE_STATUS,
  purchased,
});

export function fetchSubscription() {
  return async (dispatch, getState) => {
    try {
      const response = await api(getState).get('/api/v1/gc2/purchase');
      dispatch(setPurchaseStatus(response.data.purchased));
    } catch (e) {
      console.error(e);
      dispatch(setPurchaseStatus(false));
    }
  };
}
