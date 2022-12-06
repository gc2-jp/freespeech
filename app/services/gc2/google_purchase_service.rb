class Gc2::GooglePurchaseService < BaseService
  def call(account, params)
    validate_params(params)

    @account = account
    @product_id = params[:subscription_id]
    @purchase_token = params[:purchase_token]
    @package_name = Rails.application.config_for(:gc2)['android_package_name']
    @service = 'google'

    @api_client = Gc2::AndroidPublisherClient.new
    @subscription = @api_client.get_purchase_subscription(
      @package_name,
      @product_id,
      @purchase_token)
    puts(@subscription)

    raise Gc2::PurchaseError, "invalid orderId" if @subscription.order_id.nil? || @subscription.order_id.empty?

    if @subscription.acknowledgement_state == 0
      acknowledge_purchase
    end

    account_transaction = Gc2::PurchaseTransaction.where(
      service: @service,
      transaction_id: original_order_id
    ).first
    puts(account_transaction)

    check_transaction(account_transaction)
  
    if account_transaction.nil?
      create_purchase
    else
      update_purchase(account_transaction)
    end
  end

  private

  def validate_params(params)
    raise Gc2::PurchaseError, 'subscription_id is empty' if params['subscription_id'].nil?
    raise Gc2::PurchaseError, 'purchase_token is empty' if params['purchase_token'].nil?
  end

  # @param account_transaction [Gc2::PurchaseTransaction]
  def check_transaction(account_transaction)
    if account_transaction.present? \
      && account_transaction.account_id != @account.id
      raise Gc2::PurchaseError, 'already used transaction'
    end
  end

  def acknowledge_purchase
    res = @api_client.acknowledge_purchase_subscription(
      @package_name,
      @product_id,
      @purchase_token)
    puts("acknowledge_purchase: #{res}")
  end

  def create_purchase
    purchase_transaction = {
      service: @service,
      product: @product_id,
      started_at: start_time.to_datetime,
      ended_at: expiry_time.to_datetime,
      transaction_id: original_order_id
    }
    @account.purchase_transaction.create!(purchase_transaction)
  end

  # @param account_transaction [Gc2::PurchaseTransaction]
  def update_purchase(account_transaction)
    if account_transaction.service == 'google' \
      && account_transaction.product == @product_id
      account_transaction.update(
        started_at: start_time.to_datetime,
        ended_at: expiry_time.to_datetime
      )
    end
  end

  def original_order_id()
    ids = @subscription.order_id.split('..')
    ids[0]
  end

  def start_time
    t = @subscription.start_time_millis
    if t.present?
      Time.at(t / 1000.0)
    else
      Time.now
    end
  end

  def expiry_time
    t = @subscription.expiry_time_millis
    if t.present?
      Time.at(t / 1000.0)
    else
      Float::INFINITY
    end
  end
end
