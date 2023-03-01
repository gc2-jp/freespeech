# frozen_string_literal: true

class Api::V1::Timelines::LivechatAvailableController < Api::BaseController
  before_action :require_user!
  after_action :insert_pagination_headers, unless: -> { @statuses.empty? }

  def show
    @statuses = load_statuses
    render json: @statuses, each_serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new(@statuses, current_user&.account_id)
  end

  private

  def load_statuses
    cached_livechat_available_statuses_page
  end

  def cached_livechat_available_statuses_page
    cache_collection(livechat_available_statuses, Status)
  end

  def livechat_available_statuses
    livechat_available_feed.get(
      limit_param(DEFAULT_STATUSES_LIMIT),
      params[:max_id],
      params[:since_id],
      params[:min_id]
    )
  end

  def livechat_available_feed
    LivechatAvailableFeed.new(current_account)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def pagination_params(core_params)
    params.slice(:local, :remote, :limit, :only_media).permit(:local, :remote, :limit, :only_media).merge(core_params)
  end

  def next_path
    api_v1_timelines_livechat_available_url pagination_params(max_id: pagination_max_id)
  end

  def prev_path
    api_v1_timelines_livechat_available_url pagination_params(min_id: pagination_since_id)
  end

  def pagination_max_id
    @statuses.last.id
  end

  def pagination_since_id
    @statuses.first.id
  end
end
