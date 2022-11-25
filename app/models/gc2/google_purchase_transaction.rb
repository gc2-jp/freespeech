# == Schema Information
#
# Table name: gc2_apple_purchase_transactions
#
#  id                :bigint(8)        not null, primary key
#  notification_type :tinyint(1)
#  purchase_token    :string
#  subscription      :json
#  message_id        :string
#  notified_at       :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
class Gc2::GooglePurchaseTransaction < ApplicationRecord
end
