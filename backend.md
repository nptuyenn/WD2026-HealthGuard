# HealthGuard — Backend Plan (Hackathon Edition)

> Client: React Native / Expo mobile app (this repo).
> Backend: sibling repo `healthguard-api` — Node + Express, deployed to AWS.
> Scope: hackathon demo, not a production launch.

---

## 1. Scope

Multi-profile family health app. One account manages N family members. Four modules: Emergency Card, Medication Manager, Child Growth, Health Dashboard. Reminders via push (local) + email. Claude-powered Vietnamese health trend analysis.

---

## 2. Architecture

```
 [ Expo mobile app ]
       │  HTTPS + JWT
       ▼
 [ Elastic Beanstalk — Node/Express API ]  ──► [ Claude API ]
       │            │             │
       ▼            ▼             ▼
  [ RDS        [ S3 —       [ EventBridge Scheduler ]
  Postgres ]   media ]             │
                                   ▼
                             [ Lambda ]
                                   │
                                   ▼
                              [ SES ]   (+ Expo Push direct from app)
```

Public `/emergency/:token` route served by the same API, no auth.

---

## 3. Stack (locked)

### Mobile (this repo)
| Concern       | Library                                  |
| ------------- | ---------------------------------------- |
| Framework     | React Native + Expo                      |
| Build/deploy  | Expo EAS                                 |
| Local storage | AsyncStorage                             |
| Push          | Expo Notifications (local + remote)      |
| Charts        | **`victory-native`** (not Chart.js — DOM-only) |
| Camera / QR   | Expo Camera + `react-native-qrcode-svg`  |

### Backend
| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Runtime        | Node.js 20                               |
| Framework      | Express.js                               |
| Language       | TypeScript (optional — JS OK for speed)  |
| ORM            | Prisma                                   |
| Auth           | JWT + bcryptjs (no Cognito)              |
| Validation     | Zod                                      |
| AI             | Claude API (Anthropic direct, model `claude-sonnet-4-6`) |

### AWS
| Service                     | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| **Elastic Beanstalk**       | Hosts the Express API                            |
| **RDS PostgreSQL** (`db.t4g.micro`, free tier) | Primary database              |
| **S3**                      | Vaccine photos, generated PDFs                   |
| **EventBridge Scheduler**   | Fires reminder jobs                              |
| **Lambda**                  | Reminder dispatch (sends SES + updates DB)       |
| **SES** (sandbox mode)      | Email reminders — send only to verified addresses |
| **IAM**                     | Roles for EB, Lambda, SES                        |
| **CloudWatch Logs**         | Free logging, enough for demo                    |

### Explicitly NOT used
CloudFront, WAF, KMS CMK, Cognito, ECS, App Runner, CDK, Secrets Manager, X-Ray, Sentry, Multi-AZ, blue/green, CodePipeline, staging environment.

---

## 4. Data Model (11 tables)

`health_profiles` is the hub. Every feature row links back to a profile.

| # | Table                    | Purpose                                     |
| - | ------------------------ | ------------------------------------------- |
| 1 | `users`                  | Account holder (email, password_hash)       |
| 2 | `health_profiles`        | Family members                              |
| 3 | `emergency_cards`        | Public-shareable card (UUID token)          |
| 4 | `medications`            | Cabinet inventory                           |
| 5 | `medication_schedules`   | Dosing schedule                             |
| 6 | `medication_logs`        | Taken / missed history                      |
| 7 | `appointments`           | Follow-up & check-ups                       |
| 8 | `vaccinations`           | TCMR & voluntary vaccines (+ photo S3 key)  |
| 9 | `growth_records`         | Height / weight / head circumference        |
| 10 | `health_metrics`         | BP, glucose, HR, SpO₂…                     |
| 11 | `reminder_events`        | Queue for scheduler (optional for MVP)      |

All tables: `id UUID`, `created_at`, `updated_at`. Every query filters by `user_id` through the profile.

---

## 5. API (all routes under `/api/v1`)

