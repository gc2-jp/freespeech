
class Gc2::AppleStoreServerNotificationService < BaseService
  include Gc2::Helper

  # @param payload [Gc2::AppleNotificationInfo]
  def call(payload)
    @payload = payload
    # puts("type: #{@payload.notification_type}")
    # puts("transactionInfo: #{@payload.transaction_info}")
    # puts("renewalInfo: #{@payload.renewal_info}")

    return if Gc2::ApplePurchaseTransaction.where(notification_uuid: @payload.notification_uuid).exists?

    transaction = create_transaction
    case @payload.notification_type
    when 'SUBSCRIBED', 'DID_RENEW' then
      update_account_transaction
    end

  end

  private

  def create_transaction
    transaction = {
      notification_type: @payload.notification_type,
      subtype: @payload.subtype,
      notification_uuid: @payload.notification_uuid,
      signed_date: @payload.signed_date.to_datetime,
      transaction_info: @payload.transaction_info,
      renewal_info: @payload.renewal_info
    }
    Gc2::ApplePurchaseTransaction.create(transaction)
  end

  def update_account_transaction()
    transaction_id = @payload.transaction_info['originalTransactionId']
    account_transaction = Gc2::PurchaseTransaction.where(transaction_id: transaction_id).first
    if account_transaction.present? \
      && account_transaction.service == 'apple' \
      && account_transaction.product == @payload.transaction_info['productId']

      started_at = transaction_purchased_at
      ended_at = transaction_expired_at
      if started_at.present? \
        && ended_at.present?
        account_transaction.update(
          started_at: started_at.to_datetime,
          ended_at: ended_at.to_datetime
        )
      end
    end
  end

  def transaction_purchased_at
    purchase_date = @payload.transaction_info['purchaseDate']
    if purchase_date.present?
      Time.at(purchase_date / 1000.0)
    else
      Time.now
    end
  end

  def transaction_expired_at
    expires_date = @payload.transaction_info['expiresDate']
    if expires_date.present?
      Time.at(expires_date / 1000.0)
    else
      nil
    end
  end
end
