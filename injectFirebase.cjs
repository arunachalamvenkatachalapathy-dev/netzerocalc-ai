const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const firebaseTags = `
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
`;
html = html.replace('<!-- Supabase -->', firebaseTags + '  <!-- Supabase -->');

const firebaseInit = `
    // Firebase Initialization
    const firebaseConfig = {
      apiKey: "{{FIREBASE_API_KEY}}",
      authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
      projectId: "{{FIREBASE_PROJECT_ID}}",
      storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
      messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
      appId: "{{FIREBASE_APP_ID}}"
    };

    let firebaseApp = null;
    let db = null;
    if (firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' && firebaseConfig.apiKey !== '{{FIREBASE_API_KEY}}') {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
    }
`;

html = html.replace('// Supabase Initialization', firebaseInit + '\n    // Supabase Initialization');

fs.writeFileSync('index.html', html);
console.log("Firebase SDKs injected successfully.");