### Auth
- `POST /auth/register`
- `POST /auth/login` → returns JWT
- `GET  /me`

### Profiles
- `GET/POST/PATCH/DELETE /profiles`

### Emergency Card
- `GET/POST/PATCH/DELETE /profiles/:id/emergency-card`
- `POST /profiles/:id/emergency-card/rotate-token`
- `GET  /emergency/:token` — **public**, rate-limited

### Medication Manager
- `GET/POST/PATCH/DELETE /profiles/:id/medications`
- `GET/POST/PATCH/DELETE /medications/:id/schedules`
- `POST /schedules/:id/log`
- `GET/POST/PATCH/DELETE /profiles/:id/appointments`

### Child Growth
- `GET/POST/PATCH/DELETE /profiles/:id/vaccinations`
- `POST /vaccinations/:id/photo` → S3 presigned PUT URL
- `GET/POST/PATCH/DELETE /profiles/:id/growth-records`
- `GET  /profiles/:id/growth-chart?standard=who`

### Health Dashboard
- `GET/POST/PATCH/DELETE /profiles/:id/metrics`
- `GET  /profiles/:id/metrics/alerts`
- `POST /profiles/:id/metrics/analyze` → Claude Vietnamese trend summary

---

## 6. Security (hackathon-grade)

Just the essentials:
1. Passwords hashed with bcrypt (cost 10).
2. JWT signed with a secret in an EB environment variable.
3. Every query filtered by authenticated `user_id`.
4. Emergency tokens are UUIDv4, rotatable.
5. Claude system prompt: no diagnosis, no dosage advice, append "Tham khảo bác sĩ" disclaimer.
6. HTTPS via EB-provided ACM cert.

Skip: KMS CMK, WAF, VPC private subnets, MFA, PDPL export/delete endpoints, pentest.

---

## 7. Deployment

### Mobile
`eas build` → `eas submit` (or direct download of dev build for judges).

### Backend
```bash
eb init            # once
eb create hg-api   # first deploy
eb deploy          # subsequent
```
Set env vars in EB console: `DATABASE_URL`, `JWT_SECRET`, `CLAUDE_API_KEY`, `AWS_REGION`, `S3_BUCKET`.

### Reminders Lambda
Deploy via `aws lambda update-function-code` or the console. EventBridge Scheduler triggers it on schedules created by the API.

### CI/CD
Skipped. Deploy manually when things are ready.

---

## 8. Phased Delivery (hackathon-compressed)

| # | Phase                | Deliverable                                                         |
| - | -------------------- | ------------------------------------------------------------------- |
| 0 | **Foundation**       | Repo, Express + Prisma, RDS connected, EB deployed, `/health` route |
| 1 | **Auth + Profiles**  | Register / login / JWT middleware / profiles CRUD                   |
| 2 | **Emergency Card**   | CRUD + public `/emergency/:token` + QR on mobile                    |
| 3 | **Medication**       | Medications + schedules + EventBridge + Lambda + SES reminder       |
| 4 | **Child Growth**     | Vaccinations (+ S3 photo upload) + growth records + WHO z-score     |
| 5 | **Health Dashboard** | Metrics CRUD + threshold alerts + Claude `analyze` endpoint         |
| 6 | **Demo polish**      | Seed data, screen recordings, pitch script                          |

Each phase is independently demoable. If time runs out, ship what's done — the architecture doesn't require the full set.

---

## 9. Out of Scope (hackathon)

- PDF report export (fake with a screenshot of the dashboard if judges ask)
- Offline sync
- Admin console
- Multi-region / Multi-AZ
- Real MFA / password reset flow
- Production SES access (judges must use a verified demo inbox)
- Full PDPL compliance (note it in the pitch, don't build it)

---

## 10. The 4 open questions from the prior plan

Deferred — not blockers for a hackathon. Note them on the "future work" slide:
1. Data controller entity
2. MOH TCMR dataset source
3. FCM/APNs vs Expo Push
4. Legal sign-off on Claude disclaimers
