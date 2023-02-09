module Gc2::AccountHelper

  def set_point_account
    @api = Gc2::PointManagerApi.new
    @gc2_point = current_user.gc2_point
    if @gc2_point.nil?
      user = @api.register(
        :name  => current_user.account.username,
        :email => current_user.email
      )
      Rails.logger.debug("user: #{user.to_s}")
      @gc2_point = Gc2::PointUser.create!(
        customer_id: user[:customer_id],
        user: current_user
      )
    end
  end
end
