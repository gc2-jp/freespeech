# frozen_string_literal: true

class PointManagementController < ApplicationController
  include Gc2::AccountHelper

  before_action :authenticate_user!
  before_action :set_point_account

  def show
    token = @api.create_token(:customer_id => @gc2_point.customer_id)
    if token.present?
      @url = @api.get_auth_url(token)
      redirect_to @url
    end
  end

  def has_url?
    @url.present?
  end
end
