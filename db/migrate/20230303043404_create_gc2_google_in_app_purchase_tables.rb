class CreateGc2GoogleInAppPurchaseTables < ActiveRecord::Migration[6.1]
  def change
    create_table :gc2_google_consumable_products do |t|
      t.string :product_id
      t.integer :price
      t.integer :point
      t.datetime :starts_at
      t.datetime :ends_at

      t.timestamps
    end

    add_index :gc2_google_consumable_products, [:product_id]

    create_table :gc2_google_consumable_transactions do |t|
      t.references :user

      t.string :transaction_id
      t.string :product_id
      t.string :purchase_token
      t.integer :price
      t.integer :point
      t.json :payload

      t.timestamps
    end

    add_index :gc2_google_consumable_transactions, [:transaction_id], unique: true
  end
end
