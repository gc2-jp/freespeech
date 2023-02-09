class Api::V1::Gc2::AccountController < Api::BaseController
  include Gc2::AccountHelper

  before_action :require_user!
  before_action :set_point_account

  def point
    account = @api.get_account(@gc2_point.customer_id)
    render json: account
  end

end
