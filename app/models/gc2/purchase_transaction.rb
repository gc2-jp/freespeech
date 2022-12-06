# == Schema Information
#
# Table name: gc2_purchase_transactions
#
#  id             :bigint(8)        not null, primary key
#  account_id     :bigint(8)
#  service        :string
#  product        :string
#  started_at     :datetime
#  ended_at       :datetime
#  transaction_id :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class Gc2::PurchaseTransaction < ApplicationRecord
  belongs_to :account
end
