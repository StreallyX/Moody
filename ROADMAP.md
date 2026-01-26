# MOODY - Roadmap de Production

> Document de suivi pour finaliser l'app et la publier sur les stores.

---

## SITUATION ACTUELLE

- **App supprimée** de Google Play (non-conformité API 35 - déjà corrigé dans le code)
- **Bloqué** : besoin de 12 testeurs pendant 14 jours avant accès production
- **Solution** : Finaliser l'app PUIS lancer le test fermé

---

## PHASE 1 : Finaliser le code (AVANT test fermé)

> Objectif : Avoir une app complète à soumettre aux testeurs

### 1.1 Système de paiements (Code)

#### Fait
- [x] Service purchaseService.ts
- [x] PurchaseContext intégré dans _layout.tsx
- [x] Paywall component
- [x] Hook usePurchases
- [x] Gestion offline (cache local)
- [x] Sync entitlements avec stockage local
- [x] Gestion gracieuse si RevenueCat non configuré

#### À vérifier
- [ ] Test du flow complet paywall → achat → unlock mode
- [ ] Message d'erreur user-friendly si échec
- [ ] Bouton "Restore Purchases" fonctionnel

---

### 1.2 Système d'affiliation/Créateurs (Code)

#### Fait
- [x] affiliateService.ts (génération codes, stats, commissions)
- [x] payoutService.ts (Stripe Connect)
- [x] useAffiliate hook
- [x] useReferral hook
- [x] AffiliateDashboard component
- [x] Validation anti-fraude
- [x] Types TypeScript

#### À faire (Code)
- [ ] **Créer écran affiliate** :
  ```
  app/affiliate.tsx
  ```
- [ ] Ajouter lien vers affiliate dans profil/menu
- [ ] Input code parrain sur écran inscription (optionnel v1)
- [ ] Appliquer code parrain après signup (optionnel v1)

> **Note** : Le système Stripe Connect nécessite un backend. Pour la v1,
> on peut lancer sans les payouts automatiques et les faire manuellement.

---

### 1.3 Autres vérifications code

- [ ] Pas de `console.log` inutiles (ou les wrapper en `__DEV__`)
- [ ] Pas de données de test en dur
- [ ] Tous les textes traduits (FR/EN)
- [ ] Gestion des erreurs user-friendly partout

---

## PHASE 2 : Tests locaux (AVANT test fermé)

### 2.1 Tests fonctionnels

#### Parcours utilisateur
- [ ] Nouveau joueur : lancer partie mode gratuit (friends)
- [ ] Nouveau joueur : tenter mode caliente → demande login
- [ ] Nouveau joueur : s'inscrire
- [ ] Joueur connecté : accéder mode caliente
- [ ] Joueur : tenter mode couples → paywall
- [ ] Joueur : reprendre partie sauvegardée
- [ ] Joueur : changer de langue (FR/EN)
- [ ] Joueur : voir écran affiliate (si implémenté)

#### Edge cases
- [ ] App offline : vérifier accès modes débloqués en cache
- [ ] Session expirée : comportement correct
- [ ] Paywall sans RevenueCat configuré : message "Coming soon"
- [ ] Pas de connexion internet : message approprié

### 2.2 Tests de performance

- [ ] Temps de démarrage < 3 secondes
- [ ] Transitions fluides (pas de freeze)
- [ ] Pas de crash après 30+ tours de jeu

### 2.3 Tests appareils (ce que tu as sous la main)

- [ ] Ton téléphone principal
- [ ] Émulateur Android Studio (différentes tailles)
- [ ] Un autre téléphone si possible

---

## PHASE 3 : Préparer les assets Store

> Tu peux préparer tout ça pendant que tu codes

### 3.1 Assets visuels

- [ ] **Icône** haute résolution (512x512 PNG)
- [ ] **Feature graphic** (1024x500 PNG) - bannière promotionnelle
- [ ] **Screenshots** (min 4 recommandé) :
  - [ ] Écran d'accueil avec joueurs
  - [ ] Menu des modes de jeu
  - [ ] Écran de jeu (défi en cours)
  - [ ] Paywall premium
  - [ ] (optionnel) Écran de fin de partie
  - [ ] (optionnel) Mini-jeu

> Astuce : Utilise un émulateur en 1080x1920 pour des screenshots propres

### 3.2 Textes Store

- [ ] **Titre** : "Moody - Jeu à boire" (30 car. max)
- [ ] **Description courte** (80 car.) :
  ```
  Le jeu à boire ultime entre amis ! Défis, gages et mini-jeux délirants.
  ```
- [ ] **Description longue** (4000 car.) : voir template ci-dessous
- [ ] **Politique de confidentialité** : URL publique obligatoire

<details>
<summary>Template description longue</summary>

