
class Gc2::AppleConsumablePurchaseService < BaseService
  include Gc2::AccountHelper
  include Gc2::Helper

  def call(user, payload)
    @user = user
    @payload = payload

    raise Mastodon::ValidationError, "invalid bundleId" unless check_bundle_id?

    transaction = Gc2::AppleConsumableTransaction
      .where(transaction_id: transaction_id)
      .first

    if transaction.nil?
      create_transaction
    else
      get_curent_point(@user)
    end
  end

  private

  def check_bundle_id?
    check_ios_bundle_id?(@payload['bundleId'])
  end

  def transaction_id
    @payload['transactionId']
  end

  def product_id
    @payload['productId']
  end

  def create_transaction
    set_api

    product = get_product
    raise Gc2::PurchaseError, "unknown product `#{product_id}`" if product.nil?

    point = product.point
    price = product.price

    account = find_or_create_point_account(@user)

    response = @api.deposit_point(account.customer_id, 'apple', price, point)
    raise Gc2::PurchaseError, 'Failed deposit point' if response.nil?

    @user.gc2_apple_consumable_transactions.create({
      transaction_id: transaction_id,
      price: price,
      point: point,
      payload: @payload
    })

    { point: response[:point] }.to_h
  end

  def get_product
    now = DateTime.now

    Gc2::AppleConsumableProduct
      .where(product_id: product_id)
      .where('starts_at < ?', now)
      .where('ends_at >= ?', now)
      .first
  end

end
