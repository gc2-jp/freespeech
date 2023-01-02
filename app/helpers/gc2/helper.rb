module Gc2::Helper
  private

  @@apple_root_certificate_g3 = OpenSSL::X509::Certificate.new(File.read(Rails.root.join('apple-root-ca-g3.pem')));
  @@apple_cert_store = OpenSSL::X509::Store.new
  @@apple_cert_store.add_cert(@@apple_root_certificate_g3)

  def decode_jws(token)
    payload, * = JWT.decode(token, nil, true, {algorithm: "ES256"}) do |headers|
      cert_target, *cert_chain = headers["x5c"].map { |cert| OpenSSL::X509::Certificate.new(Base64.decode64(cert)) }
      @@apple_cert_store.verify(cert_target, cert_chain)
      cert_target.public_key
    end
    payload
  end

  def check_ios_bundle_id?(bundle_id)
    puts "config.bundle.id: #{Rails.application.config_for(:gc2)['ios_bundle_id']}"
    bundle_id == Rails.application.config_for(:gc2)['ios_bundle_id']
  end

  def check_android_package_name?(package_name)
    package_name == Rails.application.config_for(:gc2)['android_package_name']
  end

  def invalid_signed_payload
    render json: { error: 'invalid signedPayload' }, status: 400
  end

  def invalid_subscription(e)
    render json: { error: e.to_s }, status: 400
  end
end