```
🎉 MOODY - Le jeu à boire nouvelle génération !

Transformez vos soirées entre amis avec des centaines de défis hilarants, des gages épicés et des mini-jeux addictifs.

🍻 3 MODES DE JEU
• Friends : Parfait pour débuter, défis fun et accessibles
• Caliente : Montez la température avec des gages plus osés
• Couples : Mode spécial pour les duos (Premium)

🎮 FONCTIONNALITÉS
• 500+ défis et gages variés
• Mini-jeux intégrés
• Sauvegarde automatique de partie
• Mode hors-ligne disponible
• Multilingue (FR/EN)

👑 PREMIUM
Débloquez tous les modes et contenus exclusifs !

⚠️ À consommer avec modération. Jeu réservé aux +18 ans.
```
</details>

### 3.3 Informations légales

- [ ] **Politique de confidentialité** hébergée (GitHub Pages, Notion, site web)
- [ ] **Conditions d'utilisation** (optionnel mais recommandé)
- [ ] **Email de contact** développeur
- [ ] **Adresse** (obligatoire pour Google Play)

---

## PHASE 4 : Configuration Google Play + RevenueCat

> À faire AVANT de lancer le test fermé pour tester les achats

### 4.1 Produits Google Play Console

Même avec app supprimée, tu peux créer les produits :

**Aller dans** : Monétisation > Produits > Abonnements

| Product ID | Type | Prix suggéré |
|------------|------|--------------|
| `moody_premium_monthly` | Abonnement | 4,99€/mois |
| `moody_premium_annual` | Abonnement | 29,99€/an |
| `moody_premium_lifetime` | Produit unique | 49,99€ |

- [ ] Créer `moody_premium_monthly`
- [ ] Créer `moody_premium_annual`
- [ ] Créer `moody_premium_lifetime`
- [ ] Activer chaque produit

### 4.2 Service Account (pour RevenueCat)

**Aller dans** : Configuration > Accès API

- [ ] Créer un Service Account
- [ ] Donner les droits "Données financières"
- [ ] Télécharger le fichier JSON
- [ ] Garder ce fichier en sécurité !

### 4.3 License Testing

**Aller dans** : Configuration > Tests de licence

- [ ] Ajouter ton email personnel
- [ ] Ajouter emails de tes futurs testeurs

### 4.4 Configuration RevenueCat

**Sur** : https://app.revenuecat.com

#### Connecter Google Play
- [ ] Project Settings > Apps > Android
- [ ] Uploader le Service Account JSON

#### Créer les Products
- [ ] `moody_monthly` → `moody_premium_monthly`
- [ ] `moody_annual` → `moody_premium_annual`
- [ ] `moody_lifetime` → `moody_premium_lifetime`

#### Créer les Entitlements
- [ ] `premium` (associer les 3 products)

#### Créer l'Offering
- [ ] Nom : `default`
- [ ] Ajouter packages : monthly, annual, lifetime
- [ ] Marquer comme "Current Offering"

#### Clé API Production
- [ ] Copier la clé `goog_xxxxxxxx`
- [ ] Mettre à jour `.env` :
  ```
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx
  ```

---

## PHASE 5 : Build et Test fermé

### 5.1 Build de production

- [ ] Vérifier `app.json` :
  - version: "1.0.0" (ou plus)
  - versionCode: 3 (ou plus)
- [ ] S'assurer d'avoir la keystore
- [ ] Build :
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Télécharger l'AAB
- [ ] Installer et tester sur ton téléphone

### 5.2 Créer le test fermé

**Google Play Console** : Tests > Test fermé

- [ ] Créer une nouvelle version
- [ ] Uploader l'AAB
- [ ] Ajouter notes de version
- [ ] Sélectionner pays (France, Belgique, Suisse, Canada...)
- [ ] Publier la version de test

### 5.3 Créer liste de testeurs

- [ ] Créer un groupe de testeurs (email list)
- [ ] Ajouter les emails des testeurs
- [ ] Envoyer le lien d'inscription aux testeurs

---

## PHASE 6 : Période de test fermé (14 jours)

### 6.1 Recrutement testeurs (minimum 12, vise 15+)

**Sources pour trouver des testeurs :**
- Amis et famille
- Collègues
- Groupes Discord (gaming, dev, soirées)
- Reddit : r/betatesting, r/androidapps, r/france
- Twitter/X
- Groupes Facebook

**Liste des testeurs :**
| # | Nom/Email | Inscrit ? | Actif ? |
|---|-----------|-----------|---------|
| 1 | | [ ] | [ ] |
| 2 | | [ ] | [ ] |
| 3 | | [ ] | [ ] |
| 4 | | [ ] | [ ] |
| 5 | | [ ] | [ ] |
| 6 | | [ ] | [ ] |
| 7 | | [ ] | [ ] |
| 8 | | [ ] | [ ] |
| 9 | | [ ] | [ ] |
| 10 | | [ ] | [ ] |
| 11 | | [ ] | [ ] |
| 12 | | [ ] | [ ] |
| 13 (bonus) | | [ ] | [ ] |
| 14 (bonus) | | [ ] | [ ] |
| 15 (bonus) | | [ ] | [ ] |

