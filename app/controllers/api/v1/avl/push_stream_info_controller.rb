# frozen_string_literal: true

class Api::V1::Avl::PushStreamInfoController < Api::BaseController
  include Avl::AvlStreamInfoHelper

  before_action :require_user!
  before_action :set_firebase

  def show
    roomId = params[:id]
    orientation = params[:orientation]
    if orientation == "portrait"
      orientation = "portrait"
    else
      orientation = "landscape"
    end

    pushUrl =  generateRtcPushStreamUrl roomId
    if orientation == "portrait"
      m3u8_pull_url = generateM3u8PortraitPullStreamUrl roomId
    else
      m3u8_pull_url = generateM3u8PullStreamUrl roomId
    end
    room = {
      :m3u8_pull_url => m3u8_pull_url,
      :orientation => orientation,
    }
    response = @firebase.update("room/#{roomId}", room)

    @streamInfo = Avl::AvlPushStreamInfo.new
    @streamInfo.push_stream_url = pushUrl
    @streamInfo.m3u8_pull_url = m3u8_pull_url
    render json: @streamInfo
  end

  private

  def set_firebase
    # private_key_json_string = File.open(ENV['GOOGLE_APPLICATION_CREDENTIALS']).read
    # @firebase = Firebase::Client.new(ENV['FIREBASE_DATABASEURL'], private_key_json_string)
    puts "#{ENV['FIREBASE_DATABASEURL']}, #{ENV['FIREBASE_DATABASE_SECRET']}"
    @firebase = Firebase::Client.new(ENV['FIREBASE_DATABASEURL'], ENV['FIREBASE_DATABASE_SECRET'])
    @firebase.request.connect_timeout = 10
  end

end
