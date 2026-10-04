# Public factor catalogue

Contains public sector information licensed under the Open Government Licence v3.0.

UK DESNZ 2026, flat-format workbook v1.2:
https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026
Licence: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

ADEME Base Carbone v23.6, publisher update 30 June 2026:
https://data.ademe.fr/datasets/base-carboner
Licence: https://www.etalab.gouv.fr/licence-ouverte-open-licence/

Records keep publisher values and units. Only direct total CO2e factors are included. Separate gas components, decomposition rows, missing totals and archived/specific ADEME records are excluded. Validity strings are normalized where possible; expired and unresolved records are review-only, not selectable. ADEME modification dates are not measurement years. These are activity emission factors, not full lifecycle inventories and not an India-specific factor library. No publisher endorsement is implied.

Rebuild with Python requests installed:
`python3 scripts/buildPublicFactors.py --as-of YYYY-MM-DD`
then `node scripts/buildUkFactors.cjs /path/to/original-uk-workbook.xlsx`.
No paid libraries or API subscriptions are used. Scripts overwrite their own publisher records rather than adding duplicates. Review publisher versions and licences before refreshing.
