class CreateGc2PurchaseTransactionTables < ActiveRecord::Migration[6.1]
  def change
    create_table :gc2_purchase_transactions do |t|
      t.references :account
      t.string :service
      t.string :product
      t.datetime :started_at
      t.datetime :ended_at
      t.string :transaction_id

      t.timestamps
    end

    add_index :gc2_purchase_transactions, [:service, :transaction_id], unique: true

    create_table :gc2_apple_purchase_transactions do |t|
      t.string :notification_type
      t.string :subtype
      t.string :notification_uuid
      t.datetime :signed_date
      t.json :transaction_info
      t.json :renewal_info

      t.timestamps
    end

    add_index :gc2_apple_purchase_transactions, [:notification_uuid], unique: true

    create_table :gc2_google_purchase_transactions do |t|
      t.integer :notification_type, :limit => 1
      t.string :purchase_token
      t.json :subscription
      t.string :message_id
      t.datetime :notified_at

      t.timestamps
    end

    add_index :gc2_google_purchase_transactions, [:message_id], unique: true
  end
end
