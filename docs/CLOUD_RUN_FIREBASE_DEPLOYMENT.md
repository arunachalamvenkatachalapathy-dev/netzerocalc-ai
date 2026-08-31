# NetZeroCalc deployment

This deployment uses Firebase Authentication for sign-in, Firestore for per-user workspaces, Cloud Run for the application container, and Gemini on the backend. The Gemini key is read only from the `GEMINI_API_KEY` runtime variable, which should be injected from Secret Manager.

## One-time setup

1. Create or select a Google Cloud project and enable billing.
2. In Firebase Console, add a Web app, enable Email/Password Authentication, and create a Firestore database in production mode.
3. Add the Cloud Run URL to Firebase Authentication > Settings > Authorized domains after deployment.
4. Copy `.env.example` to a local, untracked `.env` and fill only the `VITE_FIREBASE_*` values from the Firebase Web app configuration. Never put a Gemini key in this file or in the repository.
5. Deploy the rules with `firebase deploy --only firestore:rules` after installing and signing in to the Firebase CLI.

## Cloud Run commands

```powershell
$PROJECT_ID = "your-google-cloud-project-id"
$REGION = "asia-south1"
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com
gcloud secrets create gemini-api-key --replication-policy=automatic
"PASTE_YOUR_GEMINI_KEY_ONLY_IN_THIS_TERMINAL" | gcloud secrets versions add gemini-api-key --data-file=-
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
npm run build
gcloud run deploy netzerocalc-ai --source . --region $REGION --allow-unauthenticated --set-env-vars="CORS_ORIGINS=*" --set-secrets="GEMINI_API_KEY=gemini-api-key:latest"
```

For the production build, create a local `.env` before `gcloud run deploy` so Vite embeds only the Firebase web configuration. Firebase web configuration is not a secret; Gemini keys, service-account keys, GitHub tokens, and user credentials are secrets and must never be embedded in frontend code.

## Verification

```powershell
gcloud run services describe netzerocalc-ai --region $REGION --format="value(status.url)"
curl.exe -fsS "https://YOUR_CLOUD_RUN_URL/health"
```

Open the Cloud Run URL, create a test account, create a project, refresh, and confirm the project remains. In Firestore, confirm it appears only under `users/{your-uid}/projects/{project-id}`. Test `/agent/chat` only while signed in; unauthenticated requests must return `401`.
