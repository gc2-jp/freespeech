# frozen_string_literal: true

class Api::V1::Avl::PushStreamInfoController < Api::BaseController
  include Avl::AvlStreamInfoHelper

  before_action :require_user!

  def show
    pushUrl =  generateRtcPushStreamUrl params[:id]
    @streamInfo = Avl::AvlPushStreamInfo.new
    @streamInfo.push_stream_url = pushUrl
    render json: @streamInfo
  end
end
