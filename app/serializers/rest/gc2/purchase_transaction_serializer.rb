class REST::Gc2::PurchaseTransactionSerializer < ActiveModel::Serializer
  attributes :id, :service, :product, :purchased
end
