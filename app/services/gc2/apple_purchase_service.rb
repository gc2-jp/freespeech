
class Gc2::ApplePurchaseService < BaseService
  include Gc2::Helper

  def call(account, payload)
    @service = 'apple'
    @account = account
    @payload = payload
    puts @payload

    raise Mastodon::ValidationError, "invalid bundleId" unless check_bundle_id?

    account_transaction = Gc2::PurchaseTransaction.where(
      service: 'apple',
      transaction_id: transaction_id
    ).first
    if account_transaction.nil?
      create_purchase
    else
      update_purchase(account_transaction)
    end
  end

  private

  def create_purchase
    purchase_transaction = {
      service: @service,
      product: @payload['productId'],
      started_at: purchased_at.to_datetime,
      ended_at: expired_at.to_datetime,
      transaction_id: transaction_id
    }
    @account.purchase_transaction.create!(purchase_transaction)
  end

  # @param account_transaction [Gc2::PurchaseTransaction]
  def update_purchase(account_transaction)
    if account_transaction.service == 'apple' \
      && account_transaction.product == @payload['productId']

      started_at = purchased_at
      ended_at = expired_at
      if started_at.present? && ended_at.present?
        account_transaction.update(
          started_at: started_at.to_datetime,
          ended_at: ended_at.to_datetime
        )
      end
    end
  end

  def check_bundle_id?
    check_ios_bundle_id?(@payload['bundleId'])
  end

  def transaction_id
    @payload['originalTransactionId'] || @payload['transactionId']
  end

  def purchased_at
    purchase_date = @payload['purchaseDate']
    if purchase_date.present?
      Time.at(purchase_date / 1000.0)
    else
      Time.now
    end
  end

  def expired_at
    expires_date = @payload['expiresDate']
    if expires_date.present?
      Time.at(expires_date / 1000.0)
    else
      Float::INFINITY
    end
  end
end
