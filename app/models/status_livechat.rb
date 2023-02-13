# == Schema Information
#
# Table name: status_livechat
#
#  id         :bigint(8)        not null, primary key
#  status_id  :bigint(8)        not null
#  room_id    :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class StatusLivechat < ApplicationRecord
  belongs_to :status, inverse_of: :status_livechat
end
