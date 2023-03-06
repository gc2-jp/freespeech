class Gc2::GoogleConsumablePurchaseService < BaseService
  include Gc2::AccountHelper
  include Gc2::Helper

  def call(user, params)
    validate_params(params)

    set_api

    @user = user
    @product_id = params[:product_id]
    @purchase_token = params[:purchase_token]
    @package_name = android_package_name
    @service = 'google'

    @transaction_id = create_index

    transaction = Gc2::GoogleConsumableTransaction
      .where(transaction_id: @transaction_id)
      .first

    if transaction.nil?
      create_transaction
    else
      get_current_point(@user)
    end
  end

  private

  def validate_params(params)
    raise Gc2::PurchaseError, 'product_id is empty' if params['product_id'].nil?
    raise Gc2::PurchaseError, 'purchase_token is empty' if params['purchase_token'].nil?
  end

  def create_index
    raise Gc2::PurchaseError, 'invalid purchase_token' if @purchase_token.empty?
    Digest::SHA256.hexdigest(@purchase_token)
  end

  # @param user_transaction [Gc2::PurchaseTransaction]
  def check_transaction(user_transaction)
    if user_transaction.present? \
      && user_transaction.user_id != @user.id
      raise Gc2::PurchaseError, 'already used transaction'
    end
  end

  def create_transaction
    @api_client = Gc2::AndroidPublisherClient.new
    @product = @api_client.get_purchase_product(
      @package_name,
      @product_id,
      @purchase_token)
    puts(@product)

    raise Gc2::PurchaseError, "invalid consumption_state = #{@product.consumption_state}" if @product.consumption_state == 0

    product = get_product
    raise Gc2::PurchaseError, "unknown product `#{@product_id}`" if product.nil?

    point = product.point
    price = product.price

    account = find_or_create_point_account(@user)

    response = @api.deposit_point(account.customer_id, 'google', price, point)
    raise Gc2::PurchaseError, 'Failed deposit point' if response.nil?

    @user.gc2_google_consumable_transactions.create({
      transaction_id: @transaction_id,
      product_id: @product_id,
      purchase_token: @purchase_token,
      price: price,
      point: point,
      payload: product
    })

    { point: response[:point] }.to_h
  end

  def get_product
    now = DateTime.now

    Gc2::GoogleConsumableProduct
      .where(product_id: @product_id)
      .where('starts_at < ?', now)
      .where('ends_at >= ?', now)
      .first
  end

end
