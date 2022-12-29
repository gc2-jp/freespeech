# frozen_string_literal: true

class Api::V1::Avl::LiveStreamsOnlineListController < Api::BaseController
  before_action :require_user!
  before_action :init_avl_client

  def index
    response = @client.request(
      action: 'DescribeLiveStreamsOnlineList',
      params: {
        "RegionId": ENV["AVL_SERVER_API_REGION_ID"],
        "DomainName": ENV["AVL_PULL_DOMAIN"],
        "AppName": ENV["AVL_APP_NAME"]
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
