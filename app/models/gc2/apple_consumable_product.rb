# == Schema Information
#
# Table name: gc2_apple_consumable_products
#
#  id         :bigint(8)        not null, primary key
#  product_id :string
#  price      :integer
#  point      :integer
#  starts_at  :datetime
#  ends_at    :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Gc2::AppleConsumableProduct < ApplicationRecord
end
