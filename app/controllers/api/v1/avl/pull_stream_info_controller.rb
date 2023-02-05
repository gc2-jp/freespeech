# frozen_string_literal: true

class Api::V1::Avl::PullStreamInfoController < Api::BaseController
  include Avl::AvlStreamInfoHelper

  before_action :require_user!

  def show
    m3u8PullUrl =  generateM3u8PullStreamUrl params[:id]
    m3u8PortraitPullUrl =  generateM3u8PortraitPullStreamUrl params[:id]
    rtmpPullUrl =  generateRtmpPullStreamUrl params[:id]
    @streamInfo = Avl::AvlPullStreamInfo.new
    @streamInfo.m3u8_pull_url = m3u8PullUrl
    @streamInfo.m3u8_portrait_pull_url = m3u8PortraitPullUrl
    @streamInfo.rtmp_pull_url = rtmpPullUrl
    render json: @streamInfo
  end
end
