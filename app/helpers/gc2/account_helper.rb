module Gc2::AccountHelper

  def set_point_account
    @api = Gc2::PointManagerApi.new
    @gc2_point = find_or_create_point_account(current_user)
  end

  # @param user [User]
  def find_or_create_point_account(user)
    gc2_point = user.gc2_point
    if gc2_point.nil?
      point_user = @api.register(
        :name  => current_user.account.username,
        :email => current_user.email
      )
      Rails.logger.debug("user: #{point_user.to_s}")
      gc2_point = Gc2::PointUser.create!(
        customer_id: point_user[:customer_id],
        user: user
      )
    end
    gc2_point
  end
end
