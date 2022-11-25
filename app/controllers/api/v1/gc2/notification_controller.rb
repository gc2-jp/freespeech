class Api::V1::Gc2::NotificationController < Api::BaseController
  include Gc2::Helper

  rescue_from JWT::DecodeError, with: :invalid_signed_payload

  skip_before_action :require_authenticated_user!

  def ios
    payload = Gc2::AppleNotificationInfo.new(params[:signedPayload])
    Gc2::AppleStoreServerNotificationService.new.call(payload)

    render_empty
  end

  def android
    message = Gc2::GoogleNotificationInfo.new(params[:message])
    Gc2::GooglePlayNotificationService.new.call(message)

    render_empty
  end

  private

  def create_params
    params.require(:notification).permit(:signedPayload)
  end
end
