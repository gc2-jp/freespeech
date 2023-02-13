class CreateStatusLivechats < ActiveRecord::Migration[6.1]
  def change
    create_table :status_livechats do |t|
      t.references :status
      t.string :room_id

      t.timestamps
    end
  end
end
