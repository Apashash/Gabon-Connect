---
name: AshtechPay Gabon config
description: Paramètres exacts pour appeler l'API AshtechPay pour le Gabon (Mobile Money Airtel/Moov).
---

## Paramètres POST /v1/collect pour le Gabon

```json
{
  "country_code": "GA",
  "currency": "XAF",
  "operator": "Airtel Money",   // ou "Moov Money"
  "phone": "06XXXXXXXX",
  "amount": 1200,
  "reference": "FG-XXXXXXXX"
}
```

**Why:** La doc AshtechPay liste le Gabon avec currency "XAFG" en affichage, mais l'endpoint `/v1/collect` utilise "XAF" (code ISO standard pour le franc CFA). Les noms d'opérateurs exacts sont "Airtel Money" et "Moov Money".

**How to apply:** Utiliser ces valeurs exactes dans les routes `/api/paiement/initier` et `/api/paiement/otp`.

Flux pour le Gabon : USSD Push (202 pending) — le client valide sur son téléphone. Pas d'OTP USSD pour Airtel/Moov Gabon en théorie, mais gérer quand même le cas `otp_required`.
