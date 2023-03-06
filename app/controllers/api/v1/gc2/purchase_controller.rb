class Api::V1::Gc2::PurchaseController < Api::BaseController
  include Gc2::Helper

  rescue_from JWT::DecodeError, with: :invalid_signed_payload
  rescue_from Gc2::PurchaseError, Google::Apis::ClientError, with: :invalid_subscription

  before_action -> { doorkeeper_authorize! :read }, only: [:index]
  before_action -> { doorkeeper_authorize! :write }, only: [:ios, :android]
  before_action :require_user!

  def index
    purchased = current_user.account.gc2_subscribed_exists?
    puts "purchased: #{purchased}"
    result = {
      purchased: purchased
    }
    render json: result
  end

  def ios
    payload = decode_jws(ios_purchase_params[:signedPayload])
    purchase_transaction = Gc2::ApplePurchaseService.new.call(
      current_user.account,
      payload
    )
    puts "result: #{purchase_transaction}"
    # render json: purchase_transaction, serializer: REST::Gc2::PurchaseTransactionSerializer
    render_empty
  end

  def android
    purchase_transaction = Gc2::GooglePurchaseService.new.call(
      current_user.account,
      android_purchase_params
    )
    render_empty
  end

  def ios_iaps
    payload = decode_jws(ios_purchase_params[:signedPayload])
    Gc2::AppleConsumablePurchaseService.new.call(
      current_user,
      payload
    )
    render_empty
  end

  def android_iaps
    result = Gc2::GoogleConsumablePurchaseService.new.call(
      current_user,
      android_purchase_iaps_params
    )
    render json: result
  end

  private

  def ios_purchase_params
    params.permit(:signedPayload)
  end

  def android_purchase_params
    params.permit(:subscription_id, :purchase_token)
  end

  def android_purchase_iaps_params
    params.permit(:product_id, :purchase_token)
  end
end
