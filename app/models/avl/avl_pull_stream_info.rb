# frozen_string_literal: true

class Avl::AvlPullStreamInfo
  include ActiveModel::Model

  attr_accessor :m3u8_pull_url, :rtmp_pull_url
end
