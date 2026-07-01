# Plan: Add services/amenities fields to Listing show page

## Information gathered
- `views/listings/show.ejs` currently renders: title, image, owned by, description, price, location, country, reviews, map.
- `models/listing.js` currently has no `services`/`amenities` fields.
- `schema.js` Joi `listingSchema` currently validates only title, image, description, price, location, country.
- `views/listings/new.ejs` and `views/listings/edit.ejs` do not include any inputs besides title/description/image/price/country/location.

## Decision (per user)
Use **Services/Amenities only** below Country.

## Code update plan
1. Update `models/listing.js`
   - Add optional fields: `services` (String), `amenities` (String)
2. Update `schema.js`
   - Extend Joi validation for `listing[services]` and `listing[amenities]` as optional strings (allow empty).
3. Update `views/listings/new.ejs`
   - Add inputs for `listing[services]` and `listing[amenities]`.
4. Update `views/listings/edit.ejs`
   - Add inputs for `listing[services]` and `listing[amenities]` (pre-filled).
5. Update `views/listings/show.ejs`
   - Render the fields right below Country using conditional blocks so empty values don’t show.
6. Update `TODO.md` checklist.

## Dependent files
- models/listing.js
- schema.js
- views/listings/new.ejs
- views/listings/edit.ejs
- views/listings/show.ejs
- TODO.md

## Followup steps
- Run server and create a listing.
- Verify services/amenities appear on the show page below Country.
