import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

const projectsCollection = (uid) => collection(db, 'users', uid, 'projects');
export async function loadUserProjects(uid) {
  if (!db || !uid) return null;
  const snapshot = await getDocs(query(projectsCollection(uid), orderBy('updatedAt', 'desc')));
  return snapshot.docs.map((item) => item.data());
}
export async function saveUserProject(uid, project) {
  if (!db || !uid || !project?.id) return;
  await setDoc(doc(db, 'users', uid, 'projects', project.id), { ...project, updatedAt: serverTimestamp() }, { merge: true });
}
export async function deleteUserProject(uid, projectId) {
  if (!db || !uid || !projectId) return;
  await deleteDoc(doc(db, 'users', uid, 'projects', projectId));
}
