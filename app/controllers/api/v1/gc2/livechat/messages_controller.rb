class Api::V1::Gc2::Livechat::MessagesController < Api::BaseController
  include RoutingHelper
  include Gc2::Helper
  include Gc2::AccountHelper

  before_action :require_user!
  before_action :set_point_account
  before_action :set_firebase

  rescue_from Gc2::InvalidLivechatMessageError, with: :invalid_livechat_message

  def create
    account = @api.get_account(@gc2_point.customer_id)
    data = create_message_params
    Rails.logger.debug("data: #{data}")
    raise Gc2::InvalidLivechatMessageError, 'invalid roomId' if data[:room_id].to_s.blank?
    raise Gc2::InvalidLivechatMessageError, 'invalid message' if data[:text].to_s.blank? && data[:point].to_i == 0

    room_id = data[:room_id]
    point = data[:point]

    message = {
      :user_id => current_account.id.to_s,
      :acct => current_account.acct,
      :display_name => (current_account.display_name.presence || current_account.username),
      :avatar => full_asset_url(current_account.avatar.url),
      :created_at => (Time.now.to_f * 1000).to_i,
      :text => data[:text].to_s,
      :point => data[:point].to_i,
    }
    response = @firebase.push("messages/#{room_id}", message)
    raise Gc2::InvalidLivechatMessageError, 'failed push message' if response.code != 200
    Rails.logger.debug("firebase.push response: #{response.body.to_s}")
    message_id = response.body['name']

    response = @api.expend_point(@gc2_point.customer_id, point)
    if response.nil?
      Rails.logger.debug("remove message: #{message_id}")
      response = @firebase.delete("messages/#{room_id}/#{message_id}")
      Rails.logger.debug("remove message response(#{response.code}): #{response.body.to_s}")
      # ポイント消費でエラーになったので、作成したメッセージを削除
      raise Gc2::InvalidLivechatMessageError, 'Failed expend point'
    end

    render json: {}
  end

  private

  def create_message_params
    params.permit(:room_id, :text, :point)
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
