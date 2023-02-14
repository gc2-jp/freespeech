class Gc2::PointManagerApi
  def register(params)
    url = api_url + '/api/register'
    req = Request.new(:post, url, body: to_api_data(params))
    req.add_headers(
      'Authorization' => "Bearer #{api_key}",
      'Content-Type' => 'application/json'
    )
    req.perform do |res|
      body = res.body_with_limit
      if res.code == 200
        res = JSON.parse(body).deep_transform_keys { |k| k.underscore }.deep_symbolize_keys
        res[:user]
      else
        Rails.logger.error "[#{res.code}] #{body}"
        nil
      end
    end
  end

  def create_token(params)
    url = "#{api_url}/api/token"
    req = Request.new(:post, url, body: to_api_data(params))
    req.add_headers(
      'Authorization' => "Bearer #{api_key}",
      'Content-Type' => 'application/json'
    )
    req.perform do |res|
      body = res.body_with_limit
      Rails.logger.debug("response: #{body}")
      if res.code == 200
        res = JSON.parse(body).deep_transform_keys { |k| k.underscore }.deep_symbolize_keys
        res[:token]
      else
        Rails.logger.error "[#{res.code}] #{body}"
        nil
      end
    end
  end

  def get_auth_url(token)
    "#{api_url}/auth?t=#{token}"
  end

  def get_account(customer_id)
    url = "#{api_url}/api/point/#{customer_id}"
    req = Request.new(:get, url)
    req.add_headers('Authorization' => "Bearer #{api_key}")
    req.perform do |res|
      body = res.body_with_limit
      Rails.logger.debug("response: #{body}")
      if res.code == 200
        parse_response(body)
      else
        Rails.logger.error "[#{res.code}] #{body}"
        nil
      end
    end
  end

  def expend_point(customer_id, target_customer_id, room_id, point)
    url = "#{api_url}/api/point/#{customer_id}/expend"
    data = {
      :target_customer_id => target_customer_id,
      :transaction_id => room_id,
      :point => point,
    }
    req = Request.new(:post, url, body: to_api_data(data))
    req.add_headers(
      'Authorization' => "Bearer #{api_key}",
      'Content-Type' => 'application/json'
    )
    req.perform do |res|
      body = res.body_with_limit
      Rails.logger.debug("response: #{body}")
      if res.code == 200
        parse_response(body)
      else
        Rails.logger.error "[#{res.code}] #{body}"
        nil
      end
    end
  end

  private

  def api_url
    Rails.application.config_for(:gc2)[:point_management_url]
  end

  def api_key
    Rails.application.config_for(:gc2)[:point_management_key]
  end

  def to_api_data(params)
    JSON.dump(params.with_indifferent_access.deep_transform_keys { |k| k.camelize(:lower) })
  end

  def parse_response(body)
    JSON.parse(body).deep_transform_keys { |k| k.underscore }.deep_symbolize_keys
  end
end
