# == Schema Information
#
# Table name: gc2_point_users
#
#  id          :bigint(8)        not null, primary key
#  user_id     :bigint(8)
#  customer_id :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
class Gc2::PointUser < ApplicationRecord
  belongs_to :user
end
