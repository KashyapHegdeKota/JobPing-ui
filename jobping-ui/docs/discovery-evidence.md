# International-student and pay filters

Cards show explicit role CPT/OPT/STEM OPT and sponsorship statements, separately
dated employer history, and employer-posted compensation. Open “Eligibility & pay
evidence” for source excerpts and official records. Unknown information is stated
explicitly. A company with H-1B history can still decline sponsorship for a role.

Use “Role policy” to select explicitly accepted roles, “Employer has H-1B history”
for matched official history, or “Posted pay available” for employer-advertised pay.
Minimum pay compares the advertised lower bound in the selected currency and
hour/week/month/year period. No conversion or salary estimates are included.
Ranges with an unstated period do not match a minimum filter.

Filters persist in shareable URLs and are sent to the backend on every page
request. Changing filters resets pagination and rejects stale responses. Optional
metadata is validated before rendering from HTTP and live events; updates preserve
known fields when older producers omit them. A new repost can explicitly clear its
prior pay. Employer-only history imports require a feed reload.

Deploy the backend migration and API before this UI. Existing jobs initially show
unknown until ingestion revisits their sources; company history needs an official
reviewed import. See the sibling backend's `docs/international-students-and-pay.md`.
These filters do not collect a user's visa status or add it to activity analytics.
