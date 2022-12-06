class Gc2::AppleNotificationInfo
  include Gc2::Helper

  def initialize(token)
    @payload = decode_jws(token)

    data = @payload.delete('data')

    raise Mastodon::ValidationError, "invalid bundleId" unless check_ios_bundle_id?(data['bundleId'])

    signed_transaction_info = data.delete('signedTransactionInfo')
    @transaction_info = decode_jws(signed_transaction_info) if signed_transaction_info.present?

    signed_renewal_info = data.delete('signedRenewalInfo')
    @renewal_info = decode_jws(signed_renewal_info) if signed_renewal_info.present?
    puts("payload: #{@payload}")
  end

  def notification_type()
    @payload['notificationType']
  end

  def subtype()
    @payload['subtype']
  end

  def notification_uuid()
    @payload['notificationUUID']
  end

  def version()
    @payload['version']
  end

  def signed_date()
    signed_date = @payload['signedDate']
    if signed_date.present?
      Time.at(signed_date / 1000.0)
    else
      nil
    end
  end

  def transaction_info()
    @transaction_info
  end

  def renewal_info()
    @renewal_info
  end
end

