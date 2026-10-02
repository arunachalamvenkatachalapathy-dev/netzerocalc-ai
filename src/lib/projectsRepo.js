import { supabase } from './supabase.js';

// Projects live in public.projects (see supabase/migrations). Row level security
// restricts every query to the signed-in user, so no user filter is needed here.

export async function loadUserProjects() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('projects')
    .select('data')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map((row) => row.data);
}

export async function saveUserProjects(projects) {
  if (!supabase || !projects?.length) return;
  const rows = projects
    .filter((project) => project?.id)
    .map((project) => ({ id: String(project.id), name: project.projectName || null, data: project }));
  if (!rows.length) return;
  const { error } = await supabase.from('projects').upsert(rows, { onConflict: 'user_id,id' });
  if (error) throw error;
}

export async function deleteUserProject(projectId) {
  if (!supabase || !projectId) return;
  const { error } = await supabase.from('projects').delete().eq('id', String(projectId));
  if (error) throw error;
}
