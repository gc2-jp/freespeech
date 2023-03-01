class AddStatusLivechatParams < ActiveRecord::Migration[6.1]
  def change
    add_column :status_livechats, :end_at, :datetime
  end
end
