# frozen_string_literal: true

class TransactionsController < ApplicationController
  def index
    @instance_presenter = InstancePresenter.new
  end
end
