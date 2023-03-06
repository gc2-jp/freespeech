module Gc2::AccountHelper

  def set_api
    @api = Gc2::PointManagerApi.new
  end

  def set_point_account
    set_api
    @gc2_point = find_or_create_point_account(current_user)
  end

  # @param user [User]
  def find_or_create_point_account(user)
    gc2_point = user.gc2_point
    if gc2_point.nil?
      point_user = @api.register(
        :name  => user.account.username,
        :email => user.email
      )
      Rails.logger.debug("user: #{point_user.to_s}")
      gc2_point = Gc2::PointUser.create!(
        customer_id: point_user[:customer_id],
        user: user
      )
    end
    gc2_point
  end

  def get_current_point(user)
    account = find_or_create_point_account(user)
    @api.get_account(account.customer_id)
  end

end
