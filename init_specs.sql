INSERT INTO site_settings (key, value)
VALUES ('property_specs', '[
  { "id": "area", "label": "Área", "field": "area", "icon": "Maximize2", "color": "text-emerald-500", "suffix": "m²" },
  { "id": "rooms", "label": "Dorm", "field": "rooms", "icon": "Bed", "color": "text-blue-500" },
  { "id": "parking", "label": "Vagas", "field": "parking_spaces", "icon": "Car", "color": "text-amber-500" },
  { "id": "bathrooms", "label": "WC", "field": "bathrooms", "icon": "Bath", "color": "text-indigo-500" }
]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
