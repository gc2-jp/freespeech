class CreateGc2PointUser < ActiveRecord::Migration[6.1]
  def change
    create_table :gc2_point_users do |t|
      t.references :user
      t.string :customer_id

      t.timestamps
    end
  end
end
