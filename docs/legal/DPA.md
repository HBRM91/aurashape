# Data Processing Agreement (DPA)

*Between Aurashape (Data Controller) and Supabase, Inc. (Data Processor)*  
*Effective: August 2026*

## 1. Scope

This DPA governs the processing of personal data by Supabase on behalf of Aurashape. Aurashape acts as Data Controller; Supabase acts as Data Processor.

## 2. Processing Details

| Item | Detail |
|---|---|
| Subject matter | Hosting and authentication for health companion app |
| Duration | Duration of Aurashape's Supabase subscription |
| Nature | Database hosting (PostgreSQL), file storage, authentication |
| Purpose | Provide backend infrastructure for Aurashape |
| Personal data | Email, display name, OAuth ID, health goals, food logs, workout logs, body measurements, progress photos, push tokens |
| Data subjects | Aurashape app users (EU residents) |

## 3. Sub-processors

Supabase uses AWS (eu-central-1, Frankfurt) as its infrastructure provider. Supabase's sub-processor list is maintained at supabase.com/legal/dpa.

## 4. Technical & Organizational Measures (TOMs)

- **Encryption at rest**: AES-256 for all database and file storage
- **Encryption in transit**: TLS 1.3 for all connections
- **Access control**: Row-Level Security (RLS) policies per user
- **Authentication**: JWT-based with role separation (anon vs authenticated)
- **Backups**: Daily automated backups with point-in-time recovery
- **Monitoring**: 24/7 infrastructure monitoring
- **Data residency**: All data stored in EU (Frankfurt region)

## 5. Data Subject Rights

Aurashape will handle all data subject requests (access, rectification, deletion, portability). Supabase provides technical means (APIs, SQL access) to fulfill these requests within 30 days.

## 6. Breach Notification

Supabase will notify Aurashape of any personal data breach without undue delay (within 72 hours of discovery). Aurashape will notify affected users and the relevant supervisory authority as required by GDPR Art. 33-34.

## 7. Data Deletion

Upon account deletion by the user, Aurashape will cascade-delete all associated data from Supabase within 30 days. Supabase will permanently erase data from backups within 90 days of deletion.

## 8. Audit Rights

Aurashape may request evidence of compliance and may conduct audits (with 30 days notice). Supabase maintains SOC 2 Type II and ISO 27001 certifications.

## 9. Liability

Supabase's liability is governed by Aurashape's Supabase Terms of Service. This DPA does not modify the liability cap.

## 10. Supabase DPA Reference

This document supplements Supabase's standard DPA available at supabase.com/legal/dpa. In case of conflict, the Supabase standard DPA prevails for matters specific to Supabase's processing.
