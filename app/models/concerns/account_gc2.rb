module AccountGc2
  extend ActiveSupport::Concern

  included do
    # purchase transaction
    has_many :purchase_transaction, class_name: 'Gc2::PurchaseTransaction', inverse_of: :account, dependent: :destroy
  end

  def gc2_subscribed_exists?()
    now = Time.now
    purchase_transaction.where('started_at <= ? AND ended_at >= ?', now, now).exists?
  end

  def gc2_transaction_exists?(service, transaction_id)
    purchase_transaction.where(service: service, transaction_id: transaction_id).exists?
  end
end
