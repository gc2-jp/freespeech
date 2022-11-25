class Gc2::AndroidPublisherClient
  def initialize()
    # puts("ENV is ", ENV['GOOGLE_APPLICATION_CREDENTIALS'])
    authorizer = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(ENV['GOOGLE_APPLICATION_CREDENTIALS']),
      scope: 'https://www.googleapis.com/auth/androidpublisher'
    )
    authorizer.fetch_access_token!
    @api_service = Google::Apis::AndroidpublisherV3::AndroidPublisherService.new
    @api_service.authorization = authorizer
  end

  def get_purchase_subscription(package_name, product_id, token)
    @api_service.get_purchase_subscription(
      package_name,
      product_id,
      token)
  end

  def acknowledge_purchase_subscription(package_name, product_id, token)
    @api_service.acknowledge_purchase_subscription(
      package_name,
      product_id,
      token)
  end
end
