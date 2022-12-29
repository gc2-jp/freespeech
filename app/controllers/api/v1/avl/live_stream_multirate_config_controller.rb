# frozen_string_literal: true

class Api::V1::Avl::LiveStreamMultirateConfigController < Api::BaseController
  before_action :require_user!
  before_action :init_avl_client

  # this API endpoint might not be needed
  # if it is needed: in Apsara console for pull stream define multirate transcoding group with name "mb-t-1"

  def index
    response = @client.request(
      action: 'GetMultiRateConfig',
      params: {
        "RegionId": ENV["AVL_SERVER_API_REGION_ID"],
        "DomainName": ENV["AVL_PULL_DOMAIN"],
        "App": ENV["AVL_APP_NAME"],
        "GroupId":"mb-t-1"
      },
      opts: {
        method: 'POST'
      }
    )
    render json: response
  end

  private

  def init_avl_client
    connectionParams = { access_key_id: ENV['AVL_SERVER_API_ACCESS_KEY_ID'],
      access_key_secret: ENV['AVL_SERVER_API_ACCESS_KEY_SECRET'],
      endpoint: ENV['AVL_SERVER_API_ENDPOINT'],
      api_version: '2016-11-01' }

      @client = RPCClient.new(connectionParams)
  end
end
