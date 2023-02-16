# == Schema Information
#
# Table name: gc2_apple_consumable_transactions
#
#  id             :bigint(8)        not null, primary key
#  user_id        :bigint(8)
#  transaction_id :string
#  price          :integer
#  point          :integer
#  payload        :json
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class Gc2::AppleConsumableTransaction < ApplicationRecord
  belongs_to :user
end
