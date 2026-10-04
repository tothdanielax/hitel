# Banks

Researched on 2026-10-04.

## Summary

- No Hungarian bank has a public API for mortgage products, rates, THM or fees
- Every bank developer portal is a PSD2 (Berlin Group) gateway: account information, payment initiation and confirmation of funds only
- Production PSD2 access needs a PSD2 licence and an eIDAS QWAC certificate, which is not possible for a static site
- The MNB tools (minositetthitel.hu, hitelvalaszto.mnb.hu) have no API or download. Reading them would be scraping, which this project does not do
- Each bank file in `packages/core/src/banks/` exports hand-maintained static rates with an `asOf` date and a source URL. Refresh them from the bank's lakáshitel hirdetmény

## How comparison sites get rates

Sites like Bankmonitor (<https://bankmonitor.hu/lakashitel-kalkulator/>), Bank360 and money.hu are licensed credit intermediaries. They keep their own product database, which they say is updated daily from the banks' public hirdetmény documents and backed by commission agreements with the banks. Their calculators call a private backend, not a public API, so using it would be scraping.

Ways to get fresher data without scraping:

- Data partnership: ask an intermediary (Bankmonitor, Bank360, money.hu) or the banks for a licensed feed
- Hirdetmény parsing: banks must publish these PDFs, a scheduled CI job could parse them into the bank files (borderline, needs an explicit decision)
- Until then: hand-maintained defaults that users can override in the app

## Per-bank API status

| Bank       | API            | Portal                                    | Auth                                | Mortgage data                                                                   |
| ---------- | -------------- | ----------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| OTP        | PSD2 only      | <https://www.otpbank.hu/portal/en/psd2>   | TPP registration, QWAC + QSealC     | No                                                                              |
| K&H        | PSD2 only      | <https://www.kh.hu/web/kh-api/home>       | Registration, QWAC                  | No                                                                              |
| MBH        | PSD2 only      | <https://portal.sandbox2.mbhbank.hu/>     | Registration, QWAC                  | No                                                                              |
| Raiffeisen | PSD2 only      | <https://developer.raiffeisen.hu/start>   | Sandbox key, QWAC in production     | No                                                                              |
| Erste      | PSD2 only (HU) | <https://developers.erstegroup.com>       | API key sandbox, QWAC in production | No (a mortgage calculator API exists for other countries, not confirmed for HU) |
| CIB        | PSD2 only      | <https://api.cib.hu>                      | Registration, QWAC                  | No                                                                              |
| UniCredit  | PSD2 only      | <https://developer.unicredit.eu>          | Registration, QWAC                  | No                                                                              |
| Gránit     | PSD2 only      | <https://granitbank.hu/fejlesztoi-portal> | Registration, QWAC                  | No                                                                              |
| MagNet     | PSD2 only      | <https://demo.magnetbank.hu/psd2/doc/>    | OAuth2 + QWAC                       | No                                                                              |

## Market benchmark API

The ECB Data Portal (no auth SDMX REST, CORS not verified - it returned 504 when checked, so fetch it at build time rather than from the browser) returns Hungarian MFI interest rate statistics reported by the MNB. These are market averages, not per-bank offers, published monthly with about 6 weeks lag.

- Series key: `MIR.M.HU.B.A2C.{F|I|O|P|A}.{R|C}.A.2250.HUF.N`
  - `F`: fixation up to 1 year, `I`: 1-5 years, `O`: 5-10 years, `P`: over 10 years, `A`: all
  - `R`: agreed rate, `C`: THM (APRC)
- Example: <https://data-api.ecb.europa.eu/service/data/MIR/M.HU.B.A2C.O.R.A.2250.HUF.N?lastNObservations=1&format=jsondata>
- August 2026: all fixations 7.15% (THM 7.27%), up to 1 year 7.44%, 1-5 years 7.40%, 5-10 years 6.18%, over 10 years 6.66%

## Other sources checked

- MNB Statisztika (statisztika.mnb.hu): xlsx downloads only, no REST API
- KSH open data API: no interest rate datasets
- MFL criteria: <https://www.mnb.hu/letoltes/minositett-fogyasztobarat-lakashitel.pdf>

## Static rate sources

Headline rates come from news and aggregator articles (Telex 2026-09-26, biztosdontes.hu 2026-08-08 and 2026-10-04). Check them against each bank's hirdetmény before relying on them. The values live in the bank files.