### 6.2 Suivi des 14 jours

| Jour | Date | Action | Fait |
|------|------|--------|------|
| J1 | ___/___/___ | Lancement test fermé | [ ] |
| J3 | ___/___/___ | Vérifier inscriptions, relancer si besoin | [ ] |
| J7 | ___/___/___ | Collecter premier feedback | [ ] |
| J10 | ___/___/___ | Corriger bugs critiques si besoin | [ ] |
| J14 | ___/___/___ | Fin période minimale ! | [ ] |

### 6.3 Collecte de feedback

- [ ] Créer Google Form simple :
  - Note globale (1-5)
  - Bugs rencontrés ?
  - Suggestions ?
  - Achèteriez-vous Premium ?

**Bugs reportés :**
1. ________________________________
2. ________________________________
3. ________________________________

**Suggestions :**
1. ________________________________
2. ________________________________

---

## PHASE 7 : Publication Production

### 7.1 Pré-requis (vérifier)

- [ ] 14 jours de test fermé passés
- [ ] 12+ testeurs ont été actifs
- [ ] Bugs critiques corrigés
- [ ] Paiements testés par au moins 1 testeur
- [ ] Toutes les infos Store remplies

### 7.2 Demande d'accès production

- [ ] Aller dans : Production > Tableau de bord
- [ ] Cliquer "Demander accès production"
- [ ] Répondre au questionnaire Google
- [ ] Soumettre

### 7.3 Soumettre la version production

- [ ] Build finale (si corrections depuis test fermé)
- [ ] Uploader AAB dans Production
- [ ] Notes de version
- [ ] Envoyer pour review

### 7.4 Review Google (2-7 jours)

Pendant l'attente :
- [ ] Préparer communication (réseaux sociaux)
- [ ] Préparer landing page (optionnel)
- [ ] Vérifier que tout est prêt côté Stripe/RevenueCat

### 7.5 Post-publication

- [ ] Vérifier app visible sur Play Store
- [ ] Télécharger depuis le store et tester
- [ ] Faire un achat réel de test
- [ ] Annoncer sur les réseaux
- [ ] Monitorer les avis et crashs

---

## PHASE 8 : iOS (Plus tard)

> À faire après que Android fonctionne bien

- [ ] Compte Apple Developer ($99/an)
- [ ] App Store Connect : créer l'app
- [ ] Créer produits in-app iOS (mêmes prix)
- [ ] Connecter RevenueCat à App Store
- [ ] Ajouter clé iOS dans `.env`
- [ ] Build iOS : `eas build --platform ios`
- [ ] Screenshots iOS (différentes tailles)
- [ ] Soumettre pour review Apple (plus stricte que Google)

---

## CALENDRIER RÉALISTE

```
SEMAINE 1
├── Lun-Mar : Finaliser code (écran affiliate, derniers bugs)
├── Mer-Jeu : Tests locaux complets
├── Ven : Préparer assets Store + créer produits Google Play
└── Sam-Dim : Configurer RevenueCat + Build production

SEMAINE 2
├── Lun : Lancer test fermé + recruter testeurs
├── Mar-Dim : Recruter jusqu'à 12+ testeurs
└── Collecter premier feedback

SEMAINE 3
├── Corriger bugs remontés
├── Continuer à monitorer les testeurs
└── Préparer communication de lancement

SEMAINE 4
├── Fin des 14 jours (autour de J14)
├── Demander accès production
└── Soumettre version production

SEMAINE 5
├── Attendre review Google (2-7 jours)
└── 🎉 PUBLICATION !
```

**Durée totale estimée : 4-5 semaines**

---

## CHECKLIST RAPIDE (copier/coller)

```
AVANT TEST FERMÉ :
[ ] Code finalisé et testé
[ ] Assets Store prêts (icône, screenshots, textes)
[ ] Produits créés dans Google Play
[ ] RevenueCat configuré
[ ] Build production faite et testée

PENDANT TEST FERMÉ (14 jours) :
[ ] 12+ testeurs inscrits et actifs
[ ] Feedback collecté
[ ] Bugs critiques corrigés

APRÈS TEST FERMÉ :
[ ] Demander accès production
[ ] Soumettre version finale
[ ] Attendre review
[ ] Publier !
```

---

## LIENS UTILES

- **Google Play Console** : https://play.google.com/console
- **RevenueCat** : https://app.revenuecat.com
- **Supabase** : https://supabase.com/dashboard
- **EAS Build** : https://expo.dev/builds

---

## NOTES IMPORTANTES

⚠️ **Sécurité**
- Ne JAMAIS commiter les clés API de production
- Sauvegarder la keystore Android (si perdue = nouvelle app)
- Garder les credentials Google Play Service Account en sécurité

📝 **À documenter quelque part**
- Accès Google Play Console
- Accès RevenueCat
- Accès Supabase
- Accès Stripe (quand configuré)
- Keystore password et alias

---

*Dernière mise à jour : Janvier 2026*
