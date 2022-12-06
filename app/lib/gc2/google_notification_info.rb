class Gc2::GoogleNotificationInfo

  class SubscriptionNotification
    attr_reader :version, :notification_type, :purchase_token, :subscription_id

    def initialize(params)
      @version = params['version']
      @notification_type = params['notificationType']
      @purchase_token = params['purchaseToken']
      @subscription_id = params['subscriptionId']
    end
  end

  private_constant :SubscriptionNotification

  attr_reader :message_id, :version, :package_name, :event_time_millis, :subscription_notification

  def initialize(message)
    decoded_message = Base64.decode64(message[:data])
    d = JSON.parse(decoded_message)
    puts("message.data: #{d}")
    @message_id = message[:messageId]
    @version = d['version']
    @package_name = d['packageName']
    @event_time_millis = d['eventTimeMillis']&.to_i
    @subscription_notification = SubscriptionNotification.new(d['subscriptionNotification']) if d['subscriptionNotification'].present?
  end

  def to_s
    self.to_json
  end

end
