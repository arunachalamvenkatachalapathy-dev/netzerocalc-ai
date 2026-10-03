import { supabase } from './supabase.js';
// Optimistic concurrency: do not silently overwrite a newer API/browser save.
const versions = new Map();
let queue = Promise.resolve();
let conflicted = false;
export async function loadUserProjects() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('projects').select('id,data,updated_at').order('updated_at', { ascending: false });
  if (error) throw error;
  versions.clear(); conflicted = false;
  for (const row of data) versions.set(String(row.id), { updatedAt: row.updated_at, snapshot: JSON.stringify(row.data) });
  return data.map(row => row.data);
}
export function saveUserProjects(projects) {
  const run = queue.then(async () => {
    if (!supabase || !projects?.length) return;
    if (conflicted) throw new Error('A newer cloud version exists. Your local changes remain in this browser. Reload before editing; copy any unsaved work first.');
    for (const project of projects.filter(p => p?.id)) {
      const id = String(project.id), snapshot = JSON.stringify(project), version = versions.get(id);
      if (version?.snapshot === snapshot) continue;
      const row = { id, name: project.projectName || null, data: project };
      const query = version
        ? supabase.from('projects').update(row).eq('id', id).eq('updated_at', version.updatedAt)
        : supabase.from('projects').insert(row);
      const { data, error } = await query.select('id,updated_at').maybeSingle();
      if (error) { if (error.code === '23505') conflicted = true; throw error; }
      if (!data) { conflicted = true; throw new Error('Cloud save stopped: this project changed elsewhere. Local edits are preserved in this browser. Copy unsaved work, then reload.'); }
      versions.set(id, { updatedAt: data.updated_at, snapshot });
    }
  });
  queue = run.catch(() => {});
  return run;
}
export async function deleteUserProject(projectId) {
  await queue;
  if (!supabase || !projectId) return;
  const { error } = await supabase.from('projects').delete().eq('id', String(projectId));
  if (error) throw error;
  versions.delete(String(projectId));
}
export async function loadInventoryHistory(projectId, beforeId = null) {
  let query = supabase.from('inventory_history').select('*').eq('project_id', String(projectId)).order('id', { ascending: false }).limit(100);
  if (beforeId !== null) query = query.lt('id', beforeId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
