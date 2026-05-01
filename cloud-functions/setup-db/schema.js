const COLLECTIONS = [
  {
    name: 'users',
    fields: ['openid', 'nickname', 'created_at', 'onboarded_at']
  },
  {
    name: 'fishing_spots',
    fields: [
      'id',
      'owner_openid',
      'name',
      'latitude',
      'longitude',
      'fishing_style',
      'coast_orientation',
      'created_at'
    ]
  },
  {
    name: 'user_spots',
    fields: ['id', 'openid', 'spot_id', 'custom_name', 'sort_order', 'is_active', 'created_at']
  },
  {
    name: 'catch_logs',
    fields: [
      'id',
      'openid',
      'spot_id',
      'started_at',
      'ended_at',
      'species_json',
      'bait',
      'note',
      'weather_snapshot_json',
      'photo_local_paths_json',
      'created_at'
    ]
  },
  {
    name: 'tide_cache',
    fields: ['spot_id', 'date', 'tide_data_json', 'fetched_at']
  },
  {
    name: 'weather_cache',
    fields: ['spot_id', 'date', 'weather_data_json', 'fetched_at']
  }
]

module.exports = {
  COLLECTIONS
}
