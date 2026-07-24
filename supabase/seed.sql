-- Run this after schema.sql to create the first card: your own.
-- Edit the phone/whatsapp formatting here if you'd like a different display style.

insert into employees (slug, name, designation, phone, whatsapp, active)
values (
  'ferose-r-salahudeen',
  'Ferose R Salahudeen',
  'Managing Partner',
  '+919884977994',
  '+919600051672',
  true
)
on conflict (slug) do nothing;
